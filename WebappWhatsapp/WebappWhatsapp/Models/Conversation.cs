using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace WebappWhatsapp.Models
{
    public class Conversation
    {
        [JsonProperty("id")] // Propriété obligatoire pour Cosmos DB
        public string id { get; set; } = Guid.NewGuid().ToString();

        [JsonProperty("conversationId")] 
        public string ConversationId { get; set; } = string.Empty; // Utiliser conversationId comme clé unique et clé de partition

        public string Type { get; set; } = "text"; // Par défaut : "text"

        [JsonProperty("members")]
        public List<string> Members { get; set; } = new List<string>(); // Liste des membres

        public string LastMessage { get; set; } = "No messages yet"; // Message par défaut
        public DateTime LastMessageTimestamp { get; set; } = DateTime.UtcNow; // Timestamp actuel

        // Constructeur par défaut
        public Conversation()
        {
            Members = new List<string>();
        }

        // Constructeur avec paramètres
        public Conversation(List<string> members, string type = "text", string lastMessage = "No messages yet")
        {
            
            ConversationId =  Guid.NewGuid().ToString();
            id = ConversationId;
            Members = members ?? throw new ArgumentNullException(nameof(members), "Members list cannot be null.");
            Type = type;
            LastMessage = lastMessage;
            LastMessageTimestamp = DateTime.UtcNow;
        }
    }
}
