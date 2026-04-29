export const sanitizeInput = (str: string) => str.replace(/[^a-zA-Z0-9_-]/g, '');
