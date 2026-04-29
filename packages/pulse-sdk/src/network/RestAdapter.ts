export class RestAdapter { baseUrl: string; constructor(url: string) { this.baseUrl = url; } async get(path: string) { return fetch(this.baseUrl + path); } }
