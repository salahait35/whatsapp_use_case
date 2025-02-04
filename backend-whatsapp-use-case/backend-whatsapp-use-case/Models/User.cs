using System;
using Newtonsoft.Json;

namespace WebappWhatsapp.Models
{
    public class User
    {
        [JsonProperty("id")]
        public string Id { get; set; } = string.Empty;  // Ou utilisez nullable : public string? Id { get; set; }

        [JsonProperty("email")]
        public string Email { get; set; } = string.Empty;  // Ou utilisez nullable : public string? Email { get; set; }

        [JsonProperty("username")]
        public string Username { get; set; } = string.Empty;

        [JsonProperty("publickey")]
        public string PublicKey { get; set; } = string.Empty;

        // Constructeur avec paramètres
        public User(string id, string email, string username, string publickey)
        {
            Id = id;
            Email = email;
            Username = username; 
            PublicKey = publickey;
        }

        // Constructeur par défaut
        public User()
        {
            Id = Guid.NewGuid().ToString();
            Email = string.Empty;
            Username = string.Empty;
            PublicKey = string.Empty;
        }
    }
}