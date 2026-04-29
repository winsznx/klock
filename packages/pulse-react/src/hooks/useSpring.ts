import { useState } from 'react';
export const useSpring = (target: number) => { const [val] = useState(target); return val; };
