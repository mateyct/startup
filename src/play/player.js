export class Player {
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