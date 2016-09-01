// 重新加载配置
global.ReloadConfig = function() {
    if (Memory.gameConfig) {
    	delete Memory.gameConfig;
    }

    return "Reload Config OK.";
}

// 进攻房间
global.AttackRoom = function(roomName) {
	if (Memory.gameConfig) {
		Memory.gameConfig.attackRoom = roomName;
	}

	return `AttacRoom ${roomName}`;
}

// 占领房间
global.ClaimRoom = function(roomName) {
	if (Memory.gameConfig) {
		Memory.gameConfig.claimRoom = roomName;
	}

	return `ClaimRoom ${roomName}`;
}

// 集结房间
global.MassRoom = function(roomName) {
	if (Memory.gameConfig) {
		Memory.gameConfig.massRoom = roomName;
	}

	return `MassRoom ${roomName}`;
}

// 采矿(harvester)
// Game.spawns['Spawn1'].createCreep( [WORK,CARRY,MOVE], undefined, { role: 'harvester', workRoom: 'E16S41', state: 'init', preAllocate: '577b93a60f9d51615fa48792'});

// 修造(builder)
// Game.spawns['Spawn1'].createCreep( [WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE], undefined, { role: 'harvester', workRoom: 'E16S41', state: 'init', preAllocate: '577b93a60f9d51615fa48792'});

// Game.spawns['Spawn1'].createCreep( [WORK,WORK,MOVE], undefined, { role: 'harvester.fixed', workRoom: 'sim', state: 'init', preAllocate: '0f24b9d26ef7b6314ca609f0'});
// Game.spawns['Spawn1'].createCreep( [CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE], undefined, { role: 'collect', workRoom: 'E16S41', state: 'recycle'});

// 攻击
// Game.spawns['Spawn1'].createCreep( [ATTACK, ATTACK, MOVE, ATTACK, ATTACK, MOVE, ATTACK, ATTACK, MOVE, TOUGH, TOUGH, TOUGH], undefined, { role: 'soldier', state: 'attack'});

// Game.spawns['Spawn1'].createCreep( [WORK,WORK,CARRY,MOVE], undefined, { role: 'harvester'} );
// Game.spawns['Spawn1'].createCreep( [MOVE], "mover");

// // 升级人(upgrader)
// Game.spawns['Spawn1'].createCreep( [WORK,CARRY,CARRY,CARRY,MOVE], 'upgrader1', { role: 'upgrader', workplace: 'sim' } );

// // 建造者(builder)
// Game.spawns['Spawn1'].createCreep([WORK, CARRY, CARRY, MOVE], 'builder1', { role: 'builder', workplace: 'sim' });

// // 自动扩展
// Game.rooms.E58S41.AutoExtension({x:1, y:1}, 5)

// // 自动铺路
// // #Room.prototype.PaveRoad
// //Game.rooms.sim.PaveRoad();

// // var jsonStr = JSON.stringify(source);
// // console.log(jsonStr);

var gameConsole = {

}

module.exports = gameConsole;