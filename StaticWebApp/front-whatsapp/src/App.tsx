import React from 'react';
import { useMsal } from '@azure/msal-react';
import './App.css';

const App: React.FC = () => {
  const { instance, accounts } = useMsal();

  React.useEffect(() => {
    // Si aucun utilisateur n'est connecté, déclencher une redirection
    if (!accounts || accounts.length === 0) {
      instance.loginRedirect().catch((e) => console.error('Erreur de connexion :', e));
    }
  }, [instance, accounts]);

  return (
    <div>
      <h1>Bienvenue sur WhatsApp</h1>
      <p>Vous êtes connecté.</p>
    </div>
  );
};

export default App;
