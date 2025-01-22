using Microsoft.Azure.Cosmos;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebappWhatsapp.Models;
using WebappWhatsapp.Hubs;

namespace WebappWhatsapp.Models
{
    public class CosmosDbService
    {
        private readonly Container _container;

        public CosmosDbService(string accountEndpoint, string databaseName, string containerName)
        {
            var cosmosClient = new CosmosClient(accountEndpoint);
            var databaseResponse = cosmosClient.CreateDatabaseIfNotExistsAsync(databaseName).GetAwaiter().GetResult();
            _container = databaseResponse.Database.CreateContainerIfNotExistsAsync(containerName, "/ConversationId").GetAwaiter().GetResult().Container;
        }

        public async Task AddMessageAsync(Message message)
        {
            await _container.CreateItemAsync(message, new PartitionKey(message.ConversationId));
        }

        public async Task<IEnumerable<Message>> GetMessagesAsync()
        {
            var results = new List<Message>();
            var query = _container.GetItemQueryIterator<Message>();
            while (query.HasMoreResults)
            {
                var response = await query.ReadNextAsync();
                results.AddRange(response);
            }
            return results;
        }
    }
}
