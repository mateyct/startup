class LobbyManager {
  constructor() {
    this.lobbies = {}
  }

  checkUserInLobby(username) {
    let correctKey = null;
    let keys = Object.keys(this.lobbies);
    keys.forEach(key => {
        this.lobbies[key].players.forEach((player, index) => {
            if (player.name == username) {
                correctKey = { key: key, playerIndex: index };
            }
        })
    });
    return correctKey;
}
}
