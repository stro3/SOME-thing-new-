const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// API Configuration
const config = {
    NBA_API_BASE_URL: 'https://api.balldontlie.io/v1',
    RAPID_API_KEY: 'YOUR_API_KEY_HERE', // Get from https://rapidapi.com/api-sports/api/api-basketball/
    RAPID_API_HOST: 'api-basketball.p.rapidapi.com',
    REFRESH_INTERVAL: 30000, // 30 seconds
    DATABASE_FILE: path.join(__dirname, 'database.sqlite') // Database configuration
};
