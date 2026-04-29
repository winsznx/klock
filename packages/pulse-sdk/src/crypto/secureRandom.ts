export const secureRandom = () => typeof crypto !== 'undefined' ? crypto.getRandomValues(new Uint32Array(1))[0] : Math.random() * 0xffffffff;
