import React from 'react';
import ReactDOM from 'react-dom/client';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import App from './App';
import './index.css';

const msalConfig = {
  auth: {
    clientId: "a233eb7d-6818-49f9-9fd9-73bd7fce3e1b",
    authority: "https://whatsappissy.b2clogin.com/whatsappissy.onmicrosoft.com/B2C_1_susi",
    redirectUri: window.location.origin, // Redirection après authentification
    postLogoutRedirectUri: window.location.origin, // Redirection après déconnexion
  },
  cache: {
    cacheLocation: "localStorage", // Ou sessionStorage
    storeAuthStateInCookie: true,
  },
};

const pca = new PublicClientApplication(msalConfig);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <MsalProvider instance={pca}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </MsalProvider>
);
