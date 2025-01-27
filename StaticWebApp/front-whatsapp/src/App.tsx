import React, { useEffect, useState } from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import Home from "./Homepage";
import './App.css';

const App: React.FC = () => {
  const { instance, accounts } = useMsal();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Vérifie si l'utilisateur est connecté
    if (accounts.length > 0) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [accounts]);

  const handleLogin = () => {
    instance.loginRedirect().catch((e) => console.error(e));
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirection automatique vers Home */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/home" replace />
            ) : (
              handleLogin() || <h1>Connexion en cours...</h1>
            )
          }
        />
        <Route
          path="/home"
          element={
            isAuthenticated ? <Home /> : <Navigate to="/" replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
