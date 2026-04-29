export const camelCase = (str: string) => str.replace(/[-_]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');
