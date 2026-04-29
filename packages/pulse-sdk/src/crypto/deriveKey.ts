import { encodeHexStrict } from './encodeHexStrict.js';
export const deriveKey = (secret: string, salt: string) => encodeHexStrict(secret + salt);
