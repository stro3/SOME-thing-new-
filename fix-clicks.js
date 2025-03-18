// This script fixes click issues on team cards and navigation
document.addEventListener('DOMContentLoaded', function() {
    console.log("Click fix script loaded!");
    
    // Fix team cards
    fixTeamCards();
    
    // Fix navigation links
    fixNavigationLinks();
    
    // Fix book ticket buttons
    fixBookButtons();
});

function fixTeamCards() {
    const teamCards = document.querySelectorAll('.team-card');
    console.log(`Found ${teamCards.length} team cards`);
    
    teamCards.forEach(card => {
        // Ensure z-index is set
        card.style.position = 'relative';
        card.style.zIndex = '1';
        
        // Make sure pointer-events are enabled
        card.style.pointerEvents = 'auto';
        
        // Clear any existing click events and add new ones
        card.outerHTML = card.outerHTML;
        
        // Re-select the card after replacing it
        const updatedCard = document.querySelector(`[data-team="${card.getAttribute('data-team')}"]`);
        
        if (updatedCard) {
            updatedCard.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log("Team card clicked:", this.getAttribute('data-team'));
                
                // Get the team ID
                const teamId = this.getAttribute('data-team');
                
                if (teamId) {
                    // Show team modal with that team's data
                    const teamModal = document.querySelector('.team-modal');
                    if (teamModal) {
                        // Set basic content for now (the main script will handle details)
                        const modalBody = teamModal.querySelector('.modal-body');
                        if (modalBody) {
                            modalBody.innerHTML = `<h2 id="team-name">${teamId.toUpperCase()}</h2>
                                                  <p id="team-description">Team details loading...</p>`;
                        }
                        
                        // Display modal
                        teamModal.style.display = 'flex';
                        
                        // Call the main script's showTeamModal if it exists
                        if (typeof showTeamModal === 'function') {
                            showTeamModal(teamId);
                        }
                    }
                    return false;
                }
            });
        }
    });
}

function fixNavigationLinks() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    console.log(`Found ${navLinks.length} navigation links`);
    
    navLinks.forEach(link => {
        // Clear existing events
        link.outerHTML = link.outerHTML;
        
        // Re-select after replacing
        const updatedLink = document.querySelector(`a[href="${link.getAttribute('href')}"]`);
        
        if (updatedLink) {
            updatedLink.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    console.log("Scrolling to:", targetId);
                    
                    // Scroll to section
                    window.scrollTo({
                        top: targetSection.offsetTop - 80,
                        behavior: 'smooth'
                    });
                    
                    // Update active class
                    document.querySelectorAll('a[href^="#"]').forEach(l => 
                        l.classList.remove('active'));
                    this.classList.add('active');
                }
                
                return false;
            });
        }
    });
}

function fixBookButtons() {
    const bookButtons = document.querySelectorAll('.book-ticket');
    console.log(`Found ${bookButtons.length} book ticket buttons`);
    
    bookButtons.forEach(btn => {
        // Clear existing events
        btn.outerHTML = btn.outerHTML;
        
        // Re-select after replacing
        const updatedBtn = document.querySelector(`.book-ticket[data-game="${btn.getAttribute('data-game')}"]`);
        
        if (updatedBtn) {
            updatedBtn.style.position = 'relative';
            updatedBtn.style.zIndex = '2';
            updatedBtn.style.pointerEvents = 'auto';
            
            updatedBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const gameId = this.getAttribute('data-game');
                alert(`Booking tickets for game: ${gameId || 'unknown'}`);
                return false;
            });
        }
    });
}
