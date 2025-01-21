using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace WebappWhatsapp.Models
{
    public class Message
    {
        [JsonProperty("ConversationId")]
        public string id { get; set; } = Guid.NewGuid().ToString();
        public required string ConversationId { get; set; }
        public required string SenderId { get; set; }
        public required string Content { get; set; }

        public DateTime LastMessageTimestamp { get; set; }
        public required List<string> ReadBy { get; set; } = new List<string>(); //TODO : check if we should use receiverid


        public Message() { }
    }
}
