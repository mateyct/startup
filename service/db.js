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

async function addUser(user) {
    await users.insertOne(user);
}

// update user with token to log them in
async function updateUser(user) {
    await users.replaceOne({username: user.username}, user);
}

function getUserByToken(token) {
    return users.findOne({token});
}

// gets the user's history, anything that mentions their name
function getUserHistory(username) {
    return history.find({$or: [{guesser: username}, {person: username}]}, {sort: {date: -1}}).toArray();
}

async function addUserHistory(toAdd) {
    await history.insertOne(toAdd);
}

module.exports = {
    getUser,
    getUserByToken,
    getUserHistory,
    addUser,
    addUserHistory,
    updateUser
}