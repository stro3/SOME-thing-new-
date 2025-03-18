const basketballService = require('./services');

// Test function to fetch live games and store them in the database
async function testStoreLiveGames() {
    const liveGames = await basketballService.getLiveGames();
    await basketballService.storeLiveGames(liveGames);
    console.log('Live games stored in the database successfully.');
}

// Run the test
testStoreLiveGames().catch(console.error);
