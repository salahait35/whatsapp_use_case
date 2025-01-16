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
        public string Email { get; set; } // Email de l'utilisateur
        public string Username { get; set; } // Nom d'utilisateur
    }

    // Implémentation du service Cosmos DB
    public class CosmosDbService : ICosmosDbService
    {
        private readonly Container _container;

        // Constructeur pour initialiser le conteneur Cosmos DB
        public CosmosDbService(string accountEndpoint, string databaseName, string containerName)
        {
            {
                var aadCredential = new DefaultAzureCredential();
                var cosmosClient = new CosmosClient(accountEndpoint, aadCredential);
                _container = cosmosClient.GetContainer(databaseName, containerName);
            }
        }

        // Implémentation pour ajouter un utilisateur
        public async Task AddUserAsync(User user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            // Assure que l'ID est défini
            if (string.IsNullOrEmpty(user.id))
            {
                user.id = user.Email; // Utilise l'email comme identifiant unique
            }

            try
            {
                await _container.CreateItemAsync(user, new PartitionKey(user.id));
            }
            catch (CosmosException ex)
            {
                throw new Exception($"Erreur lors de l'ajout de l'utilisateur : {ex.Message}", ex);
            }
        }
    }
}
