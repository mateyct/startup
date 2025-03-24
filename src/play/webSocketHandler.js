class WebSocketHandler {
    constructor() {
        this.initialized = false;
        const unset = () => {
            console.log("This function is unset.");
        };
        // function that is called when received the right type of message
        this.updatePos = unset;
    }

    // initialize the websocket
    initialize () {
        // set up the websocket
        let port = window.location.port;
        const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
        const userName = localStorage.getItem("userName");
        this.socket = new WebSocket(`${protocol}://${window.location.hostname}:${port}/ws?username=${userName}`);
        // event handlers
        this.socket.onopen = event => {
            console.log('opened');
        };
        this.socket.onclose = event => {
            console.log('closed');
        };
        this.socket.onmessage = data => {
            data = JSON.parse(data.data);
            console.log(data);
            switch(data.case) {
                case "updatePos":
                    this.updatePos(data);
                    break;
                default:
                    break;
            }
        };
        this.initialized = true;
    }

    // close the socket at the end
    cleanup () {
        if (this.initialized) this.socket.close();
    }

    // send the current position
    sendPosition(index, x, y, moves, turn, currentRoom, recentArrival, lobbyID, playerName) {
        const data = JSON.stringify({
            case: "updatePos",
            index: index,
            x: x,
            y: y,
            moves: moves,
            turn: turn,
            currentRoom: currentRoom,
            recentArrival: recentArrival,
            lobbyID: lobbyID,
            playerName: playerName
        });
        this.socket.send(data);
    }

    // join lobby
    joinLobby(id) {
        this.socket.send(JSON.stringify({
            lobbyID: id,
            case: "joinLobby"
        }));
    }

    // socket command for making a guess
    

    // message to cause other games to update
    updateGame(id) {
        this.socket.send(JSON.stringify({
            lobbyID: id,
            case: "update"
        }));
    }
}

const webSocket = new WebSocketHandler();
export { webSocket };