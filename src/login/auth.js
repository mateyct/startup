export class Auth {
    static Unknown = new Auth('unknown');
    static Authenticated = new Auth('authenticated');
    static Unauthenticated = new Auth('unauthenticated');

    constructor(name) {
        this.name = name;
    }
}