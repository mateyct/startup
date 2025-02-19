export class Player {
    constructor(x, y, color, disabled, currentRoom, moves, turn, recentArrival, name) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.disabled = disabled;
        this.currentRoom = currentRoom;
        this.moves = moves;
        this.turn = turn;
        this.recentArrival = recentArrival;
        this.name = name;
    }
}