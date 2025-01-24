import React from 'react';
import { useMsal } from '@azure/msal-react';

const Login: React.FC = () => {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginPopup().catch((e) => console.error(e));
  };

  return (
    <div>
      <h1>Connectez-vous</h1>
      <button onClick={handleLogin}>Se connecter</button>
    </div>
  );
};

export default Login;
