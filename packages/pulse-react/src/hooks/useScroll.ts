import { useState, useEffect } from 'react';
export const useScroll = () => { const [y, setY] = useState(0); useEffect(()=> { const h = ()=>setY(window.scrollY); window.addEventListener('scroll', h); return ()=>window.removeEventListener('scroll', h); },[]); return y; };
