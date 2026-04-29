import { useState } from 'react';
export const useDrag = () => { const [isDragging, set] = useState(false); return { isDragging }; };
