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
  const account = useAccount(accounts[0] || null);
  const [msalInitialized, setMsalInitialized] = useState(false);
  const [message, setMessage] = useState<string | null>(null); // Message state

  useEffect(() => {
    // Initialize MSAL
    instance
      .initialize()
      .then(() => setMsalInitialized(true))
      .catch((e) => console.error("Erreur d'initialisation MSAL :", e));
  }, [instance]);

  useEffect(() => {
    if (msalInitialized && !account) {
      instance.loginRedirect().catch((e) => console.error("Erreur de redirection :", e));
    }
  }, [msalInitialized, account, instance]);

  useEffect(() => {
    // Mock SignalR functionality
    const fakeSignalR = {
      on(event: string, callback: (msg: string) => void) {
        if (event === "ReceiveMessage") {
          // Simulate receiving a message after 3 seconds
          setTimeout(() => {
            callback("This is a test message from the mocked SignalR connection!");
          }, 3000);
        }
      },
      off(event: string) {
        console.log(`Disconnected from event: ${event}`);
      },
    };

    // Simulate SignalR connection
    fakeSignalR.on("ReceiveMessage", (msg: string) => {
      setMessage(msg); // Display received message
    });

    return () => {
      fakeSignalR.off("ReceiveMessage"); // Cleanup
    };
  }, [msalInitialized, account]);

  const closeNotification = () => {
    setMessage(null); // Clear the message
  };

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

  return (
    <>
      <Home />
      {message && (
        <div className="notification">
          <p>{message}</p>
          <button onClick={closeNotification}>Fermer</button>
        </div>
      )}
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <Root />
    </MsalProvider>
  </React.StrictMode>
);
