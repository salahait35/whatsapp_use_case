import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { MsalProvider, useMsal, useAccount } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./authConfig";
import Home from "./Homepage";
import "./index.css";

const msalInstance = new PublicClientApplication(msalConfig);

const Root: React.FC = () => {
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || null); // Récupère l'utilisateur connecté
  const [msalInitialized, setMsalInitialized] = useState(false);

  useEffect(() => {
    // Initialisation explicite de MSAL
    instance
      .initialize()
      .then(() => setMsalInitialized(true))
      .catch((e) => console.error("Erreur d'initialisation MSAL :", e));
  }, [instance]);

  useEffect(() => {
    if (msalInitialized && !account) {
      // Redirige l'utilisateur si MSAL est initialisé et qu'il n'est pas authentifié
      instance.loginRedirect().catch((e) => console.error("Erreur de redirection :", e));
    }
  }, [msalInitialized, account, instance]);

  if (!msalInitialized) {
    return (
      <div style={{ textAlign: "center", marginTop: "20%" }}>
        <h1>Chargement de MSAL...</h1>
      </div>
    );
  }

  if (!account) {
    return (
      <div style={{ textAlign: "center", marginTop: "20%" }}>
        <h1>Connexion en cours...</h1>
      </div>
    );
  }

  return <Home />;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  //<React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <Root />
    </MsalProvider>
  //</React.StrictMode>
);
