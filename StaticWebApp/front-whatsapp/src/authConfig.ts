export const msalConfig = {
  auth: {
      clientId: "ffef2490-f249-40a4-a713-61dc878a157a",  // Utilisez votre ClientId Azure AD B2C
      authority: "https://whatsappissy.b2clogin.com/whatsappissy.onmicrosoft.com/b2c_1_susi",  // URL d'autorité spécifique à votre politique B2C
      knownAuthorities: ["whatsappissy.b2clogin.com"],  // Spécifiez l'autorité connue
      cloudDiscoveryMetadata: "",  // Laissez vide si vous ne l'utilisez pas
      redirectUri: "http://localhost:5173/",  // URL de redirection après authentification
      postLogoutRedirectUri: "http://localhost:5173/",  // URL de redirection après la déconnexion
      navigateToLoginRequestUrl: true,
      clientCapabilities: ["CP1"],  // Ajoutez cette ligne si nécessaire
      tenantId: "98a36095-ba04-4fed-85fc-d4c844826790"
  },/*
  
  cache: {
      cacheLocation: "sessionStorage",  // Stockage temporaire de la session
      temporaryCacheLocation: "sessionStorage",  // Cache temporaire pour cette session
      storeAuthStateInCookie: false,  // N'enregistrez pas l'état d'authentification dans les cookies
      secureCookies: false,  // Cookies non sécurisés
      claimsBasedCachingEnabled: true,  // Active le cache basé sur les revendications
  },
  */

  
    scopes: ["https://whatsappissy.onmicrosoft.com/e1b1fe84-91db-44ac-8a19-e5ff1adbafec/getallusers"],

  telemetry: {
      application: {
          appName: "My Application",  // Nom de l'application
          appVersion: "1.0.0",  // Version de l'application
      },
  },
};


