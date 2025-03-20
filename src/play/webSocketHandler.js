class WebSocketHandler {
    constructor() {
        this.initialized = false;
    }

    // initialize the websocket
    initialize () {
        // set up the websocket
        let port = window.location.port;
        const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
        this.socket = new WebSocket(`${protocol}://${window.location.hostname}:${port}/ws`);
        // event handlers
        this.socket.onopen = event => {
            console.log('opened');
        };
        this.socket.onclose = event => {
            console.log('closed');
        };
        this.socket.onmessage = msg => {
            console.log(msg);
        };
        this.initialized = true;
    }

    // close the socket at the end
    cleanup () {
        if (this.initialized) this.socket.close();
    }
}

const webSocket = new WebSocketHandler();
export { webSocket };