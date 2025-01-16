using Azure.Identity;
using Microsoft.Azure.Cosmos;
using Newtonsoft.Json;
using System;
using System.Threading.Tasks;

namespace WebappWhatsapp.Models
{
    // Définition de l'interface pour le service Cosmos DB
    public interface ICosmosDbService
    {
        Task AddUserAsync(User user); // Méthode pour ajouter un utilisateur
    }

    // Classe utilisateur
    public class User
    {
        [JsonProperty("id")]
        public required string id { get; set; } // ID unique requis par Cosmos DB
        public string Email { get; set; } = string.Empty;  // Ou utilisez nullable : public string? Email { get; set; }
        public string Username { get; set; } = string.Empty;  // Ou utilisez nullable : public string? Username { get; set; }

    }

    // Implémentation du service Cosmos DB
    public class CosmosDbService : ICosmosDbService
    {
        private readonly Container _container;

        public CosmosDbService(string accountEndpoint, string databaseName, string containerName)
        {
            // Utilisation d'un jeton AAD via DefaultAzureCredential
            var aadCredential = new DefaultAzureCredential();
            var cosmosClient = new CosmosClient(accountEndpoint, aadCredential);
            _container = cosmosClient.GetContainer(databaseName, containerName);
        }

        public async Task AddUserAsync(User user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            // S'assurer que l'ID est défini
            if (string.IsNullOrEmpty(user.id))
            {
                user.id = user.Email; // Par défaut, utiliser l'email comme identifiant
            }

            await _container.CreateItemAsync(user, new PartitionKey(user.id));
        }
    }
}
