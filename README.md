<!--# Medical Murder Mystery

## dataFiles Info
Below is important info about the files in dataFiles

### rooms.json
For this file, the positions of the doors array in each room is relative to the position of the room, making it easier to add with code.
-->
# Medical Murder Mystery

[My Notes](./notes.md)

Medical Murdery Mystery is a game where players act as characters working in a hospital. Each player will be able to navigate around the simple map, entering rooms one by one. As they do, they will be able to suspect their fellow players of murder by various means in multiple possible locations. It's based off of the popular board game Clue, but with a medical spin on it. Players will also be able to go back and see accusations made against them.

## 🚀 Specification Deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] Proper use of Markdown
- [x] A concise and compelling elevator pitch
- [x] Description of key features
- [x] Description of how you will use each technology
- [x] One or more rough sketches of your application. Images must be embedded in this file using Markdown image references.

### Elevator pitch

Want to be the best investigator in town? Good at sniffing out yoru suspicious friends? Then Medical Murdery Mystery is the game for you! Take on the role of a medical worker in Provo City Hospital where a mysterious murder has taken place. The Provo police have tasked you and your coworkers with finding the culprit, but you suspect it was one of them, or perhaps even yourself. Come play and find out!

### Design

<img src="readmeImgs/MMM_login.png" alt="Login-Image" style="width:40%; height:auto;">
<img src="readmeImgs/board.png" alt="Board-Image" style="width:30%; height:auto;">

These two images are mockups of the site and board. There is a simple login page, and there is the playing page, which will include the board. I will probably make the board more visually interesting as well. The playing page will include some player information and display the current suspicions being voiced by other players.

<!--```mermaid
sequenceDiagram
    actor You
    actor Website
    You->>Website: Replace this with your design
```-->

### Key features

- Users can securely sign in
- Several users can join together in a game
- On their turn, players will roll dice, move spaces, enter rooms, and submit suspicions
- The board will update with player movements on every device
- Players' suspicion submissions will be stored and viewable
- Player turns will rotate around active players
- If enough time:
    - Players will have pieces of information
    - Players can gather information as they submit suspicions
    - A player can make a final accusation and win if correct

### Technologies

I am going to use the required technologies in the following ways.

- **HTML** - It uses HTML to define the structure of the webpages. There will be three pages:
    1. The login page.
    2. The playing page with the game board.
    3. The history page to see past suspicions and accusations.
- **CSS** - CSS will be used to make the the app look appealing, as well as make it fit on multiple screen sizes.
- **JavaScript** - JavaScript will define the main functionality of moving on the board and submitting suspicions.
- **React** - React will be responsible for tying together the HTML, CSS, and JS. It will also handle the routing.
- **Service** - There will be multiple service endpoints:
    * Backend service for logging in
    * Sending board moves and suspicions to the backend
    * Retrieving history of suspicions to display
    * Using an API like [RPG Dice Roller](https://rpg-dice-roller-api.djpeacher.com/) to retrieve a random dice roll
    * Also retrieving a random Book of Mormon verse to display in the footer from [BraydenTW/book-of-mormon-api](https://book-of-mormon-api.vercel.app) ([GitHub](https://github.com/BraydenTW/book-of-mormon-api))
- **DB/Login** - The database will store players' credentials and allow them to log in, which is required to play. The database will also store the history of suspicions the player has made.
- **WebSocket** - WebSocket will broadcast the current board and player suspicions in real-time to other players.

## 🚀 AWS deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **Server deployed and accessible with custom domain name** - [My server link](https://mmmystery.click/).

## 🚀 HTML deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **HTML pages** - The 3 HTML pages are filled and linked together.
- [x] **Proper HTML element usage** - Each page contains MAIN, NAV, HEADER, BODY, FOOTER
- [x] **Links** - Each page contains navigation links in the header.
- [x] **Text** - Pages have placeholder text that represents what it will be like.
- [x] **3rd party API placeholder** - There is a button that will eventually call a dice roller API. The footer also shows a placeholder for a random Book of Mormon verse.
- [x] **Images** - There is a favicon, and it is also used in the header of each page.
- [x] **Login placeholder** - The login is represented on the index.html page.
- [x] **DB data placeholder** - The history page shows history data that will be stored in the database.
- [x] **WebSocket placeholder** - The game board and players will update in realtime.

## 🚀 CSS deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **Header, footer, and main content body** - I did not complete this part of the deliverable.
- [ ] **Navigation elements** - I did not complete this part of the deliverable.
- [ ] **Responsive to window resizing** - I did not complete this part of the deliverable.
- [ ] **Application elements** - I did not complete this part of the deliverable.
- [ ] **Application text content** - I did not complete this part of the deliverable.
- [ ] **Application images** - I did not complete this part of the deliverable.

## 🚀 React part 1: Routing deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **Bundled using Vite** - I did not complete this part of the deliverable.
- [ ] **Components** - I did not complete this part of the deliverable.
- [ ] **Router** - Routing between login and voting components.

## 🚀 React part 2: Reactivity

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **All functionality implemented or mocked out** - I did not complete this part of the deliverable.
- [ ] **Hooks** - I did not complete this part of the deliverable.

## 🚀 Service deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **Node.js/Express HTTP service** - I did not complete this part of the deliverable.
- [ ] **Static middleware for frontend** - I did not complete this part of the deliverable.
- [ ] **Calls to third party endpoints** - I did not complete this part of the deliverable.
- [ ] **Backend service endpoints** - I did not complete this part of the deliverable.
- [ ] **Frontend calls service endpoints** - I did not complete this part of the deliverable.
- []  **Supports registration, login, logout, and restricted endpoint** - I did not complete this part of the deliverable.

## 🚀 DB/Login deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **Stores data in MongoDB** - I did not complete this part of the deliverable.
- [ ] **Stores credentials in MongoDB** - I did not complete this part of the deliverable.

## 🚀 WebSocket deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **Backend listens for WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **Frontend makes WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **Data sent over WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **WebSocket data displayed** - I did not complete this part of the deliverable.
- [ ] **Application is fully functional** - I did not complete this part of the deliverable.
