using System.Diagnostics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;
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
            var Model = new ChatViewModel
            {
                CurrentUser =  currentUser,
                Conversations = GetConversationsForUser(currentUser.id),
               
                Messages = new List<Message>() // Initialisez la liste pour éviter des erreurs
            };

            return View(Model);
        }

        private List<Conversation> GetConversationsForUser(string userId)
        {
            var query = $"SELECT * FROM c WHERE c.UserId = '{userId}'";
            return _cosmosDbService.QueryItemsAsync<Conversation>("Conversations", query).Result.ToList();
        }

        private List<Message> GetMessagesForConversation(string conversationId)
        {
            if (string.IsNullOrEmpty(conversationId)) return new List<Message>();

            var query = $"SELECT * FROM c WHERE c.ConversationId = '{conversationId}'";
            return _cosmosDbService.QueryItemsAsync<Message>("Messages", query).Result.ToList();
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

        public async Task<User> GetOrCreateUserAsync(string email)
        {
            // Recherchez l'utilisateur par e-mail dans Cosmos DB
            var query = $"SELECT * FROM c WHERE c.Email = '{email}'";
            var users = await _cosmosDbService.QueryItemsAsync<User>("Users", query);

            // Vérifiez si un utilisateur existe
            var existingUser = users.FirstOrDefault();
            if (existingUser != null)
            {
                // L'utilisateur existe, renvoyez-le
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




    }
}
