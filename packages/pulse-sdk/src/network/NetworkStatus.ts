export class NetworkStatus { static isOnline() { return typeof navigator !== 'undefined' ? navigator.onLine : true; } }
