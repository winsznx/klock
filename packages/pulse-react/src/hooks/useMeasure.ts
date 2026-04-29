import { useState, useRef, useEffect } from 'react';
export const useMeasure = () => { const ref = useRef<any>(null); const [bounds, set] = useState({width:0,height:0}); return [ref, bounds] as const; };
