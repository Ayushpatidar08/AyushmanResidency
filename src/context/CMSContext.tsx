import React, { createContext, useContext, useState, useEffect } from 'react';

interface CMSData {
  [key: string]: string;
}

interface CMSContextType {
  data: CMSData;
  loading: boolean;
  error: string | null;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export function CMSProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<CMSData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCMS() {
      try {
        const response = await fetch('/api/cms');
        if (!response.ok) throw new Error('Failed to fetch CMS data');
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err: any) {
        console.error('[CMS Context] Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCMS();
  }, []);

  return (
    <CMSContext.Provider value={{ data, loading, error }}>
      {children}
    </CMSContext.Provider>
  );
}

export function useCMS() {
  const context = useContext(CMSContext);
  if (context === undefined) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
}
