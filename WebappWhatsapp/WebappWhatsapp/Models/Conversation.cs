using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace WebappWhatsapp.Models
{
    public class Conversation
    {
        [JsonProperty("id")]
        public string id { get; set; } = Guid.NewGuid().ToString();
        public string Type { get; set; }
        public required List<string> Members { get; set; } = new List<string>();
        public string LastMessage { get; set; }
        public DateTime LastMessageTimestamp { get; set; }
    }
}
