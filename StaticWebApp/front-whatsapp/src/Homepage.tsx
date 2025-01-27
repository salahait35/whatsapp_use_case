import React, { useState } from "react";
import { useMsal } from "@azure/msal-react";
import "./Home.css";

const Home: React.FC = () => {
  const { instance, accounts } = useMsal();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");

  const handleLogout = () => {
    instance.logoutRedirect().catch((e) => console.error(e));
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
