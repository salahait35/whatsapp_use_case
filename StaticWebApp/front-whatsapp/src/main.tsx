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
    clientId: "a233eb7d-6818-49f9-9fd9-73bd7fce3e1b",
    authority: "https://whatsappissy.b2clogin.com/whatsappissy.onmicrosoft.com/B2C_1_susi",
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
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
