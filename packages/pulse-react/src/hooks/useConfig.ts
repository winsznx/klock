import { useContext } from 'react';
import { ConfigContext } from '../providers/ConfigProvider.js';
export const useConfig = () => useContext(ConfigContext);
