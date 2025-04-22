'use client';

import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ClientAuthWrapperProps {
  children: (auth: ReturnType<typeof useAuth>) => React.ReactNode;
}

/**
 * A wrapper component that provides auth context to client components
 * Use this in the server components where you need to access auth context on the client side
 */
const ClientAuthWrapper: React.FC<ClientAuthWrapperProps> = ({ children }) => {
  const auth = useAuth();
  
  return <>{children(auth)}</>;
};

export default ClientAuthWrapper; 