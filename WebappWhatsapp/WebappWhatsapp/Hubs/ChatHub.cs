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
            Console.WriteLine($"SendMessage called with senderId: {senderId}, content: {content}, conversationId: {conversationId}");

            if (string.IsNullOrEmpty(senderId) || string.IsNullOrEmpty(content) || string.IsNullOrEmpty(conversationId))
            {
                Console.WriteLine("Invalid input parameters. SenderId, Content, and ConversationId are required.");
                throw new ArgumentException("SenderId, Content, and ConversationId must be provided.");
            }

            var chatMessage = new Message
            {
                ConversationId = conversationId,
                SenderId = senderId,
                Content = content,
                LastMessageTimestamp = DateTime.UtcNow,
                ReadBy = new List<string>() // Initialize with an empty list
            };

            try
            {
                Console.WriteLine("Attempting to store message in Cosmos DB...");
                await _cosmosDbService.AddMessageAsync(chatMessage);
                Console.WriteLine("Message stored successfully in Cosmos DB.");

                Console.WriteLine("Broadcasting message to all connected clients...");
                await Clients.All.SendAsync("ReceiveMessage", senderId, content, conversationId);
                Console.WriteLine("Message broadcasted successfully.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in SendMessage: {ex.Message}");
                throw new HubException("An unexpected error occurred while processing your message.", ex);
            }
        }

        // Method to retrieve all messages for a specific conversation
        public async Task GetAllMessages(string conversationId)
        {
            try
            {
                if (string.IsNullOrEmpty(conversationId))
                {
                    Console.WriteLine("Invalid input: ConversationId is required.");
                    throw new ArgumentException("ConversationId must be provided.");
                }

                Console.WriteLine($"Retrieving messages for conversationId: {conversationId}");

                // Retrieve messages for the specified conversationId
                var messages = await _cosmosDbService.GetMessagesAsync(conversationId);

                Console.WriteLine($"Retrieved {messages.Count()} messages for conversationId: {conversationId}");

                // Send the filtered messages back to the requesting client
                await Clients.Caller.SendAsync("LoadMessages", messages);
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
