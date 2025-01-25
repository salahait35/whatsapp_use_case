import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import Home from "./Home";
import ProtectedRoute from "./ProtectedRoute";

const App: React.FC = () => {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginRedirect().catch((e) => console.error(e));
  };

  return (
    <Router>
      <div>
        <button onClick={handleLogin}>Connexion</button>
        <Routes>
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/" element={<h1>Page publique</h1>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
