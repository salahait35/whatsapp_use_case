using System.Diagnostics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;
using Microsoft.VisualBasic;
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

        private async Task<List<Conversation>> GetConversationsForUserAsync(string email)
        {
            var query = $"SELECT * FROM c WHERE ARRAY_CONTAINS(c.members, @Email)";
            var queryDefinition = new QueryDefinition(query).WithParameter("@Email", email);

            var results = await _cosmosDbService.QueryItemsAsync<Conversation>("Conversations", queryDefinition.QueryText);
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
                $"SELECT * FROM c WHERE ARRAY_CONTAINS(c.members, '{currentUserEmail}') AND ARRAY_CONTAINS(c.members, '{request.Email}')");

            if (conversations.Any())
            {
                return BadRequest(new { message = "Une conversation existe déjà avec cet utilisateur." });
            }

            // Créez une nouvelle conversation
            var newConversation = new Conversation(new List<string> { currentUserEmail, request.Email });

            _logger.LogInformation("Document to insert: {Document}", JsonConvert.SerializeObject(newConversation));


            await _cosmosDbService.AddItemWithPartitionKeyAsync("Conversations", newConversation, newConversation.id);


            return Ok(new { message = "Conversation créée avec succès." });
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
    }

    public class CreateConversationRequest
    {
        public string Email { get; set; }
    }
}
