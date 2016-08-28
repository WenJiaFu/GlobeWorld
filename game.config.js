function GameConfig() {
	this.wantColony = "E17S41";
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