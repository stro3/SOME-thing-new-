// Basketball Service for live updates
const basketballService = {
    subscribers: {},
    subscribe(event, callback) {
        if (!this.subscribers[event]) {
            this.subscribers[event] = [];
        }
        this.subscribers[event].push(callback);
    },
    notify(event, data) {
        if (this.subscribers[event]) {
            this.subscribers[event].forEach(callback => callback(data));
        }
    },
    startLiveUpdates() {
        // Simulate live updates every 30 seconds
        setInterval(() => {
            const games = this.generateRandomGames();
            this.notify('liveGamesUpdated', games);
        }, 30000);
    },
    generateRandomGames() {
        return [
            {
                homeTeam: { id: 1, name: 'Lakers' },
                awayTeam: { id: 2, name: 'Warriors' },
                homeScore: Math.floor(Math.random() * 120),
                awayScore: Math.floor(Math.random() * 120)
            },
            {
                homeTeam: { id: 3, name: 'Celtics' },
                awayTeam: { id: 4, name: 'Heat' },
                homeScore: Math.floor(Math.random() * 120),
                awayScore: Math.floor(Math.random() * 120)
            }
        ];
    }
};

// Mobile menu functionality
const mobileMenuBtn = document.querySelector('.mobile-menu');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu if open
            if (window.innerWidth <= 768 && navLinks) {
                navLinks.style.display = 'none';
            }
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.style.backgroundColor = window.scrollY > 50 ? 'rgba(255, 255, 255, 0.95)' : 'white';
    }
});

// Global variables for team data
window.teamsData = {
    warriors: {
        name: 'Golden State Warriors',
        conference: 'Western Conference',
        founded: 1946,
        arena: 'Chase Center',
        championships: 7,
        coach: 'Steve Kerr',
        stars: ['Stephen Curry', 'Klay Thompson', 'Draymond Green']
    },
    lakers: {
        name: 'Los Angeles Lakers',
        conference: 'Western Conference',
        founded: 1947,
        arena: 'Crypto.com Arena',
        championships: 17,
        coach: 'Darvin Ham',
        stars: ['LeBron James', 'Anthony Davis', 'Austin Reaves']
    },
    celtics: {
        name: 'Boston Celtics',
        conference: 'Eastern Conference',
        founded: 1946,
        arena: 'TD Garden',
        championships: 17,
        coach: 'Joe Mazzulla',
        stars: ['Jayson Tatum', 'Jaylen Brown', 'Kristaps Porzingis']
    },
    heat: {
        name: 'Miami Heat',
        conference: 'Eastern Conference',
        founded: 1988,
        arena: 'Kaseya Center',
        championships: 3,
        coach: 'Erik Spoelstra',
        stars: ['Jimmy Butler', 'Bam Adebayo', 'Tyler Herro']
    }
};

// Initialize live scores
function initializeLiveScores() {
    const scoresContainer = document.querySelector('.live-scores');
    if (!scoresContainer) return;

    basketballService.subscribe('liveGamesUpdated', games => {
        if (!games || games.length === 0) {
            scoresContainer.innerHTML = '<p class="no-games">No live games at the moment</p>';
            return;
        }

        scoresContainer.innerHTML = games.map(game => `
            <div class="score-card">
                <div class="team home">
                    <img src="https://via.placeholder.com/40" alt="${game.homeTeam.name}">
                    <span class="team-name">${game.homeTeam.name}</span>
                    <span class="score">${game.homeScore}</span>
                </div>
                <div class="vs">VS</div>
                <div class="team away">
                    <img src="https://via.placeholder.com/40" alt="${game.awayTeam.name}">
                    <span class="team-name">${game.awayTeam.name}</span>
                    <span class="score">${game.awayScore}</span>
                </div>
            </div>
        `).join('');
    });

    basketballService.startLiveUpdates();
}

// Initialize player stats
function initializePlayerStats() {
    // Placeholder function
    console.log("Player stats initialized");
}

// Initialize team comparison
function initializeTeamComparison() {
    // Placeholder function
    console.log("Team comparison initialized");
}

// Initialize schedule
function initializeSchedule() {
    // Placeholder function
    console.log("Schedule initialized");
}

// Initialize 3D model
function init3DModel() {
    // Placeholder function
    console.log("3D model initialized");
}

// Function to show team details
function showTeamDetails(teamId) {
    const teamData = window.teamsData[teamId];
    const teamModal = document.querySelector('.team-modal');
    
    if (!teamModal || !teamData) return;
    
    // Update modal content
    const modalTitle = teamModal.querySelector('.modal-title');
    const modalContent = teamModal.querySelector('.modal-content');
    
    if (modalTitle) modalTitle.textContent = teamData.name;
    
    if (modalContent) {
        modalContent.innerHTML = `
            <div class="team-details">
                <div class="team-info">
                    <p><strong>Conference:</strong> ${teamData.conference}</p>
                    <p><strong>Founded:</strong> ${teamData.founded}</p>
                    <p><strong>Arena:</strong> ${teamData.arena}</p>
                    <p><strong>Championships:</strong> ${teamData.championships}</p>
                    <p><strong>Head Coach:</strong> ${teamData.coach}</p>
                </div>
                <div class="team-stars">
                    <h3>Star Players</h3>
                    <ul>
                        ${teamData.stars.map(player => `<li>${player}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }
    
    // Show modal
    teamModal.style.display = 'flex';
}

// Retry loading function
function retryLoad(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="loading">Loading...</div>';
        // Reinitialize the section based on the element ID
        switch (elementId) {
            case 'live-scores':
                initializeLiveScores();
                break;
            case 'player-stats':
                initializePlayerStats();
                break;
            // Add more cases as needed
        }
    }
}

// Main initialization - single DOMContentLoaded event
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all features
    initializeLiveScores();
    initializePlayerStats();
    initializeTeamComparison();
    initializeSchedule();
    init3DModel();

    // Team cards click event
    const teamCards = document.querySelectorAll('.team-card');
    if (teamCards) {
        teamCards.forEach(card => {
            card.addEventListener('click', function() {
                const teamId = this.getAttribute('data-team-id');
                if (teamId && window.teamsData[teamId]) {
                    showTeamDetails(teamId);
                }
            });
        });
    }

    // Initialize scroll animations
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.animate-on-scroll');
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            
            if (elementTop < window.innerHeight && elementBottom > 0) {
                element.classList.add('visible');
            }
        });
    };

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Run once on load
});
