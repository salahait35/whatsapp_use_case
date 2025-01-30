import React, { useState, useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import "./Home.css";

const Home: React.FC = () => {
  const { instance, accounts } = useMsal();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [conversation, setConversation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const currentAccount = accounts[0];

  const handleLogout = () => {
    instance.logoutRedirect().catch((e) => console.error(e));
  };

  const getOrCreateUser = async () => {
    try {
      const request = {
        scopes: ["https://whatsappissy.onmicrosoft.com/e1b1fe84-91db-44ac-8a19-e5ff1adbafec/getallusers"], // Remplace par le scope de ton API
        account: currentAccount
      };

      const response = await instance.acquireTokenSilent(request);
      const accessToken = response.accessToken;

      const email_to_send = currentAccount?.username;

      const apiResponse = await fetch('https://localhost:7042/api/user/getorcreate', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}` // Ajouter le jeton d'accès dans l'en-tête
        },
        body: JSON.stringify({ Email: email_to_send }) // Assure-toi que l'email est correctement envoyé
      });

      if (!apiResponse.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await apiResponse.json();
      setUser(data);
      console.log("eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
      console.log(user.id); // Affiche les informations de l'utilisateur dans la console
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  const getConversations = async () => {
    try {
      const request = {
        scopes: ["https://whatsappissy.onmicrosoft.com/e1b1fe84-91db-44ac-8a19-e5ff1adbafec/getallusers"], // Remplace par le scope de ton API
        account: currentAccount
      };

      const response = await instance.acquireTokenSilent(request);
      const accessToken = response.accessToken;

      const apiResponse = await fetch('https://localhost:7042/api/conversations', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}` // Ajouter le jeton d'accès dans l'en-tête
        }
      });

      if (!apiResponse.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await apiResponse.json();
      setConversations(data);
      console.log(data); // Affiche les informations des conversations dans la console
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  const createConversation = async () => {
    try {
      const request = {
        scopes: ["https://whatsappissy.onmicrosoft.com/e1b1fe84-91db-44ac-8a19-e5ff1adbafec/getallusers"], // Remplace par le scope de ton API
        account: currentAccount
      };

      const response = await instance.acquireTokenSilent(request);
      const accessToken = response.accessToken;

      const apiResponse = await fetch('https://localhost:7042/Conversation/Create', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}` // Ajouter le jeton d'accès dans l'en-tête
        },
        body: JSON.stringify({ Email: email }) // Assure-toi que l'email est correctement envoyé
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        setError(errorData.message);
        setConversation(null);
        return;
      }

      const data = await apiResponse.json();
      setConversation(data);
      setError(null);
      setIsModalOpen(false); // Ferme le modal seulement si la conversation est créée avec succès
      console.log(data); // Affiche les informations de la conversation dans la console
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      setError('Failed to create conversation');
      setConversation(null);
    }
  };

  useEffect(() => {
    getOrCreateUser();
    getConversations();
  }, []); // Appelle getOrCreateUser et getConversations au démarrage de la page

  const handleNewConversation = () => setIsModalOpen(true);

  const handleCancel = () => {
    setIsModalOpen(false);
    setEmail("");
    setError(null);
  };

  const handleAddConversation = () => {
    if (!validateEmail(email)) {
      setError("L'adresse email n'est pas valide.");
      return;
    }
    createConversation();
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  return (
    <div className="home-container">
      {/* Header */}
      <header className="header">
        <h1>Messaging App</h1>
        <div className="header-right">
          <span className="user-name">{currentAccount?.username || "Invité"}</span>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Nouvelle conversation</h2>
            <input
              type="email"
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {error && <p className="error-message">{error}</p>}
            <div className="modal-buttons">
              <button onClick={handleCancel}>Cancel</button>
              <button onClick={handleAddConversation}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="main-content">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>Conversations</h2>
            <button
              className="add-conversation-button"
              onClick={handleNewConversation}
            >
              + New
            </button>
          </div>
          <ul className="conversation-list">
            {conversations.map((conversation) => (
              <li key={conversation.id} className="conversation-item">
                {conversation.participants.join(", ")}
              </li>
            ))}
          </ul>
        </aside>

        <section className="chat-section">
          <div className="chat-messages">
            <div className="message received">
              <p className="message-text">Hi! How are you?</p>
              <span className="message-time">10:30 AM</span>
            </div>
            <div className="message sent">
              <p className="message-text">I'm good, thanks!</p>
              <span className="message-time">10:32 AM</span>
            </div>
          </div>
          <div className="message-input-container">
            <input
              type="text"
              placeholder="Type a message..."
              className="message-input"
            />
            <button className="send-button">Send</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;