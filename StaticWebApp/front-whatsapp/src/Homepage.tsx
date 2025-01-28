import React, { useState } from "react";
import { useMsal } from "@azure/msal-react";
import "./Home.css";
import { msalConfig } from "./authConfig"; // Adjust the import path as necessary

const appRoles = {
  "Admin": "Admin",
  "User": "User"
};

const Home: React.FC = () => {
  const { instance, accounts } = useMsal();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");

  const handleLogout = () => {
    instance.logoutRedirect().catch((e) => console.error(e));
  };

  

  const getToken = async (): Promise<string> => {
    console.log('start')
    const currentAccount = accounts[0];
    const accessTokenRequest = {
      scopes: ["https://whatsappissy.onmicrosoft.com/e1b1fe84-91db-44ac-8a19-e5ff1adbafec/getallusers"], // Remplace par le scope de ton API
      account: currentAccount
    };

    let accessTokenResponse;
    if (currentAccount) {
        accessTokenResponse = await instance.acquireTokenSilent(accessTokenRequest);
    }
    console.log(accessTokenResponse)
    return "null";
  };


  const getUsers = async () => {
    try {
      // Obtenir le jeton d'accès
      const request = {
        scopes: ["https://whatsappissy.onmicrosoft.com/e1b1fe84-91db-44ac-8a19-e5ff1adbafec/getallusers"], // Remplace par le scope de ton API
        account: accounts[0]
      };

      const response = await instance.acquireTokenSilent(request);
      const accessToken = response.accessToken;

      console.log(accounts[0])
      console.log("zebi")
      console.log(accessToken)
      console.log("zebi")
      getToken()

      // Appeler l'API avec le jeton d'accès
      const apiResponse = await fetch('https://localhost:7042/getallusers', {
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
      console.log(data); // Affiche les utilisateurs dans la console
      return data;
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };


  const handleNewConversation = () => setIsModalOpen(true);

  const handleCancel = () => {
    setIsModalOpen(false);
    setEmail("");
  };

  const handleAddConversation = () => {
    console.log("Nouvelle conversation avec :", email);
    setIsModalOpen(false);
    setEmail("");
  };

  return (
    <div className="home-container">
      {/* Header */}
      <header className="header">
        <h1>Messaging App</h1>
        <div className="header-right">
          <span className="user-name">{accounts[0]?.username || "Invité"}</span>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
          <button onClick={getUsers}>get users</button>
          <button onClick={getToken}>get token</button>
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
            <li className="conversation-item">John Doe</li>
            <li className="conversation-item">Jane Smith</li>
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
