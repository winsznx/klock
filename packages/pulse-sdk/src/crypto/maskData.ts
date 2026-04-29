export const maskData = (str: string, showLast=4) => str.length > showLast ? '*'.repeat(str.length - showLast) + str.slice(-showLast) : str;
