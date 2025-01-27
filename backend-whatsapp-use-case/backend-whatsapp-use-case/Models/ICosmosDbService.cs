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
        Task AddItemWithPartitionKeyAsync<T>(string containerName, T item, string partitionKeyValue); // Méthode pour ajouter un élément avec clé de partition
    }

    // Implémentation du service Cosmos DB
    public class CosmosDbService : ICosmosDbService
    {
        private readonly Dictionary<string, Container> _containers;
        private readonly string _databaseName;

        public CosmosDbService(CosmosClient cosmosClient, string databaseName, Dictionary<string, string> containerNames)
        {
            if (containerNames == null)
                throw new ArgumentNullException(nameof(containerNames));

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

            if (string.IsNullOrEmpty(user.Email))
                throw new ArgumentException("L'email de l'utilisateur ne peut pas être null ou vide.");

            var container = GetContainer("Users"); // Récupérer le conteneur "Users"

            try
            {
                // Vérifier si un utilisateur avec cet email existe déjà
                var query = new QueryDefinition("SELECT * FROM c WHERE c.Email = @Email")
                    .WithParameter("@Email", user.Email);

                using var iterator = container.GetItemQueryIterator<User>(query);
                var results = new List<User>();

                while (iterator.HasMoreResults)
                {
                    var response = await iterator.ReadNextAsync();
                    results.AddRange(response);
                }

                if (results.Count > 0)
                {
                    // Si un utilisateur existe déjà, retourner ses informations ou lever une exception
                    throw new Exception($"Un utilisateur avec l'email '{user.Email}' existe déjà.");
                }

                // Ajouter un nouvel utilisateur si aucun utilisateur n'a été trouvé
                if (string.IsNullOrEmpty(user.id))
                {
                    user.id = Guid.NewGuid().ToString(); // Générer un ID unique si non défini
                }

                await container.CreateItemAsync(user, new PartitionKey(user.id));
            }
            catch (CosmosException ex)
            {
                throw new Exception($"Erreur lors de la vérification ou de l'ajout de l'utilisateur : {ex.Message}", ex);
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
            await container.CreateItemAsync(item);
        }

        public async Task AddItemWithPartitionKeyAsync<T>(string containerName, T item, string partitionKeyValue)
        {
            if (string.IsNullOrEmpty(partitionKeyValue))
            {
                throw new ArgumentNullException(nameof(partitionKeyValue), "Partition key value cannot be null or empty.");
            }

            var container = GetContainer(containerName); // Récupérer le conteneur correspondant
            await container.CreateItemAsync(item, new PartitionKey(partitionKeyValue));
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