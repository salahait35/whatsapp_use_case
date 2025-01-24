import React from 'react';
import { useMsal } from '@azure/msal-react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { accounts } = useMsal();

  // Si aucun compte n'est trouvé, redirige vers la page de login
  if (!accounts || accounts.length === 0) {
    return <Navigate to="/login" replace />;
  }

  // Sinon, affiche les enfants (le contenu protégé)
  return <>{children}</>;
};

export default ProtectedRoute;
