using System.Collections.Generic;
using Newtonsoft.Json;

namespace WebappWhatsapp.Models
{

    public class User
    {
        [JsonProperty("id")]
        public string id { get; set; } = string.Empty;  // Ou utilisez nullable : public string? id { get; set; }
        public string Email { get; set; } = string.Empty;  // Ou utilisez nullable : public string? Email { get; set; }
        public string Username { get; set; } = string.Empty;  // Ou utilisez nullable : public string? Username { get; set; }

    

    public User(string Id, string email, string username)
        {
            id = Id;
            Email = email;
            Username = username; //TODO check if required
        }
    public User()
        {
            id = Guid.NewGuid().ToString();
            Email = string.Empty;
            Username = string.Empty;
        }

    }

    }
