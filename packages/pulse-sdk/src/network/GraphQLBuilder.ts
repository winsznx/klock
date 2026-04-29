export const buildQuery = (name: string, fields: string[]) => `query { ${name} { ${fields.join(' ')} } }`;
