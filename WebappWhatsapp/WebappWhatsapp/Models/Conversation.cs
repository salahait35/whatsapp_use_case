using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace WebappWhatsapp.Models
{
    public class Conversation
    {
        [JsonProperty("id")]
        public string id { get; set; } = Guid.NewGuid().ToString(); // Génère un ID unique par défaut
        public string Type { get; set; } = "text"; // Défaut : "text", peut être modifié

        // Le membre obligatoire 'Members' doit être initialisé avant l'utilisation.
        [JsonProperty("members")]
        public List<string> Members { get; set; } = new List<string>();  // Initialisé par défaut ici

        public string LastMessage { get; set; } = "No messages yet"; // Défaut pour une nouvelle conversation
        public DateTime LastMessageTimestamp { get; set; } = DateTime.UtcNow; // Par défaut, utilise l'heure actuelle

        // Constructeur par défaut
        public Conversation()
        {
            Members = new List<string>(); // Initialisation de la liste des membres
        }

        // Constructeur avec paramètres pour personnaliser l'initialisation
        public Conversation(List<string> members, string type = "text", string lastMessage = "No messages yet")
        {
            Members = members ?? throw new ArgumentNullException(nameof(members), "Members list cannot be null.");
            Type = type;
            LastMessage = lastMessage;
            LastMessageTimestamp = DateTime.UtcNow;
        }
    }
}
