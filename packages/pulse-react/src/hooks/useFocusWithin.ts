import { useState } from 'react';
export const useFocusWithin = () => { const [focused, set] = useState(false); return { focused }; };
