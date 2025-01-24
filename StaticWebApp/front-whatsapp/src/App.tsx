import React, { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import './App.css';

const App: React.FC = () => {
  const { instance } = useMsal();
  const [notifications, setNotifications] = useState<string[]>([]);

  React.useEffect(() => {
    instance.loginPopup().catch((e) => console.error(e));

    // Simuler une notification de message reçu
    const simulateNotification = () => {
      setNotifications((prev) => [...prev, 'Nouveau message reçu!']);
    };
    const interval = setInterval(simulateNotification, 5000); // Toutes les 5 secondes

    return () => clearInterval(interval); // Nettoyage
  }, [instance]);

  return (
    <div>
      <h1>Bienvenue sur WhatsApp</h1>
      <p>Vous êtes connecté.</p>

      <h2>Notifications</h2>
      <ul>
        {notifications.map((notification, index) => (
          <li key={index}>{notification}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;
