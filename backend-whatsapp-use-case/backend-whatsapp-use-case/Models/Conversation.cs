using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace WebappWhatsapp.Models
{
    public class Conversation
    {
        [JsonProperty("id")] // Propriété obligatoire pour Cosmos DB
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [JsonProperty("participants")]
        public List<string> Participants { get; set; } = new List<string>(); // Liste des participants

        [JsonProperty("lastMessage")]
        public string LastMessage { get; set; } = "No messages yet"; // Message par défaut

        [JsonProperty("timestamp")]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow; // Timestamp actuel

        [JsonProperty("participantKeys")]
        public Dictionary<string, string> ParticipantKeys { get; set; } = new Dictionary<string, string>();

        [JsonProperty("encryptedSymmetricKeys")]
        public Dictionary<string, string> EncryptedSymmetricKeys { get; set; } = new Dictionary<string, string>();

        // Constructeur par défaut
        public Conversation()
        {
            Participants = new List<string>();
        }

        // Constructeur avec paramètres
        public Conversation(List<string> participants, string lastMessage = "No messages yet")
        {
            Id = Guid.NewGuid().ToString();
            Participants = participants ?? throw new ArgumentNullException(nameof(participants), "Participants list cannot be null.");
            LastMessage = lastMessage;
            Timestamp = DateTime.UtcNow;
        }
    }
}