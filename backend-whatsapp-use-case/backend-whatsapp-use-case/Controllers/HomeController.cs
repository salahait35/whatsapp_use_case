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
            _logger.LogInformation("pour récup les conv" + (email));

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
            var conversations = results.ToList();


            return conversations;
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
            if (string.IsNullOrEmpty(message.Iv))
            {
                return BadRequest(new { message = "Le iv du message est requis." });
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
            var query = $"SELECT * FROM c WHERE c.conversationId = '{conversationId}' AND c.deleted = false ORDER BY c.timestamp ASC";

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
            var users = await _cosmosDbService.QueryItemsAsync<User>("Users", $"SELECT * FROM c WHERE c.email = '{request.Email}'");
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
            var newConversation = new Conversation(new List<string> { currentUserEmail, request.Email })
            {
                EncryptedSymmetricKeys = request.EncryptedSymmetricKeys
            };

            _logger.LogInformation("Document to insert: {Document}", JsonConvert.SerializeObject(newConversation));

            await _cosmosDbService.AddItemWithPartitionKeyAsync("Conversations", newConversation, newConversation.Id);

            return Ok(newConversation);
        }

        [HttpPost]
        [Route("api/user/getorcreate")]
        public async Task<IActionResult> GetOrCreateUserApiAsync([FromBody] UserRequest request)
        {
            _logger.LogInformation("Received request: {Request}", JsonConvert.SerializeObject(request));

            if (string.IsNullOrEmpty(request.Email))
            {
                _logger.LogWarning("Email is missing in the request.");
                return BadRequest(new { message = "L'email est requis." });
            }

            _logger.LogInformation("Email received: {Email}", request.Email);

            var user = await GetOrCreateUserAsync(request.Email, request.PublicKey);

            _logger.LogInformation("User retrieved or created: {User}", JsonConvert.SerializeObject(user));

            return Ok(user);
        }

        public async Task<User> GetOrCreateUserAsync(string email, string publicKey = null)
        {
            // Recherchez l'utilisateur par e-mail dans Cosmos DB
            var query = $"SELECT * FROM c WHERE c.email = '{email}'";
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
                PublicKey = publicKey // Enregistrer la clé publique si elle est fournie
            };

            await _cosmosDbService.AddItemAsync("Users", newUser);
            return newUser;
        }

        [HttpPost]
        [Route("api/user/exists")]
        public async Task<IActionResult> UserExistsApiAsync([FromBody] UserRequest request)
        {
            _logger.LogInformation("Received request: {Request}", JsonConvert.SerializeObject(request));

            if (string.IsNullOrEmpty(request.Email))
            {
                _logger.LogWarning("Email is missing in the request.");
                return BadRequest(new { message = "L'email est requis." });
            }

            _logger.LogInformation("Email received: {Email}", request.Email);

            var user = await GetUserByEmailAsync(request.Email);

            if (user != null)
            {
                _logger.LogInformation("User exists: {User}", JsonConvert.SerializeObject(user));
                return Ok(new { exists = true });
            }

            _logger.LogInformation("User does not exist.");
            return Ok(new { exists = false });
        }

        private async Task<User> GetUserByEmailAsync(string email)
        {
            var query = $"SELECT * FROM c WHERE c.email = '{email}'";
            var users = await _cosmosDbService.QueryItemsAsync<User>("Users", query);
            return users.FirstOrDefault();
        }


        [HttpPost]
        [Route("api/user/getpublickey")]
        public async Task<IActionResult> GetPublicKeyAsync([FromBody] UserRequest request)
        {
            _logger.LogInformation("Received request to get public key: {Request}", JsonConvert.SerializeObject(request));

            if (string.IsNullOrEmpty(request.Email))
            {
                _logger.LogWarning("Email is missing in the request.");
                return BadRequest(new { message = "L'email est requis." });
            }

            _logger.LogInformation("Email received: {Email}", request.Email);

            var user = await GetUserByEmailAsync(request.Email);

            if (user != null)
            {
                _logger.LogInformation("User found: {User}", JsonConvert.SerializeObject(user));
                return Ok(new { PublicKey = user.PublicKey });
            }

            _logger.LogInformation("User not found.");
            return NotFound(new { message = "Utilisateur non trouvé." });
        }

        [HttpPost]
        [Route("api/user/create")]
        public async Task<IActionResult> CreateUserApiAsync([FromBody] UserRequest request)
        {
            _logger.LogInformation("Received request to create user: {Request}", JsonConvert.SerializeObject(request));

            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.PublicKey))
            {
                _logger.LogWarning("Email or PublicKey is missing in the request.");
                return BadRequest(new { message = "L'email et la clé publique sont requis." });
            }

            // Vérifiez si l'utilisateur existe déjà
            var existingUser = await GetUserByEmailAsync(request.Email);
            if (existingUser != null)
            {
                _logger.LogInformation("User already exists: {User}", JsonConvert.SerializeObject(existingUser));
                return BadRequest(new { message = "L'utilisateur existe déjà." });
            }

            var newUser = new User
            {
                Email = request.Email,
                Username = request.Email.Split('@')[0], // Par défaut, utilisez la partie avant le @ comme nom d'utilisateur
                PublicKey = request.PublicKey
            };

            await _cosmosDbService.AddItemAsync("Users", newUser);
            _logger.LogInformation("User created: {User}", JsonConvert.SerializeObject(newUser));

            return Ok(newUser);
        }



        [HttpPost]
        [Route("api/messages/{messageId}/delete")]
        public async Task<IActionResult> DeleteMessageAsync(string messageId)
        {
            if (string.IsNullOrEmpty(messageId))
            {
                return BadRequest(new { message = "L'identifiant du message est requis." });
            }

            try
            {
                // Récupérer le message par ID
                var message = await _cosmosDbService.GetItemAsync<Message>("Messages", messageId);
                if (message == null)
                {
                    return NotFound(new { message = "Message non trouvé." });
                }

                // Mettre à jour le champ deleted à true
                message.Deleted = true;

                // Mettre à jour le message dans la base de données
                await _cosmosDbService.UpdateItemAsync("Messages", messageId, message);

                return Ok(new { message = "Message supprimé avec succès." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Une erreur est survenue lors de la suppression du message.", details = ex.Message });
            }
        }


        [HttpPost]
        [Route("api/messages/{messageId}/edit")]
        public async Task<IActionResult> EditMessageAsync(string messageId, [FromBody] EditMessageRequest request)
        {
            if (string.IsNullOrEmpty(messageId))
            {
                return BadRequest(new { message = "L'identifiant du message est requis." });
            }

            if (request == null || string.IsNullOrEmpty(request.Content) || string.IsNullOrEmpty(request.Iv))
            {
                return BadRequest(new { message = "Le nouveau contenu du message et l'IV sont requis." });
            }

            try
            {
                // Récupérer le message par ID
                var message = await _cosmosDbService.GetItemAsync<Message>("Messages", messageId);
                if (message == null)
                {
                    return NotFound(new { message = "Message non trouvé." });
                }

                // Mettre à jour le contenu du message et l'IV
                message.Content = request.Content;
                message.Iv = request.Iv;

                // Mettre à jour le message dans la base de données
                await _cosmosDbService.UpdateItemAsync("Messages", messageId, message);

                return Ok(new { message = "Message modifié avec succès." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Une erreur est survenue lors de la modification du message.", details = ex.Message });
            }
        }

        public class EditMessageRequest
        {
            public string Content { get; set; }
            public string Iv { get; set; }
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

        public Dictionary<string, string> EncryptedSymmetricKeys { get; set; }
    }

    public class UserRequest
    {
        public string Email { get; set; }
        public string PublicKey { get; set; }

    }
}