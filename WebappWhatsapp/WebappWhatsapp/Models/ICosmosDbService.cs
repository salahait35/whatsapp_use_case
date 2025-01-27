using System.Collections.Generic;
using System.Threading.Tasks;
using WebappWhatsapp.Models;

namespace WebappWhatsapp.Models
{
    // Definition of the interface for the Cosmos DB service
    public interface ICosmosDbService
    {
        Task AddUserAsync(User user); // Method to add a user
        Task<IEnumerable<T>> QueryItemsAsync<T>(string containerName, string query); // Method to query items
        Task AddItemAsync<T>(string containerName, T item); // Method to add a generic item
        Task AddMessageAsync(Message message); // Method to add a message
        Task<IEnumerable<Message>> GetMessagesAsync(string conversationId); // Method to retrieve messages by conversation ID
    }
}
