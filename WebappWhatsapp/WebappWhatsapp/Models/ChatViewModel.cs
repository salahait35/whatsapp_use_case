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

        // Liste des messages de la conversation sélectionnée
        public List<Message> Messages { get; set; }

        // Constructeur par défaut pour initialiser la liste des conversations
        public ChatViewModel()
        {
            Conversations = new List<Conversation>();
            Messages = new List<Message>();
            CurrentUser = new User();
            SelectedConversation = new Conversation();
        }

        // Constructeur avec paramètres pour initialiser les propriétés avec des valeurs spécifiques
        public ChatViewModel(User currentUser, List<Conversation> conversations, Conversation selectedConversation, List<Message> messages)
        {
            CurrentUser = currentUser ?? throw new ArgumentNullException(nameof(currentUser));
            Conversations = conversations ?? new List<Conversation>();
            SelectedConversation = selectedConversation ?? new Conversation();
            Messages = messages ?? new List<Message>();
        }
    }
}
