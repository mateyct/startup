class ServerPlayer {
    constructor(name, x, y, index) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.index = index;
        this.moves = 0;
        this.guesses = {};
    }
}

module.exports = ServerPlayer;