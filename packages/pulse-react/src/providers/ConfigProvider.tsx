import React, { createContext } from 'react';
export const ConfigContext = createContext<Record<string, string>>({});
export const ConfigProvider = ({ config, children }: { config: Record<string, string>, children: React.ReactNode }) => (
  <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
);
