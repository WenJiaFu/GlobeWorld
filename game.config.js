function GameConfig() {
	this.wantColony = "";
}

var RefreshConfig = function() {
	if (!Memory.gameConfig) {
		Memory.gameConfig = new GameConfig();
	}
}

var gameConfig = {
	refresh: function() {
		RefreshConfig();
	}
}

module.exports = gameConfig;