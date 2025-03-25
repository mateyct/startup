class WebSocketHandler {
    constructor() {
        this.initialized = false;
        const unset = () => {
            console.log("This function is unset.");
        };
        // function that is called when received the right type of message
        this.updatePos = unset;
        this.guessResult = unset;
        this.startGameResult = unset;
        this.createNewLobby = unset;
        this.creatorJoin = unset;
        this.updateChat = unset;
        this.updatePlayers = unset;
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
            console.log('socket opened');
        };
        this.socket.onclose = event => {
            console.log('socket closed');
        };
        this.socket.onmessage = data => {
            data = JSON.parse(data.data);
            switch(data.case) {
                case "updatePos":
                    this.updatePos(data);
                    break;
                case "guessResult":
                    this.guessResult(data);
                    break;
                case "startGame":
                    this.startGameResult(data);
                case "creatorJoin":
                    this.creatorJoin(data);
                case "newLobby":
                    this.createNewLobby(data.lobbies);
                    break;
                case "chat":
                    this.updateChat(data);
                    break;
                case "updatePlayers":
                    this.updatePlayers(data);
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
    makeGuess(lobbyID, guesser, player, weapon, room, nextTurn) {
        this.socket.send(JSON.stringify({
            case: "guess",
            lobbyID: lobbyID,
            player: player,
            weapon: weapon,
            room: room,
            nextTurn: nextTurn,
            guesser: guesser
        }));
    }

    // message to cause other games to update
    updateGame(id) {
        this.socket.send(JSON.stringify({
            lobbyID: id,
            case: "update"
        }));
    }

    // socket message to create a lobby
    createLobby(username) {
        this.socket.send(JSON.stringify({
            case: "createLobby",
            username: username
        }));
    }

    // send message to start game
    startGame(id) {
        this.socket.send(JSON.stringify({
            case: "startGame",
            lobbyID: id
        }));
    }

    // send chat to server
    sendChat(lobbyID, message) {
        this.socket.send(JSON.stringify({
            case: "chat",
            lobbyID: lobbyID,
            message
        }));
    }
}

const webSocket = new WebSocketHandler();
export { webSocket };