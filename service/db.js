const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');

// set up all database info
const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db('mmmystery-info');
const history = db.collection('history');
const users = db.collection('users');

// function to make sure DB connection works
async function pingDB() {
    try {
        db.command({ping: 1});
        console.log("Database connection succesful.");
    }
    catch (e) {
        console.log("Connection to database failed. " + e.message);
        process.exit(1);
    }
}
pingDB();

// provide functions access database
function getUser(username) {
    return users.findOne({username});
}

function getUserByToken(token) {
    return users.findOne({token});
}

// gets the user's history, anything that mentions their name
function getUserHistory(username) {
    return history.find({$or: {guesser: username, person: username}});
}