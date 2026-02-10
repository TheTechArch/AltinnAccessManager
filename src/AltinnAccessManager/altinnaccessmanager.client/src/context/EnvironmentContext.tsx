import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Environment = 'tt02' | 'prod';

interface EnvironmentContextType {
  environment: Environment;
  setEnvironment: (env: Environment) => void;
  getResourceRegistryBaseUrl: () => string;
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

export function EnvironmentProvider({ children }: { children: ReactNode }) {
  const [environment, setEnvironmentState] = useState<Environment>(() => {
    // Try to get from localStorage, default to 'tt02'
    const saved = localStorage.getItem('altinn_environment');
    return (saved === 'tt02' || saved === 'prod') ? saved : 'tt02';
  });

  useEffect(() => {
    localStorage.setItem('altinn_environment', environment);
  }, [environment]);

  const setEnvironment = (env: Environment) => {
    setEnvironmentState(env);
  };

  const getResourceRegistryBaseUrl = (): string => {
    return environment === 'prod' 
      ? 'https://platform.altinn.no/resourceregistry/api/v1/Resource'
      : 'https://platform.tt02.altinn.no/resourceregistry/api/v1/Resource';
  };

  return (
    <EnvironmentContext.Provider value={{ environment, setEnvironment, getResourceRegistryBaseUrl }}>
      {children}
    </EnvironmentContext.Provider>
  );
}

export function useEnvironment() {
  const context = useContext(EnvironmentContext);
  if (context === undefined) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider');
  }
  return context;
}
