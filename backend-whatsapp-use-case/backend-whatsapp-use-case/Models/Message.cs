using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace WebappWhatsapp.Models
{
    public class Message
    {
        [JsonProperty("id")] // Propriété obligatoire pour Cosmos DB
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [JsonProperty("conversationId")]
        public string ConversationId { get; set; } // Laissez ce nom tel quel

        [JsonProperty("senderId")]
        public string SenderId { get; set; }

        [JsonProperty("messageText")]
        public string Content { get; set; }

        [JsonProperty("encryptedContent")]
        public string EncryptedContent { get; set; }

        [JsonProperty("iv")]
        public string Iv { get; set; }

        [JsonProperty("timestamp")]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        [JsonProperty("readStatus")]
        public Dictionary<string, bool> ReadStatus { get; set; } = new Dictionary<string, bool>();

        [JsonProperty("deleted")]
        public bool Deleted { get; set; } = false;

        // Constructeur par défaut
        public Message() { }

        // Constructeur avec paramètres
        public Message(string conversationId, string senderId, string content, string encryptedContent, string iv)
        {
            Id = Guid.NewGuid().ToString();
            ConversationId = conversationId ?? throw new ArgumentNullException(nameof(conversationId), "ConversationId cannot be null.");
            SenderId = senderId ?? throw new ArgumentNullException(nameof(senderId), "SenderId cannot be null.");
            Content = content ?? throw new ArgumentNullException(nameof(content), "Content cannot be null.");
            EncryptedContent = encryptedContent ?? throw new ArgumentNullException(nameof(encryptedContent), "EncryptedContent cannot be null.");
            Iv = iv ?? throw new ArgumentNullException(nameof(iv), "Iv cannot be null.");
            Timestamp = DateTime.UtcNow;
            ReadStatus = new Dictionary<string, bool>();
            Deleted = false;
        }
    }
}