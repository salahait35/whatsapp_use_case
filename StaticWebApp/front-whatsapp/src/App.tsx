import React, { useEffect, useState } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import Home from "./Homepage";

const App: React.FC = () => {
  const { instance, accounts } = useMsal();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Vérifie si l'instance MSAL est prête
    if (accounts.length > 0) {
      setIsAuthenticated(true);
    }
  }, [accounts]);

  const handleLogin = () => {
    instance.loginRedirect().catch((e) => console.error(e));
  };

  const handleProtectedPage = () => {
    if (isAuthenticated) {
      window.location.href = "/home";
    } else {
      handleLogin();
    }
  };

  return (
    <div>
      <button onClick={handleLogin}>Connexion</button>
      <button onClick={handleProtectedPage}>Accéder à la page protégée</button>

      <BrowserRouter>
        <Routes>
          <Route
            path="/home"
            element={
              isAuthenticated ? <Home /> : <h1>Vous devez être connecté</h1>
            }
          />
          <Route path="/" element={<h1>Page publique</h1>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
