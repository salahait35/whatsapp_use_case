import React from 'react';
import { useMsal } from '@azure/msal-react';
import './App.css';

const App: React.FC = () => {
  const { instance } = useMsal();

  React.useEffect(() => {
    instance.loginPopup().catch((e) => console.error(e));
  }, [instance]);

  return (
    <div>
      <h1>Bienvenue sur WhatsApp</h1>
      <p>Vous êtes connecté.</p>
    </div>
  );
};

export default App;
