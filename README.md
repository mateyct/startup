# Medical Murder Mystery Project

This is a project that showcases an HTTP API, integration with a MongoDB database, and real-time communication using WebSocket. It was originally a class project
for CS 260 at Brigham Young University, but my project went above and beyond the requirements, so I've included in my portfolio of projects.

## Product Description

Medical Murder Mystery is a game where players act as characters working in a hospital. Each player will be able to navigate around the simple map, entering rooms one by one. As they do, they will be able to suspect their fellow players of murder by various means in multiple possible locations. It's based off of the popular board game Clue, but with a medical spin on it. Players will also be able to go back and see accusations they have made. *Note: There are differences between this game and Clue. Players do not start with with any information, nor do they share their information with others. Clues are revealed automatically as players make guesses.*

Play the game online [here](https://startup.masontolley.com).

The backend/API is the primary focus of this project. The frontend is simply a functional interface designed to support backend.
The backend code for this project can be found in the `./service` directory.

### Run the project

#### Requirements

This project is built with Node.js. You will need to have Node and NPM installed to run this project.

To run this project yourself, you will need access to a MongoDB database. Docker would work great for this if you don't have a hosted MongoDB database. Place the following credentials in a file in the `./service` directory. Name the file `dbConfig.json`:

```json
// ./service/dbConfig.json
{
  "hostname": "",
  "userName": "",
  "password": ""
}
```

#### Steps

To set up the project, follow these steps:

In the root directory:

```sh
npm install
```

Then:

```sh
cd service
npm install
```

To run the project, open two terminals.
In the first terminal:

```sh
cd service
node index.js
```

In the second terminal, in the root directory:
```sh
npm run dev
```

Follow the link provided to show the locally hosted site.

### Elevator pitch

Want to be the best investigator in town? Good at sniffing out your suspicious friends? Then Medical Murder Mystery is the game for you! Take on the role of a medical worker in Provo City Hospital where a mysterious murder has taken place. The Provo police have tasked you and your coworkers with finding the culprit, but you suspect it was one of them, or perhaps even yourself. Come play and find out!

### Key features

- Users can securely sign in
- Several users can join together in a game
- On their turn, players will roll dice, move spaces, enter rooms, and submit suspicions
- The board will update with player movements on every device
- Players' suspicion submissions will be stored and viewable on a separate page after the game
- Player turns will rotate around active players
- Players will gather info automatically when they make a guess
- When a player submits a correct guess, they win

### Technologies

Below is the list of technologies used in the project.

- **JavaScript** - All logic for this project is in JavaScript.
- **Service** - There are multiple service endpoints:
    * Backend service for logging in.
    * When the player navigates away from the play page and then back, an endpoint updates them on the current state of their game if they were in one.
    * Retrieving history of suspicions for the current user.
- **DB/Login** - The database will store players' credentials and allow them to log in, which is required to play. The database will also store the history of suspicions the player has made.
- **WebSocket** - WebSocket will broadcast the current board and player suspicions in real-time to other players.
- **HTML** - It uses HTML to define the structure of the webpages. There will be three pages:
    1. The login page.
    2. The playing page with the game board.
    3. The history page to see past suspicions and accusations.
- **CSS** - CSS will be used to make the the app look appealing, as well as make it fit on multiple screen sizes.
- **React** - React will be responsible for tying together the HTML, CSS, and JS. It will also handle the routing.
