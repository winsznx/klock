import { useState } from 'react';
export function useStateMachine<S>(initial: S) { const [s, setS] = useState<S>(initial); return [s, setS] as const; }
