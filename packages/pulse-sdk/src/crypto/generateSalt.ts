export const generateSalt = (len=16) => Array.from({length: len}, () => Math.floor(Math.random()*256).toString(16).padStart(2,'0')).join('');
