function GameState() {
	this.needPioneer = false;
}

var InitGameState = function() {
	if (!Memory.gameState) {
		Memory.gameState = new GameState();
	}
}

var gameState = {
	init: function() {
		InitGameState();
	}
}

module.exports = gameState;