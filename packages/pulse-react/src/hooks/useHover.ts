import { useState, useRef } from 'react';
export const useHover = () => { const [hovered, set] = useState(false); const ref = useRef(null); return [ref, hovered] as const; };
