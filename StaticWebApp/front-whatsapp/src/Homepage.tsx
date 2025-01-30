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
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState(""); // Nouvel état pour le message à envoyer
  const [error, setError] = useState<string | null>(null);

  const currentAccount = accounts[0];

  const handleLogout = () => {
    instance.logoutRedirect().catch((e) => console.error(e));
  };

  const getOrCreateUser = async () => {
    try {
      const request = {
        scopes: ["https://whatsappissy.onmicrosoft.com/e1b1fe84-91db-44ac-8a19-e5ff1adbafec/getallusers"],
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
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ Email: email_to_send })
      });

      if (!apiResponse.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await apiResponse.json();
      setUser(data);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  useEffect(() => {
    if (user) {
      console.log(user.id);
    }
  }, [user]);

  useEffect(() => {
    getOrCreateUser();
    getConversations();
  }, []);

  const getConversations = async () => {
    try {
      const request = {
        scopes: ["https://whatsappissy.onmicrosoft.com/e1b1fe84-91db-44ac-8a19-e5ff1adbafec/getallusers"],
        account: currentAccount
      };

      const response = await instance.acquireTokenSilent(request);
      const accessToken = response.accessToken;

      const apiResponse = await fetch('https://localhost:7042/api/conversations', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!apiResponse.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await apiResponse.json();
      setConversations(data);
      console.log(data);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  const createConversation = async () => {
    try {
      const request = {
        scopes: ["https://whatsappissy.onmicrosoft.com/e1b1fe84-91db-44ac-8a19-e5ff1adbafec/getallusers"],
        account: currentAccount
      };

      const response = await instance.acquireTokenSilent(request);
      const accessToken = response.accessToken;

      const apiResponse = await fetch('https://localhost:7042/Conversation/Create', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ Email: email })
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
      setIsModalOpen(false);
      console.log(data);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      setError('Failed to create conversation');
      setConversation(null);
    }
  };

  const getMessages = async (conversationId: string) => {
    try {
      const request = {
        scopes: ["https://whatsappissy.onmicrosoft.com/e1b1fe84-91db-44ac-8a19-e5ff1adbafec/getallusers"],
        account: currentAccount
      };

      const response = await instance.acquireTokenSilent(request);
      const accessToken = response.accessToken;

      const apiResponse = await fetch(`https://localhost:7042/api/conversations/${conversationId}/messages`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!apiResponse.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await apiResponse.json();
      setMessages(data);
      setConversation(conversations.find(conv => conv.id === conversationId)); // Mettre à jour l'état de la conversation
      console.log(data);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const request = {
        scopes: ["https://whatsappissy.onmicrosoft.com/e1b1fe84-91db-44ac-8a19-e5ff1adbafec/getallusers"],
        account: currentAccount
      };

      const response = await instance.acquireTokenSilent(request);
      const accessToken = response.accessToken;

      const message = {
        conversationId: conversation.id,
        senderId: user.id,
        Content: newMessage,
        timestamp: new Date().toISOString(),
        readStatus: {},
        deleted: false
      };

      const apiResponse = await fetch(`https://localhost:7042/api/conversations/${conversation.id}/send_message`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(message)
      });

      if (!apiResponse.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await apiResponse.json();
      setMessages([...messages, data]);
      setNewMessage("");
      console.log(data);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

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
      <header className="header">
        <h1>Messaging App</h1>
        <div className="header-right">
          <span className="user-name">{currentAccount?.username || "Invité"}</span>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

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
              <li key={conversation.id} className="conversation-item" onClick={() => getMessages(conversation.id)}>
                {conversation.participants.join(", ")}
              </li>
            ))}
          </ul>
        </aside>

        <section className="chat-section">
          <div className="chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.senderId === user?.id ? 'sent' : 'received'}`}>
                <p className="message-text">{message.content}</p>
                <span className="message-time">{new Date(message.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
          <div className="message-input-container">
            <input
              type="text"
              placeholder="Type a message..."
              className="message-input"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button className="send-button" onClick={sendMessage}>Send</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;