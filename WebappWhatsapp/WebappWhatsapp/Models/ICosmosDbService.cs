using Azure.Identity;
using Microsoft.Azure.Cosmos;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebappWhatsapp.Models;
using WebappWhatsapp.Hubs;

namespace WebappWhatsapp.Models
{
    // Definition of the interface for the Cosmos DB service
    public interface ICosmosDbService
    {
        Task AddUserAsync(User user); // Method to add a user
        Task<IEnumerable<T>> QueryItemsAsync<T>(string containerName, string query); // Method to query items
        Task AddItemAsync<T>(string containerName, T item); // Method to add an item
        Task AddMessageAsync(Message message); // Method to add a message
        Task<IEnumerable<Message>> GetMessagesAsync(string conversationId); // Method to retrieve messages by conversation ID
    }

    // Implementation of the Cosmos DB service
    public class CosmosDbService : ICosmosDbService
    {
        private readonly Dictionary<string, Container> _containers;
        private readonly string _databaseName;

        public CosmosDbService(string accountEndpoint, string databaseName, Dictionary<string, string> containerNames)
        {
            if (containerNames == null)
                throw new ArgumentNullException(nameof(containerNames));

            // Use an AAD token via DefaultAzureCredential
            var aadCredential = new DefaultAzureCredential();
            var cosmosClient = new CosmosClient(accountEndpoint, aadCredential);

            _databaseName = databaseName;
            _containers = new Dictionary<string, Container>();

            // Initialize containers
            foreach (var container in containerNames)
            {
                _containers[container.Key] = cosmosClient.GetContainer(_databaseName, container.Value);
            }
        }

        // Method to add a user
        public async Task AddUserAsync(User user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            if (string.IsNullOrEmpty(user.id))
            {
                user.id = user.Email; // Use email as the default ID
            }

            var container = GetContainer("Users");
            try
            {
                // Check if the user already exists
                var existingUser = await container.ReadItemAsync<User>(user.id, new PartitionKey(user.id));
                if (existingUser != null)
                {
                    throw new Exception($"A user with ID {user.id} already exists.");
                }
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                // Add a new user
                await container.CreateItemAsync(user, new PartitionKey(user.id));
            }
        }

        // Method to query items
        public async Task<IEnumerable<T>> QueryItemsAsync<T>(string containerName, string query)
        {
            var container = GetContainer(containerName);
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

        // Method to add a generic item
        public async Task AddItemAsync<T>(string containerName, T item)
        {
            var container = GetContainer(containerName);
            await container.CreateItemAsync(item, new PartitionKey(item.GetType().GetProperty("id")?.GetValue(item)?.ToString()));
        }

        // Method to add a message
        public async Task AddMessageAsync(Message message)
        {
            var container = GetContainer("Messages");
            await container.CreateItemAsync(message, new PartitionKey(message.ConversationId));
        }

        // Method to retrieve messages by conversation ID
        public async Task<IEnumerable<Message>> GetMessagesAsync(string conversationId)
        {
            var container = GetContainer("Messages");
            var query = new QueryDefinition("SELECT * FROM c WHERE c.ConversationId = @conversationId")
                .WithParameter("@conversationId", conversationId);

            var results = new List<Message>();
            var queryIterator = container.GetItemQueryIterator<Message>(query);

            while (queryIterator.HasMoreResults)
            {
                var response = await queryIterator.ReadNextAsync();
                results.AddRange(response);
            }

            return results;
        }

        // Method to get a specific container
        private Container GetContainer(string containerName)
        {
            if (_containers.TryGetValue(containerName, out var container))
            {
                return container;
            }

            throw new ArgumentException($"The container '{containerName}' does not exist in the configuration.");
        }
    }
}
