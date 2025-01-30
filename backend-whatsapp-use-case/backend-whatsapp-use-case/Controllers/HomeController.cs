using System.Diagnostics;
using Azure.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;
using Newtonsoft.Json;
using WebappWhatsapp.Models;
using User = WebappWhatsapp.Models.User;

namespace WebappWhatsapp.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly ICosmosDbService _cosmosDbService;

        public HomeController(ILogger<HomeController> logger, ICosmosDbService cosmosDbService)
        {
            _logger = logger;
            _cosmosDbService = cosmosDbService;
        }

        public async Task<IActionResult> Index()
        {
            ViewData["Title"] = "Messaging App";

            // Récupérez l'email de l'utilisateur connecté
            var email = User.Claims.FirstOrDefault(c => c.Type == "emails")?.Value;

            if (string.IsNullOrEmpty(email))
            {
                throw new Exception("L'utilisateur connecté n'a pas d'adresse e-mail.");
            }

            // Récupérez ou créez l'utilisateur
            var currentUser = await GetOrCreateUserAsync(email);

            // Initialisez le modèle
            var model = new ChatViewModel
            {
                CurrentUser = currentUser,
                Conversations = await GetConversationsForUserAsync(currentUser.Email), // Appel asynchrone
                Messages = new List<Message>() // Initialisez la liste pour éviter des erreurs
            };

            return View(model);
        }

        [HttpGet]
        [Route("api/conversations")]
        public async Task<IActionResult> GetConversationsForUserApiAsync()
        {
            // Récupérer l'email de l'utilisateur connecté
            var email = User.Claims.FirstOrDefault(c => c.Type == "emails")?.Value;

            _logger.LogInformation("pour récup les conv", JsonConvert.SerializeObject(email));
            _logger.LogInformation("pour récup les conv" +(email));


            if (string.IsNullOrEmpty(email))
            {
                return BadRequest(new { message = "Impossible de récupérer l'utilisateur connecté." });
            }

            var conversations = await GetConversationsForUserAsync(email);
            return Ok(conversations);
        }

        private async Task<List<Conversation>> GetConversationsForUserAsync(string email)
        {
            var query = $"SELECT * FROM c WHERE ARRAY_CONTAINS(c.participants,'{email}')";



            var results = await _cosmosDbService.QueryItemsAsync<Conversation>("Conversations", query);
            return results.ToList();
        }

        [HttpPost]
        [Route("api/conversations/{conversationId}/send_message")]
        public async Task<IActionResult> SendMessageAsync(string conversationId, [FromBody] Message message)
        {
            if (string.IsNullOrEmpty(conversationId))
            {
                return BadRequest(new { message = "L'identifiant de la conversation est requis." });
            }

            if (message == null)
            {
                return BadRequest(new { message = "Le message est requis." });
            }

            if (string.IsNullOrEmpty(message.SenderId))
            {
                return BadRequest(new { message = "L'identifiant de l'expéditeur est requis." });
            }

            if (string.IsNullOrEmpty(message.Content))
            {
                return BadRequest(new { message = "Le contenu du message est requis." });
            }

            message.ConversationId = conversationId;
            message.Timestamp = DateTime.UtcNow;
            message.Id = Guid.NewGuid().ToString();

            try
            {
                await _cosmosDbService.AddItemAsync("Messages", message);
                return Ok(message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Une erreur est survenue lors de l'envoi du message.", details = ex.Message });
            }
        }






        [HttpGet]
        [Route("api/conversations/{conversationId}/messages")]
        public async Task<IActionResult> GetMessagesForConversationAsyncAPI(string conversationId)
        {
            if (string.IsNullOrEmpty(conversationId))
            {
                return BadRequest(new { message = "L'identifiant de la conversation est requis." });
            }

            var messages = await GetMessagesForConversationAsync(conversationId);
            return Ok(messages);
        }

        private async Task<List<Message>> GetMessagesForConversationAsync(string conversationId)
        {
            var query = $"SELECT * FROM c WHERE c.conversationId = '{conversationId}' ORDER BY c.timestamp ASC";

            var results = await _cosmosDbService.QueryItemsAsync<Message>("Messages", query);
            return results.ToList();
        }


        [HttpPost]
        [Route("Conversation/Create")]
        public async Task<IActionResult> CreateConversationAsync([FromBody] CreateConversationRequest request)
        {
            if (string.IsNullOrEmpty(request.Email))
            {
                return BadRequest(new { message = "L'email est requis." });
            }

            _logger.LogInformation("Received request for conv: {Request}", JsonConvert.SerializeObject(request.Email));

            // Récupérer l'utilisateur connecté
            var currentUserEmail = User.Claims.FirstOrDefault(c => c.Type == "emails")?.Value;
            if (string.IsNullOrEmpty(currentUserEmail))
            {
                return BadRequest(new { message = "Impossible de récupérer l'utilisateur connecté." });
            }

            // Vérifiez si l'utilisateur avec cet email existe
            var users = await _cosmosDbService.QueryItemsAsync<User>("Users", $"SELECT * FROM c WHERE c.Email = '{request.Email}'");
            var selectedUser = users.FirstOrDefault();
            if (selectedUser == null)
            {
                return BadRequest(new { message = "Aucun utilisateur trouvé avec cet email." });
            }


            // Vérifiez si une conversation existe déjà
            var conversations = await _cosmosDbService.QueryItemsAsync<Conversation>("Conversations",
                $"SELECT * FROM c WHERE ARRAY_CONTAINS(c.participants, '{currentUserEmail}') AND ARRAY_CONTAINS(c.participants, '{request.Email}')");

            if (conversations.Any())
            {
                return BadRequest(new { message = "Une conversation existe déjà avec cet utilisateur." });
            }

            // Créez une nouvelle conversation
            var newConversation = new Conversation(new List<string> { currentUserEmail, request.Email });

            _logger.LogInformation("Document to insert: {Document}", JsonConvert.SerializeObject(newConversation));

            await _cosmosDbService.AddItemWithPartitionKeyAsync("Conversations", newConversation, newConversation.Id);

            return Ok(newConversation);
        }


        [HttpPost]
        [Route("api/user/getorcreate")]
        public async Task<IActionResult> GetOrCreateUserApiAsync([FromBody] EmailRequest request)
        {
            _logger.LogInformation("Received request: {Request}", JsonConvert.SerializeObject(request));

            if (string.IsNullOrEmpty(request.Email))
            {
                _logger.LogWarning("Email is missing in the request.");
                return BadRequest(new { message = "L'email est requis." });
            }

            _logger.LogInformation("Email received poooooooour ça : {Email}", request.Email);

            var user = await GetOrCreateUserAsync(request.Email);

            _logger.LogInformation("User retrieved or creasssssssssssssssssssssssssssssssssssssssssssssted: {User}", JsonConvert.SerializeObject(user));

            return Ok(user);
        }

        public async Task<User> GetOrCreateUserAsync(string email)
        {
            // Recherchez l'utilisateur par e-mail dans Cosmos DB
            var query = $"SELECT * FROM c WHERE c.Email = '{email}'";
            var users = await _cosmosDbService.QueryItemsAsync<User>("Users", query);

            // Vérifiez si un utilisateur existe
            var existingUser = users.FirstOrDefault();
            if (existingUser != null)
            {
                return existingUser;
            }

            // L'utilisateur n'existe pas, créez-le
            var newUser = new User
            {
                Email = email,
                Username = email.Split('@')[0], // Par défaut, utilisez la partie avant le @ comme nom d'utilisateur
            };

            await _cosmosDbService.AddItemAsync("Users", newUser);
            return newUser;
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [AllowAnonymous]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        [Authorize]
        [HttpGet]
        [Route("getallusers")]
        public async Task<IActionResult> GetAllUsersAsync()
        {
            var users = await _cosmosDbService.QueryItemsAsync<User>("Users", "SELECT * FROM c");
            return Ok(users);
        }
    }

    public class CreateConversationRequest
    {
        public string Email { get; set; }
    }

    public class EmailRequest
    {
        public string Email { get; set; }
    }
}