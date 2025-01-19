using System.Collections.Generic;
using Newtonsoft.Json;

namespace WebappWhatsapp.Models
{

    public class User
    {
        [JsonProperty("id")]
        public string id { get; set; } = Guid.NewGuid().ToString();// ID unique requis par Cosmos DB
        public string Email { get; set; } = string.Empty;  // Ou utilisez nullable : public string? Email { get; set; }
        public string Username { get; set; } = string.Empty;  // Ou utilisez nullable : public string? Username { get; set; }

    }
}
