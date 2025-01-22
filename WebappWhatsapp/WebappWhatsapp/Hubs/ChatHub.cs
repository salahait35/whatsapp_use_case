using Microsoft.AspNetCore.SignalR;
using System;
using System.Linq;
using System.Threading.Tasks;
using WebappWhatsapp.Models;

namespace WebappWhatsapp.Hubs
{
    public class ChatHub : Hub
    {
        private readonly ICosmosDbService _cosmosDbService;

        public ChatHub(ICosmosDbService cosmosDbService)
        {
            _cosmosDbService = cosmosDbService;
        }

        // Method to send a message
        public async Task SendMessage(string senderId, string content, string conversationId)
        {
            // Create a new message
            var chatMessage = new Message
            {
                ConversationId = conversationId,
                SenderId = senderId,
                Content = content,
                LastMessageTimestamp = DateTime.UtcNow,
                ReadBy = new List<string>() // Initialize an empty list
            };

            try
            {
                // Store the message in Cosmos DB
                await _cosmosDbService.AddMessageAsync(chatMessage);

                // Broadcast the message to all connected clients
                await Clients.All.SendAsync("ReceiveMessage", senderId, content, conversationId);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending message: {ex.Message}");
                throw;
            }
        }

        // Method to retrieve all messages for a specific conversation
        public async Task GetAllMessages(string conversationId)
        {
            try
            {
                // Retrieve all messages from Cosmos DB
                var messages = await _cosmosDbService.GetMessagesAsync();

                // Filter messages by ConversationId
                var filteredMessages = messages.Where(msg => msg.ConversationId == conversationId);

                // Send the filtered messages back to the requesting client
                await Clients.Caller.SendAsync("LoadMessages", filteredMessages);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error retrieving messages: {ex.Message}");
                throw;
            }
        }

        // Optional: Log connection events
        public override async Task OnConnectedAsync()
        {
            Console.WriteLine($"Client connected: {Context.ConnectionId}");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            Console.WriteLine($"Client disconnected: {Context.ConnectionId}. Error: {exception?.Message}");
            await base.OnDisconnectedAsync(exception);
        }
    }
}
