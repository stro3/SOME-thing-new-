const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

// Basketball Service for handling real-time data and database operations
const basketballService = {
    listeners: new Map(),
    baseUrl: 'https://api.balldontlie.io/v1',
    REFRESH_INTERVAL: 30000, // 30 seconds

    // Database Operations
    initDatabase() {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                // Create games table if not exists
                db.run(`CREATE TABLE IF NOT EXISTS games (
                    id INTEGER PRIMARY KEY,
                    homeTeam TEXT,
                    awayTeam TEXT,
                    homeScore INTEGER,
                    awayScore INTEGER,
                    date TEXT,
                    status TEXT
                )`, (err) => {
                    if (err) {
                        console.error('Error creating games table:', err);
                        reject(err);
                    }
                });

                // Create players table if not exists
                db.run(`CREATE TABLE IF NOT EXISTS players (
                    id INTEGER PRIMARY KEY,
                    name TEXT,
                    team TEXT,
                    position TEXT,
                    ppg REAL,
                    rpg REAL,
                    apg REAL,
                    fgPercentage REAL,
                    image TEXT
                )`, (err) => {
                    if (err) {
                        console.error('Error creating players table:', err);
                        reject(err);
                    }
                });

                // Create teams table if not exists
                db.run(`CREATE TABLE IF NOT EXISTS teams (
                    id INTEGER PRIMARY KEY,
                    name TEXT,
                    conference TEXT,
                    division TEXT,
                    logo TEXT
                )`, (err) => {
                    if (err) {
                        console.error('Error creating teams table:', err);
                        reject(err);
                    }
                });

                // Create users table if not exists
                db.run(`CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE,
                    email TEXT UNIQUE,
                    password TEXT,
                    favoriteTeam INTEGER,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (favoriteTeam) REFERENCES teams(id)
                )`, (err) => {
                    if (err) {
                        console.error('Error creating users table:', err);
                        reject(err);
                    }
                });

                // Create user_favorites table for tracking favorite players and teams
                db.run(`CREATE TABLE IF NOT EXISTS user_favorites (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    player_id INTEGER,
                    team_id INTEGER,
                    type TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    FOREIGN KEY (player_id) REFERENCES players(id),
                    FOREIGN KEY (team_id) REFERENCES teams(id)
                )`, (err) => {
                    if (err) {
                        console.error('Error creating user_favorites table:', err);
                        reject(err);
                    } else {
                        console.log('All database tables created successfully');
                        resolve();
                    }
                });
            });
        });
    },

    // Function to store live games in the database
    async storeLiveGames(games) {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare(`INSERT OR REPLACE INTO games (id, homeTeam, awayTeam, homeScore, awayScore, date, status) VALUES (?, ?, ?, ?, ?, ?, ?)`);
            
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');
                
                let completed = 0;
                for (const game of games) {
                    stmt.run(
                        game.id, 
                        game.homeTeam, 
                        game.awayTeam, 
                        game.homeScore, 
                        game.awayScore, 
                        game.date.toISOString(), 
                        game.status,
                        function(err) {
                            if (err) {
                                console.error('Error storing game:', err);
                                db.run('ROLLBACK');
                                reject(err);
                                return;
                            }
                            
                            completed++;
                            if (completed === games.length) {
                                stmt.finalize();
                                db.run('COMMIT', function(err) {
                                    if (err) {
                                        console.error('Error committing transaction:', err);
                                        reject(err);
                                    } else {
                                        console.log(`Successfully stored ${games.length} games`);
                                        resolve();
                                    }
                                });
                            }
                        }
                    );
                }
                
                // Handle empty games array
                if (games.length === 0) {
                    stmt.finalize();
                    db.run('COMMIT');
                    resolve();
                }
            });
        });
    },

    // Function to retrieve live games from the database
    async getStoredLiveGames() {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM games`, [], (err, rows) => {
                if (err) {
                    console.error('Error retrieving games:', err);
                    reject(err);
                } else {
                    // Format dates properly
                    const games = rows.map(game => ({
                        ...game,
                        date: new Date(game.date)
                    }));
                    resolve(games);
                }
            });
        });
    },

    // Store player data in the database
    async storePlayerData(players) {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare(`INSERT OR REPLACE INTO players 
                (id, name, team, position, ppg, rpg, apg, fgPercentage, image) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');
                
                let completed = 0;
                for (const player of players) {
                    stmt.run(
                        player.id,
                        player.name,
                        player.team,
                        player.position,
                        player.ppg,
                        player.rpg,
                        player.apg,
                        player.fgPercentage,
                        player.image || null,
                        function(err) {
                            if (err) {
                                console.error('Error storing player:', err);
                                db.run('ROLLBACK');
                                reject(err);
                                return;
                            }
                            
                            completed++;
                            if (completed === players.length) {
                                stmt.finalize();
                                db.run('COMMIT', function(err) {
                                    if (err) {
                                        console.error('Error committing transaction:', err);
                                        reject(err);
                                    } else {
                                        console.log(`Successfully stored ${players.length} players`);
                                        resolve();
                                    }
                                });
                            }
                        }
                    );
                }
                
                // Handle empty players array
                if (players.length === 0) {
                    stmt.finalize();
                    db.run('COMMIT');
                    resolve();
                }
            });
        });
    },

    // Get players from database
    async getStoredPlayers() {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM players`, [], (err, rows) => {
                if (err) {
                    console.error('Error retrieving players:', err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    },

    // User authentication and management
    async registerUser(username, email, password, favoriteTeam = null) {
        return new Promise((resolve, reject) => {
            // In a real app, you would hash the password before storing
            const stmt = db.prepare(`INSERT INTO users (username, email, password, favoriteTeam) VALUES (?, ?, ?, ?)`);
            stmt.run(username, email, password, favoriteTeam, function(err) {
                stmt.finalize();
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        reject(new Error('Username or email already exists'));
                    } else {
                        console.error('Error registering user:', err);
                        reject(err);
                    }
                } else {
                    resolve({
                        id: this.lastID,
                        username,
                        email
                    });
                }
            });
        });
    },

    async loginUser(username, password) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT id, username, email, favoriteTeam FROM users WHERE username = ? AND password = ?`, 
                [username, password], (err, row) => {
                if (err) {
                    console.error('Error logging in:', err);
                    reject(err);
                } else if (!row) {
                    reject(new Error('Invalid username or password'));
                } else {
                    resolve(row);
                }
            });
        });
    },

    async addToFavorites(userId, itemId, type) {
        return new Promise((resolve, reject) => {
            let stmt;
            if (type === 'player') {
                stmt = db.prepare(`INSERT INTO user_favorites (user_id, player_id, type) VALUES (?, ?, ?)`);
                stmt.run(userId, itemId, type);
            } else if (type === 'team') {
                stmt = db.prepare(`INSERT INTO user_favorites (user_id, team_id, type) VALUES (?, ?, ?)`);
                stmt.run(userId, itemId, type);
            } else {
                reject(new Error('Invalid favorite type'));
                return;
            }
            
            stmt.finalize((err) => {
                if (err) {
                    console.error(`Error adding ${type} to favorites:`, err);
                    reject(err);
                } else {
                    resolve({ success: true });
                }
            });
        });
    },

    async getFavorites(userId) {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    uf.id, uf.type, uf.created_at,
                    p.id as player_id, p.name as player_name, p.team as player_team, p.position,
                    t.id as team_id, t.name as team_name, t.conference, t.division
                FROM user_favorites uf
                LEFT JOIN players p ON uf.player_id = p.id
                LEFT JOIN teams t ON uf.team_id = t.id
                WHERE uf.user_id = ?
            `, [userId], (err, rows) => {
                if (err) {
                    console.error('Error retrieving favorites:', err);
                    reject(err);
                } else {
                    // Format the results into players and teams
                    const favorites = {
                        players: rows.filter(row => row.type === 'player').map(row => ({
                            id: row.player_id,
                            name: row.player_name,
                            team: row.player_team,
                            position: row.position
                        })),
                        teams: rows.filter(row => row.type === 'team').map(row => ({
                            id: row.team_id,
                            name: row.team_name,
                            conference: row.conference,
                            division: row.division
                        }))
                    };
                    resolve(favorites);
                }
            });
        });
    },

    async fetchWithRetry(endpoint, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(`${this.baseUrl}/${endpoint}`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return await response.json();
            } catch (error) {
                console.warn(`Attempt ${i + 1} failed: ${error.message}`);
                if (i === retries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    },

    // Event handling
    subscribe(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    },

    notify(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => callback(data));
        }
    },

    // Live Games
    async getLiveGames() {
        try {
            const response = await this.fetchWithRetry('games?per_page=100&seasons[]=2024');
            const data = await response;
            const today = new Date();
            
            // Filter games happening today
            const todayGames = data.data.filter(game => {
                const gameDate = new Date(game.date);
                return gameDate.toDateString() === today.toDateString();
            });

            const formattedGames = todayGames.map(game => ({
                id: game.id,
                homeTeam: game.home_team.full_name,
                homeScore: game.home_team_score,
                awayTeam: game.visitor_team.full_name,
                awayScore: game.visitor_team_score,
                status: game.status,
                period: game.period
            }));

            this.notify('liveGamesUpdated', formattedGames);
            return formattedGames;
        } catch (error) {
            console.error('Error fetching live games:', error);
            return [];
        }
    },

    // Player Statistics
    async getPlayerStats(searchQuery) {
        try {
            const response = await this.fetchWithRetry(`players?search=${searchQuery}`);
            const data = await response;
            
            const playerStats = await Promise.all(data.data.map(async player => {
                const statsResponse = await this.fetchWithRetry(`season_averages?player_ids[]=${player.id}`);
                const statsData = await statsResponse;
                const stats = statsData.data[0] || {};
                
                return {
                    id: player.id,
                    name: `${player.first_name} ${player.last_name}`,
                    team: player.team.full_name,
                    position: player.position,
                    ppg: stats.pts || 0,
                    rpg: stats.reb || 0,
                    apg: stats.ast || 0,
                    fgPercentage: stats.fg_pct ? (stats.fg_pct * 100).toFixed(1) : 0
                };
            }));

            this.notify('playerStatsUpdated', playerStats);
            return playerStats;
        } catch (error) {
            console.error('Error fetching player stats:', error);
            return [];
        }
    },

    // Team Statistics
    async getTeamStats(teamId) {
        try {
            const response = await this.fetchWithRetry(`teams/${teamId}`);
            const teamData = await response;

            // Get team's games
            const gamesResponse = await this.fetchWithRetry(`games?team_ids[]=${teamId}&per_page=100`);
            const gamesData = await gamesResponse;
            
            // Calculate team statistics from games
            const stats = this.calculateTeamStats(gamesData.data, teamId);
            
            const teamStats = {
                id: teamData.id,
                name: teamData.full_name,
                conference: teamData.conference,
                division: teamData.division,
                ...stats
            };

            this.notify('teamStatsUpdated', teamStats);
            return teamStats;
        } catch (error) {
            console.error('Error fetching team stats:', error);
            return null;
        }
    },

    calculateTeamStats(games, teamId) {
        let totalPoints = 0;
        let totalRebounds = 0;
        let totalAssists = 0;
        let wins = 0;
        let totalGames = games.length;

        games.forEach(game => {
            const isHomeTeam = game.home_team.id === teamId;
            const teamScore = isHomeTeam ? game.home_team_score : game.visitor_team_score;
            const opponentScore = isHomeTeam ? game.visitor_team_score : game.home_team_score;

            totalPoints += teamScore;
            // Estimate rebounds and assists based on score
            totalRebounds += Math.round(teamScore * 0.8);
            totalAssists += Math.round(teamScore * 0.4);

            if (teamScore > opponentScore) wins++;
        });

        return {
            ppg: (totalPoints / totalGames).toFixed(1),
            rpg: (totalRebounds / totalGames).toFixed(1),
            apg: (totalAssists / totalGames).toFixed(1),
            winPercentage: ((wins / totalGames) * 100).toFixed(1)
        };
    },
    
    // Get team schedule
    async getTeamSchedule(teamId) {
        try {
            const response = await this.fetchWithRetry(`games?team_ids[]=${teamId}&per_page=100`);
            const data = await response;
            
            const formattedGames = data.data.map(game => ({
                id: game.id,
                homeTeam: game.home_team.full_name,
                homeScore: game.home_team_score,
                awayTeam: game.visitor_team.full_name,
                awayScore: game.visitor_team_score,
                date: new Date(game.date),
                status: game.status
            }));
            
            this.notify('scheduleUpdated', formattedGames);
            return formattedGames;
        } catch (error) {
            console.error('Error fetching schedule:', error);
            return [];
        }
    },

    // Start real-time updates
    async startLiveUpdates() {
        console.log('Starting live updates...');
        
        // Initialize the database
        await this.initDatabase();
        
        // Initial data fetch
        const games = await this.getLiveGames();
        await this.storeLiveGames(games);
        
        // Set up interval for live updates
        setInterval(async () => {
            try {
                const updatedGames = await this.getLiveGames();
                await this.storeLiveGames(updatedGames);
                this.notify('liveGamesUpdated', updatedGames);
            } catch (error) {
                console.error('Error updating live games:', error);
            }
        }, this.REFRESH_INTERVAL);
    }
};

// Initialize the service when the module is loaded
basketballService.startLiveUpdates().catch(err => {
    console.error('Error starting basketball service:', err);
});

module.exports = basketballService;
