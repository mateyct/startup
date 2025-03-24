class Player {
    constructor(color, disabled, currentRoom, moves, turn, recentArrival, name) {
        this.x = 7;
        this.y = 7;
        this.color = color;
        this.disabled = disabled;
        this.currentRoom = currentRoom;
        this.moves = moves;
        this.turn = turn;
        this.recentArrival = recentArrival;
        this.name = name;
    }
}

// also have player options
const playerOptions = [
    new Player('yellow', '#FFFFC5', null, 0, true, false, ""),
    new Player('green', '#c4ffc4', null, 0, true, false, ""),
    new Player('blue', '#c7c7ff', null, 0, true, false, ""),
    new Player('red', '#ffa8a8', null, 0, true, false, "")
];

export { playerOptions };