using Azure.Identity;
using Microsoft.Azure.Cosmos;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace WebappWhatsapp.Models
{
    // Définition de l'interface pour le service Cosmos DB
    public interface ICosmosDbService
    {
        Task AddUserAsync(User user); // Méthode pour ajouter un utilisateur
        Task<IEnumerable<T>> QueryItemsAsync<T>(string containerName, string query); // Méthode pour requêter des éléments
        Task AddItemAsync<T>(string containerName, T item); // Méthode pour ajouter un élément
    }

    // Implémentation du service Cosmos DB
    public class CosmosDbService : ICosmosDbService
    {
        private readonly Dictionary<string, Container> _containers;
        private readonly string _databaseName;

        public CosmosDbService(string accountEndpoint, string databaseName, Dictionary<string, string> containerNames)
        {
            if (containerNames == null)
                throw new ArgumentNullException(nameof(containerNames));

            // Utilisation d'un jeton AAD via DefaultAzureCredential
            var aadCredential = new DefaultAzureCredential();
            var cosmosClient = new CosmosClient(accountEndpoint, aadCredential);

            _databaseName = databaseName;
            _containers = new Dictionary<string, Container>();

            // Initialiser les conteneurs
            foreach (var container in containerNames)
            {
                _containers[container.Key] = cosmosClient.GetContainer(_databaseName, container.Value);
            }
        }

        public async Task AddUserAsync(User user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            // Vérifier et définir l'ID
            if (string.IsNullOrEmpty(user.id))
            {
                user.id = user.Email; // Par défaut, utiliser l'email comme identifiant
            }

            var container = GetContainer("Users"); // Récupérer le conteneur "Users"
            try
            {
                // Vérifier si l'utilisateur existe déjà
                var existingUser = await container.ReadItemAsync<User>(user.id, new PartitionKey(user.id));
                if (existingUser != null)
                {
                    throw new Exception($"Un utilisateur avec l'ID {user.id} existe déjà.");
                }
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                // Ajouter un nouvel utilisateur
                await container.CreateItemAsync(user, new PartitionKey(user.id));
            }
        }

        public async Task<IEnumerable<T>> QueryItemsAsync<T>(string containerName, string query)
        {
            var container = GetContainer(containerName); // Récupérer le conteneur correspondant
            var queryDefinition = new QueryDefinition(query);
            var queryIterator = container.GetItemQueryIterator<T>(queryDefinition);

            var results = new List<T>();
            while (queryIterator.HasMoreResults)
            {
                var response = await queryIterator.ReadNextAsync();
                results.AddRange(response);
            }

            return results;
        }

        public async Task AddItemAsync<T>(string containerName, T item)
        {
            var container = GetContainer(containerName); // Récupérer le conteneur correspondant
            await container.CreateItemAsync(item, new PartitionKey(item.GetType().GetProperty("id")?.GetValue(item)?.ToString()));
        }

        // Méthode pour obtenir un conteneur spécifique
        private Container GetContainer(string containerName)
        {
            if (_containers.TryGetValue(containerName, out var container))
            {
                return container;
            }

            throw new ArgumentException($"Le conteneur '{containerName}' n'existe pas dans la configuration.");
        }
    }
}
