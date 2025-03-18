const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create a new database file
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), (err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Create tables
db.serialize(() => {
    // Create games table
    db.run(`CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY,
        homeTeam TEXT,
        awayTeam TEXT,
        homeScore INTEGER,
        awayScore INTEGER,
        date TEXT,
        status TEXT
    )`);

    // Create players table
    db.run(`CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY,
        name TEXT,
        team TEXT,
        position TEXT,
        ppg REAL,
        rpg REAL,
        apg REAL,
        fgPercentage REAL
    )`);

    // Create teams table
    db.run(`CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY,
        name TEXT,
        conference TEXT,
        division TEXT
    )`);
});

// Close the database connection
db.close();
