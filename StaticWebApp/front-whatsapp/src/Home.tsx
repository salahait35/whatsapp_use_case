import React from "react";
import { useAccount, useMsal } from "@azure/msal-react";

const Home: React.FC = () => {
  const { accounts } = useMsal();

  // Récupérer les informations du premier compte authentifié
  const account = useAccount(accounts[0] || null);



  return (
    <div>
      <h1>Bienvenue sur la page protégée !</h1>
      {account ? (
        <div>
          <h2>Informations utilisateur :</h2>
          <pre>{JSON.stringify(account, null, 2)}</pre>
        </div>
      ) : (
        <p>Aucun utilisateur connecté</p>
      )}
    </div>
  );
};

export default Home;
