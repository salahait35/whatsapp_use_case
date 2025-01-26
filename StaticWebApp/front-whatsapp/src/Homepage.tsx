import React from "react";
import "./Home.css";

const Home: React.FC = () => {
  return (
    <div className="home-container">
      {/* Header */}
      <header className="header">
        <h1>Messaging App</h1>
        <div className="header-right">
          <span className="user-name">User: user@example.com</span>
          <button className="logout-button">Logout</button>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Sidebar Conversations */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>Conversations</h2>
            <button className="add-conversation-button">+ New</button>
          </div>
          <ul className="conversation-list">
            <li className="conversation-item">John Doe</li>
            <li className="conversation-item">Jane Smith</li>
          </ul>
        </aside>

        {/* Chat Section */}
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