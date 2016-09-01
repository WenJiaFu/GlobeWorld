// 游戏配置
function GameConfig() {
	this.wantColony = new String("");
	this.attackRoom = new String("");
	this.claimRoom = new String("");
	this.massRoom = new String("");
}

// 初始化游戏配置
var InitConfig = function() {
	if (!Memory.gameConfig) {
		Memory.gameConfig = new GameConfig();
	}
}

var gameConfig = {
	init: function() {
		InitConfig();
	}
}

module.exports = gameConfig;