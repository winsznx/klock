import React, { createContext } from 'react';
export const NetworkContext = createContext({ networkId: 1, isTestnet: false });
export const NetworkProvider = ({ children, value }: { children: React.ReactNode, value: any }) => (
  <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
);
