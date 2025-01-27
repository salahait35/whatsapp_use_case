using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace WebappWhatsapp.Models
{
    public class Message
    {
        [JsonProperty("id")] // Correction : utiliser un nom JSON différent
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public required string ConversationId { get; set; } // Laissez ce nom tel quel
        public required string SenderId { get; set; }
        public required string Content { get; set; }
        public DateTime LastMessageTimestamp { get; set; }
        public required List<string> ReadBy { get; set; } = new List<string>(); //TODO: Vérifiez si ReceiverId doit être utilisé

        public Message() { }
    }
}
