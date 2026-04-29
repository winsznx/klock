import { useState } from 'react';
export const useWindowScroll = () => { const [scroll, set] = useState({x:0, y:0}); return scroll; };
