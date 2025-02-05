import React, { useState, useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { generateKeyPair, generateSymmetricKey, encryptSymmetricKey, encryptMessageWithSymmetricKey, decryptMessageWithSymmetricKey, decryptSymmetricKey } from "./cryptoUtils";import "./Home.css";

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
  const [keysGenerated, setKeysGenerated] = useState(false); // État pour suivre si les clés ont été générées
  const [isCreatingUser, setIsCreatingUser] = useState(false); // État pour éviter les appels multiples
  const [privateKeyJwk, setPrivateKeyJwk] = useState<JsonWebKey | null>(null); // État pour la clé privée
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingMessageContent, setEditingMessageContent] = useState<string>("");

  const currentAccount = accounts[0];

  const handleLogout = () => {
    instance.logoutRedirect().catch((e) => console.error(e));
  };

  const userExists = async (email: string) => {
    try {
      const request = {
        scopes: ["https://whatsappissy.onmicrosoft.com/f9cfeb56-5f0b-4cff-a035-797a92cb5e5e/api-of-the-back-end"], //TODO EDIT global azure ["https://whatsappissy.onmicrosoft.com/f9cfeb56-5f0b-4cff-a035-797a92cb5e5e/api-of-the-back-end"], local : ["https://whatsappissy.onmicrosoft.com/f9cfeb56-5f0b-4cff-a035-797a92cb5e5e/api-of-the-back-end"]
        account: currentAccount
      };

      const response = await instance.acquireTokenSilent(request);
      const accessToken = response.accessToken;

      const apiResponse = await fetch('https://api-backend-for-swa-theptalks-gph6h0hxfddva4au.francecentral-01.azurewebsites.net/api/user/exists', {   //TODO EDIT global azure : https://api-backend-for-swa-theptalks-gph6h0hxfddva4au.francecentral-01.azurewebsites.net,  local : https://api-backend-for-swa-theptalks-gph6h0hxfddva4au.francecentral-01.azurewebsites.net
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ Email: email })
      });

      if (!apiResponse.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await apiResponse.json();
      return data.exists;
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      return false;
    }
  };

  const createUser = async (email: string, publicKey: JsonWebKey) => {
    try {
      const request = {
        scopes: ["https://whatsappissy.onmicrosoft.com/f9cfeb56-5f0b-4cff-a035-797a92cb5e5e/api-of-the-back-end"],
        account: currentAccount
      };

      const response = await instance.acquireTokenSilent(request);
      const accessToken = response.accessToken;

      const apiResponse = await fetch('https://api-backend-for-swa-theptalks-gph6h0hxfddva4au.francecentral-01.azurewebsites.net/api/user/create', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ Email: email, PublicKey: JSON.stringify(publicKey) })
      });

      if (!apiResponse.ok) {
        throw new Error('Network response was not ok');
      }

      const newUser = await apiResponse.json();
      return newUser;
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      return null;
    }
  };

  const getOrCreateUser = async () => {
    if (isCreatingUser) return; // Éviter les appels multiples
    setIsCreatingUser(true);

    try {
      const email_to_send = currentAccount?.username;

      const exists = await userExists(email_to_send);

      if (exists) {
        // L'utilisateur existe, récupérer les informations de l'utilisateur
        const request = {
          scopes: ["https://whatsappissy.onmicrosoft.com/f9cfeb56-5f0b-4cff-a035-797a92cb5e5e/api-of-the-back-end"],
          account: currentAccount
        };

        const response = await instance.acquireTokenSilent(request);
        const accessToken = response.accessToken;

        const apiResponse = await fetch('https://api-backend-for-swa-theptalks-gph6h0hxfddva4au.francecentral-01.azurewebsites.net/api/user/getorcreate', {
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
      } else if (!keysGenerated) {
        // L'utilisateur n'existe pas et les clés n'ont pas encore été générées
        const { publicKeyJwk, privateKeyJwk } = await generateKeyPair(email_to_send);
        // Créer un nouvel utilisateur avec la clé publique
        const newUser = await createUser(email_to_send, publicKeyJwk);

        if (newUser) {
          setUser(newUser);
          setKeysGenerated(true); // Marquer les clés comme générées
          localStorage.setItem('privateKeyJwk', JSON.stringify(privateKeyJwk)); // Enregistrer la clé privée dans le localStorage
        }
      }
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    } finally {
      setIsCreatingUser(false);
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
        scopes: ["https://whatsappissy.onmicrosoft.com/f9cfeb56-5f0b-4cff-a035-797a92cb5e5e/api-of-the-back-end"],
        account: currentAccount
      };

      const response = await instance.acquireTokenSilent(request);
      const accessToken = response.accessToken;

      const apiResponse = await fetch('https://api-backend-for-swa-theptalks-gph6h0hxfddva4au.francecentral-01.azurewebsites.net/api/conversations', {
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
        scopes: ["https://whatsappissy.onmicrosoft.com/f9cfeb56-5f0b-4cff-a035-797a92cb5e5e/api-of-the-back-end"],
        account: currentAccount
      };
  
      const response = await instance.acquireTokenSilent(request);
      const accessToken = response.accessToken;
  
      // Récupérer la clé publique de l'utilisateur actuel
      const currentUserPublicKeyResponse = await fetch('https://api-backend-for-swa-theptalks-gph6h0hxfddva4au.francecentral-01.azurewebsites.net/api/user/getpublickey', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ Email: currentAccount.username })
      });
  
      if (!currentUserPublicKeyResponse.ok) {
        const errorData = await currentUserPublicKeyResponse.json();
        setError(errorData.message);
        setConversation(null);
        return;
      }
  
      const currentUserPublicKeyData = await currentUserPublicKeyResponse.json();
      const currentUserPublicKey = JSON.parse(currentUserPublicKeyData.publicKey);
  
      // Récupérer la clé publique de l'utilisateur cible
      const targetUserPublicKeyResponse = await fetch('https://api-backend-for-swa-theptalks-gph6h0hxfddva4au.francecentral-01.azurewebsites.net/api/user/getpublickey', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ Email: email })
      });
  
      if (!targetUserPublicKeyResponse.ok) {
        const errorData = await targetUserPublicKeyResponse.json();
        setError(errorData.message);
        setConversation(null);
        return;
      }
  
      const targetUserPublicKeyData = await targetUserPublicKeyResponse.json();
      const targetUserPublicKey = JSON.parse(targetUserPublicKeyData.publicKey);
  
      // Générer la clé symétrique
      const symmetricKey = await generateSymmetricKey();
  
      // Chiffrer la clé symétrique avec les clés publiques des participants
      const encryptedSymmetricKeys: { [key: string]: string } = {};
      const participants = {
        [currentAccount.username]: currentUserPublicKey,
        [email]: targetUserPublicKey
      };
  
      for (const participant in participants) {
        const publicKeyJwk = participants[participant];
        console.log("1 :", JSON.stringify(publicKeyJwk));
        const encryptedKey = await encryptSymmetricKey(symmetricKey, publicKeyJwk);
        encryptedSymmetricKeys[participant] = btoa(String.fromCharCode(...new Uint8Array(encryptedKey)));
      }
  
      const apiResponse = await fetch('https://api-backend-for-swa-theptalks-gph6h0hxfddva4au.francecentral-01.azurewebsites.net/Conversation/Create', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ Email: email, EncryptedSymmetricKeys: encryptedSymmetricKeys })
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
      getConversations(); // Mettre à jour la liste des conversations
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
            scopes: ["https://whatsappissy.onmicrosoft.com/f9cfeb56-5f0b-4cff-a035-797a92cb5e5e/api-of-the-back-end"],
            account: currentAccount
        };

        const response = await instance.acquireTokenSilent(request);
        const accessToken = response.accessToken;

        const apiResponse = await fetch(`https://api-backend-for-swa-theptalks-gph6h0hxfddva4au.francecentral-01.azurewebsites.net/api/conversations/${conversationId}/messages`, {
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
        console.log(data);

        // Mettre à jour l'état de la conversation avant d'accéder à ses propriétés
        const currentConversation = conversations.find(conv => conv.id === conversationId);
        setConversation(currentConversation);

        if (!currentConversation) {
            throw new Error('Conversation not found');
        }

        // Récupérer la clé symétrique chiffrée et la déchiffrer
        const encryptedSymmetricKey = currentConversation.encryptedSymmetricKeys[currentAccount.username];
        const privateKeyJwkString = localStorage.getItem('privateKeyJwk');

        console.log(privateKeyJwkString);

        if (!privateKeyJwkString) {
            throw new Error('Private key not found. Please import your private key.');
        }
        const privateKeyJwk = JSON.parse(privateKeyJwkString);
        const symmetricKey = await decryptSymmetricKey(privateKeyJwk, encryptedSymmetricKey);

        // Déchiffrer les messages avec la clé symétrique
        const decryptedMessages = await Promise.all(data.map(async (message: any) => {
            const encryptedMessage = Uint8Array.from(atob(message.content), c => c.charCodeAt(0)).buffer;
            const iv = Uint8Array.from(atob(message.iv), c => c.charCodeAt(0));
            const decryptedContent = await decryptMessageWithSymmetricKey(symmetricKey, encryptedMessage, iv);
            return { ...message, content: decryptedContent };
        }));

        setMessages(decryptedMessages);
        console.log(decryptedMessages);
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
};


  const sendMessage = async () => {
    if (!newMessage.trim()) return;
  
    try {
      const request = {
        scopes: ["https://whatsappissy.onmicrosoft.com/f9cfeb56-5f0b-4cff-a035-797a92cb5e5e/api-of-the-back-end"],
        account: currentAccount
      };
  
      const response = await instance.acquireTokenSilent(request);
      const accessToken = response.accessToken;
  
      // Récupérer la clé symétrique chiffrée et la déchiffrer
      const encryptedSymmetricKey = conversation.encryptedSymmetricKeys[currentAccount.username];
      const privateKeyJwkString = localStorage.getItem('privateKeyJwk');
      if (!privateKeyJwkString) {
        throw new Error('Private key not found. Please import your private key.');
      }
      const privateKeyJwk = JSON.parse(privateKeyJwkString);
      const symmetricKey = await decryptSymmetricKey(privateKeyJwk, encryptedSymmetricKey);
  
      // Chiffrer le message avec la clé symétrique
      const { encryptedMessage, iv } = await encryptMessageWithSymmetricKey(symmetricKey, newMessage);
      console.log(iv)
      const message = {
        conversationId: conversation.id,
        senderId: user.id,
        Content: btoa(String.fromCharCode(...new Uint8Array(encryptedMessage))), // Convertir en base64
        iv: btoa(String.fromCharCode(...new Uint8Array(iv))), // Convertir en base64
        timestamp: new Date().toISOString(),
        readStatus: {},
        deleted: false
      };
  
      const apiResponse = await fetch(`https://api-backend-for-swa-theptalks-gph6h0hxfddva4au.francecentral-01.azurewebsites.net/api/conversations/${conversation.id}/send_message`, {
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
  
/*      const data = await apiResponse.json();
      setMessages([...messages, data]);
      setNewMessage("");
      console.log(data);*/
      getMessages(conversation.id) //TODO a changer c'est DEGEULASSE
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

  const handlePrivateKeyImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        localStorage.setItem('privateKeyJwk', content);
        setPrivateKeyJwk(JSON.parse(content));
        console.log(privateKeyJwk)
      };
      reader.readAsText(file[0]);
    }
  };


  const deleteMessage = async (messageId: string) => {
    try {
      const request = {
        scopes: ["https://whatsappissy.onmicrosoft.com/f9cfeb56-5f0b-4cff-a035-797a92cb5e5e/api-of-the-back-end"],
        account: currentAccount
      };

      const response = await instance.acquireTokenSilent(request);
      const accessToken = response.accessToken;

      const apiResponse = await fetch(`https://api-backend-for-swa-theptalks-gph6h0hxfddva4au.francecentral-01.azurewebsites.net/api/messages/${messageId}/delete`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!apiResponse.ok) {
        throw new Error('Network response was not ok');
      }
      getMessages(conversation.id) //TODO a changer c'est DEGEULASSE
    
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  const editMessage = async () => {
    if (!editingMessageContent.trim()) return;
  
    try {
      const request = {
        scopes: ["https://whatsappissy.onmicrosoft.com/f9cfeb56-5f0b-4cff-a035-797a92cb5e5e/api-of-the-back-end"],
        account: currentAccount
      };
  
      const response = await instance.acquireTokenSilent(request);
      const accessToken = response.accessToken;
  
      // Récupérer la clé symétrique chiffrée et la déchiffrer
      const encryptedSymmetricKey = conversation.encryptedSymmetricKeys[currentAccount.username];
      const privateKeyJwkString = localStorage.getItem('privateKeyJwk');
      if (!privateKeyJwkString) {
        throw new Error('Private key not found. Please import your private key.');
      }
      const privateKeyJwk = JSON.parse(privateKeyJwkString);
      const symmetricKey = await decryptSymmetricKey(privateKeyJwk, encryptedSymmetricKey);
  
      // Chiffrer le message avec la clé symétrique
      const { encryptedMessage, iv } = await encryptMessageWithSymmetricKey(symmetricKey, editingMessageContent);
      const message = {
        Content: btoa(String.fromCharCode(...new Uint8Array(encryptedMessage))), // Convertir en base64
        iv: btoa(String.fromCharCode(...new Uint8Array(iv))) // Convertir en base64
      };
  
      const apiResponse = await fetch(`https://api-backend-for-swa-theptalks-gph6h0hxfddva4au.francecentral-01.azurewebsites.net/api/messages/${editingMessageId}/edit`, {
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
  
      // Mettre à jour l'état local pour refléter la modification du message
      setMessages(messages.map(msg => 
        msg.id === editingMessageId ? { ...msg, content: editingMessageContent } : msg
      ));
      handleCancelEdit();
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };



 const handleEdit = (messageId: string, currentContent: string) => {
  setEditingMessageId(messageId);
  setEditingMessageContent(currentContent);
};

const handleCancelEdit = () => {
  setEditingMessageId(null);
  setEditingMessageContent("");
};
  return (
    <div className="home-container">
      <header className="header">
        <h1>Messaging App</h1>
        <div className="header-right">
          <span className="user-name">{currentAccount?.username || "Invité"}</span>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
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
                {editingMessageId === message.id ? (
                  <div>
                    <input
                      type="text"
                      value={editingMessageContent}
                      onChange={(e) => setEditingMessageContent(e.target.value)}
                    />
                    <button onClick={editMessage}>Modifier</button>
                    <button onClick={handleCancelEdit}>Annuler</button>
                  </div>
                ) : (
                  <>
                    <p className="message-text">{message.content}</p>
                    <span className="message-time">{new Date(message.timestamp).toLocaleTimeString()}</span>
                    <button className="message-button" onClick={() => deleteMessage(message.id)}>Supprimer</button>
                    <button className="message-button" onClick={() => handleEdit(message.id, message.content)}>Modifier</button>
                  </>
                )}
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
          <div className="private-key-import">
            <label htmlFor="private-key-file">Import Private Key:</label>
            <input
              type="file"
              id="private-key-file"
              onChange={handlePrivateKeyImport}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;