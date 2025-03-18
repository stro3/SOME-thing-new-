// Player data management and UI functionality

// Global variables
let players = [];
let filteredPlayers = [];
let currentUser = null;
let userFavorites = [];

// Initialize database tables for players and user authentication
function initializePlayerDatabase() {
    if (!db) {
        console.error('Database not initialized');
        return;
    }
    
    db.exec(`
        CREATE TABLE IF NOT EXISTS players (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            team TEXT NOT NULL,
            position TEXT NOT NULL,
            image TEXT,
            ppg REAL,
            rpg REAL,
            apg REAL
        );
        
        CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY,
            userId INTEGER,
            playerId INTEGER,
            FOREIGN KEY (userId) REFERENCES users(id),
            FOREIGN KEY (playerId) REFERENCES players(id),
            UNIQUE(userId, playerId)
        );
    `);
    
    // Check if we need to populate initial player data
    const count = db.prepare('SELECT COUNT(*) as count FROM players').get().count;
    if (count === 0) {
        populateInitialPlayerData();
    }
}

// Populate initial player data
function populateInitialPlayerData() {
    const initialPlayers = [
        {
            name: "LeBron James",
            team: "Los Angeles Lakers",
            position: "SF",
            image: "https://cdn.nba.com/headshots/nba/latest/1040x760/2544.png",
            ppg: 27.2,
            rpg: 7.5,
            apg: 8.3
        },
        {
            name: "Stephen Curry",
            team: "Golden State Warriors",
            position: "PG",
            image: "https://cdn.nba.com/headshots/nba/latest/1040x760/201939.png",
            ppg: 29.4,
            rpg: 6.1,
            apg: 6.3
        },
        {
            name: "Kevin Durant",
            team: "Phoenix Suns",
            position: "SF",
            image: "https://cdn.nba.com/headshots/nba/latest/1040x760/201142.png",
            ppg: 28.7,
            rpg: 7.3,
            apg: 4.8
        },
        {
            name: "Giannis Antetokounmpo",
            team: "Milwaukee Bucks",
            position: "PF",
            image: "https://cdn.nba.com/headshots/nba/latest/1040x760/203507.png",
            ppg: 30.1,
            rpg: 11.6,
            apg: 5.8
        },
        {
            name: "Nikola Jokic",
            team: "Denver Nuggets",
            position: "C",
            image: "https://cdn.nba.com/headshots/nba/latest/1040x760/203999.png",
            ppg: 26.4,
            rpg: 12.4,
            apg: 9.0
        },
        {
            name: "Luka Doncic",
            team: "Dallas Mavericks",
            position: "PG",
            image: "https://cdn.nba.com/headshots/nba/latest/1040x760/1629029.png",
            ppg: 32.4,
            rpg: 8.6,
            apg: 8.0
        }
    ];
    
    const stmt = db.prepare(`INSERT INTO players (name, team, position, image, ppg, rpg, apg) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    
    initialPlayers.forEach(player => {
        stmt.run(
            player.name,
            player.team,
            player.position,
            player.image,
            player.ppg,
            player.rpg,
            player.apg
        );
    });
}

// Load players from database
function loadPlayers() {
    if (!db) {
        console.error('Database not initialized');
        return [];
    }
    
    players = db.prepare('SELECT * FROM players').all();
    filteredPlayers = [...players];
    return players;
}

// Search players by name or team
function searchPlayers(query) {
    if (!query || query.trim() === '') {
        filteredPlayers = [...players];
    } else {
        query = query.toLowerCase();
        filteredPlayers = players.filter(player => 
            player.name.toLowerCase().includes(query) || 
            player.team.toLowerCase().includes(query)
        );
    }
    return filteredPlayers;
}

// Add player to favorites
function addToFavorites(playerId) {
    if (!currentUser) {
        return { success: false, error: 'User not logged in' };
    }
    
    try {
        const stmt = db.prepare(`INSERT OR IGNORE INTO favorites (userId, playerId) VALUES (?, ?)`);
        stmt.run(currentUser.id, playerId);
        loadUserFavorites();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Remove player from favorites
function removeFromFavorites(playerId) {
    if (!currentUser) {
        return { success: false, error: 'User not logged in' };
    }
    
    try {
        const stmt = db.prepare(`DELETE FROM favorites WHERE userId = ? AND playerId = ?`);
        stmt.run(currentUser.id, playerId);
        loadUserFavorites();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Load user favorites
function loadUserFavorites() {
    if (!currentUser) {
        userFavorites = [];
        return [];
    }
    
    try {
        userFavorites = db.prepare(`
            SELECT p.* FROM players p
            JOIN favorites f ON p.id = f.playerId
            WHERE f.userId = ?
        `).all(currentUser.id);
        return userFavorites;
    } catch (error) {
        console.error('Error loading favorites:', error);
        userFavorites = [];
        return [];
    }
}

// Check if a player is in favorites
function isPlayerFavorite(playerId) {
    return userFavorites.some(fav => fav.id === playerId);
}

// Render player cards in the players grid
function renderPlayerCards() {
    const playersGrid = document.getElementById('playersGrid');
    if (!playersGrid) return;
    
    playersGrid.innerHTML = '';
    
    filteredPlayers.forEach(player => {
        const isFavorite = isPlayerFavorite(player.id);
        
        const playerCard = document.createElement('div');
        playerCard.className = 'player-card';
        playerCard.innerHTML = `
            <div class="player-image">
                <img src="${player.image || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${player.name}">
                <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-player-id="${player.id}">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div class="player-info">
                <h3>${player.name}</h3>
                <div class="team-name">${player.team} | ${player.position}</div>
                <div class="player-stats">
                    <div class="stat">
                        <div class="label">PPG</div>
                        <div class="value">${player.ppg.toFixed(1)}</div>
                    </div>
                    <div class="stat">
                        <div class="label">RPG</div>
                        <div class="value">${player.rpg.toFixed(1)}</div>
                    </div>
                    <div class="stat">
                        <div class="label">APG</div>
                        <div class="value">${player.apg.toFixed(1)}</div>
                    </div>
                </div>
            </div>
        `;
        
        playersGrid.appendChild(playerCard);
        
        // Add favorite button functionality
        const favoriteBtn = playerCard.querySelector('.favorite-btn');
        favoriteBtn.addEventListener('click', () => {
            if (!currentUser) {
                alert('Please login to add favorites');
                return;
            }
            
            const playerId = parseInt(favoriteBtn.dataset.playerId);
            
            if (favoriteBtn.classList.contains('active')) {
                removeFromFavorites(playerId);
                favoriteBtn.classList.remove('active');
            } else {
                addToFavorites(playerId);
                favoriteBtn.classList.add('active');
            }
        });
    });
}

// Initialize player search functionality
function initializePlayerSearch() {
    const searchInput = document.getElementById('playerSearch');
    const searchButton = document.getElementById('searchButton');
    
    if (searchInput && searchButton) {
        searchButton.addEventListener('click', () => {
            const query = searchInput.value;
            searchPlayers(query);
            renderPlayerCards();
        });
        
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value;
                searchPlayers(query);
                renderPlayerCards();
            }
        });
    }
    
    // Initialize load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            // Implement pagination or load more functionality
            // For now, we'll just show a message
            alert('Loading more players... Feature coming soon!');
        });
    }
}

// Initialize player functionality
function initializePlayers() {
    if (typeof db !== 'undefined') {
        initializePlayerDatabase();
        loadPlayers();
        initializePlayerSearch();
        renderPlayerCards();
    } else {
        console.error('Database not available');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if database is initialized in services.js
    if (typeof initDatabase === 'function') {
        initDatabase().then(() => {
            initializePlayers();
        });
    } else {
        // If services.js already initialized the database
        setTimeout(initializePlayers, 500); // Give a small delay to ensure DB is ready
    }
});
