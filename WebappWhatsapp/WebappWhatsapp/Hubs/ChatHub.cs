using Microsoft.AspNetCore.SignalR;
using System;
using System.Linq;
using System.Threading.Tasks;
using WebappWhatsapp.Models; // Correct namespace for models

namespace WebappWhatsapp.Hubs
{
    public class ChatHub : Hub
    {
        private readonly CosmosDbService _cosmosDbService;

        public ChatHub(CosmosDbService cosmosDbService)
        {
            _cosmosDbService = cosmosDbService;
        }

        public async Task SendMessage(string senderId, string content, string conversationId)
        {
            var chatMessage = new Message
            {
                ConversationId = conversationId,
                SenderId = senderId,
                Content = content,
                LastMessageTimestamp = DateTime.UtcNow,
                ReadBy = new List<string>() // Initialize with an empty list
            };

            // Store the message in Cosmos DB
            await _cosmosDbService.AddMessageAsync(chatMessage);

            // Broadcast the message to all connected clients
            await Clients.All.SendAsync("ReceiveMessage", senderId, content, conversationId);
        }

        public async Task GetAllMessages(string conversationId)
        {
            var messages = await _cosmosDbService.GetMessagesAsync();

            // Filter messages by ConversationId
            var filteredMessages = messages.Where(msg => msg.ConversationId == conversationId);

            // Send all messages back to the requesting client
            await Clients.Caller.SendAsync("LoadMessages", filteredMessages);
        }
    }
}
