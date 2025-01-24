import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import App from './App';
import ProtectedRoute from './ProtectedRoute';
import Login from './Login'; // Créez une page pour l'authentification
import './index.css';

const msalConfig = {
  auth: {
    clientId: "106ca2b1-9b9a-4005-978a-92f409cdc35d",
    authority: "https://whatsappissy.b2clogin.com/whatsappissy.onmicrosoft.com/B2C_1_susi",
    redirectUri: "https://yellow-flower-049eb5803.4.azurestaticapps.net/auth/callback",
    postLogoutRedirectUri: "https://yellow-flower-049eb5803.4.azurestaticapps.net/",
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: true,
  },
};

const pca = new PublicClientApplication(msalConfig);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <MsalProvider instance={pca}>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </MsalProvider>
);
