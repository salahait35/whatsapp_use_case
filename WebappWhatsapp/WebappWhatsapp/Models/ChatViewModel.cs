using System;
using System.Collections.Generic;
using WebappWhatsapp.Models;

namespace WebappWhatsapp.Models
{
    public class ChatViewModel
    {
        // Informations de l'utilisateur connecté
        public User CurrentUser { get; set; }

        // Liste des conversations de l'utilisateur
        public List<Conversation> Conversations { get; set; }

        // Conversation actuellement sélectionnée
        public Conversation SelectedConversation { get; set; }

        public List<Message> Messages { get; set; } = new List<Message>();

        // Constructeur pour initialiser la liste des conversations
        public ChatViewModel()
        {
            Conversations = new List<Conversation>();
            CurrentUser = new User();
        }
    }
}
