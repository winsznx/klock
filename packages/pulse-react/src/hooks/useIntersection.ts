import { useState } from 'react';
export const useIntersection = (ref: any) => { const [isIntersecting, set] = useState(false); return isIntersecting; };
