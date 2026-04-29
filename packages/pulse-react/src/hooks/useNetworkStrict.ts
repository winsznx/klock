import { useContext } from 'react';
import { NetworkContext } from '../providers/NetworkProvider.js';
export const useNetworkStrict = () => useContext(NetworkContext);
