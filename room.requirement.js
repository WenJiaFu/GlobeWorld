// 房间需求管理
// -按需求提交Creep生成请求
// -负责控制Creep数量

var factorySpawn = require('factory.spawn');

// Body组合元素
var BodyElement = {
	HarvesterFixed: {
		Body: [WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE],
        Cost: 650
	},
    WORK: {
        Body: [WORK, CARRY, MOVE],
        Cost: 200
    },
    CARRY: {
        Body: [CARRY, CARRY, MOVE],
        Cost: 150
    },
    CLAIM: {
        Body: [CLAIM, MOVE],
        Cost: 650
    },
    ATTACK: {
        Body: [ATTACK, ATTACK, MOVE],
        Cost: 210
    },
    SCOUT: {
        Body: [MOVE],
        Cost: 50
    }
}

// 需求状态
function RequirementState() {
	this.RequireTotal = 0;
	this.InSpawnQueue = 0;
};

// Creep需求对象
function CreepRequire() {
	this.harvester = new RequirementState();
	this.harvesterFixed = new RequirementState();
	this.upgrader = new RequirementState();
	this.builder = new RequirementState();
	this.stevedore = new RequirementState();
	this.collect = new RequirementState();
	this.pioneer = new RequirementState();
	this.soldier = new RequirementState();
	this.scout = new RequirementState();
	this.miner = new RequirementState();
};

// 计算Body消费
var CaluBodyCost = function(BodyGroup) {
    var CostTotal = 0;
    for (var index in BodyGroup){
        CostTotal += BODYPART_COST[BodyGroup[index]];
    }
    return CostTotal;
}

// 构建Body
var BuildBody = function (BodyGroupNum, BaseBodyItem) {
    var BodyGroup = [];
    for (var i = 0; i < BodyGroupNum; i++) {
        BodyGroup = BodyGroup.concat(BaseBodyItem);
    }
    return BodyGroup;
};

// 已分配多少采集者
var CountHarverster = function(assigned, roleType) {
	var harvesterNum = 0;	
	for (var name in assigned) {
		if (Memory.creeps[name] && Memory.creeps[name].role == roleType){
			harvesterNum++;		
		}
	}
	
	console.log("CountHarverster return:" + harvesterNum);
	return harvesterNum;
}

// Source周围(9宫格内)有Container
var HasContainerAround = function(Room, CheckPos) {
    var top = CheckPos.y - 1;
    var left = CheckPos.x - 1;
    var bottom = CheckPos.y + 1;
    var right = CheckPos.x + 1;
    
    var LookArea = Room.lookForAtArea(LOOK_STRUCTURES, top, left, bottom, right, true);
    var ContainerNum = 0;
    for (var index in LookArea){
        if (LookArea[index].structureType == STRUCTURE_CONTAINER) {
            ContainerNum++;
        }
    }
    
    return ContainerNum;
}

var RequirementInit = function(room) {
	if (!room.memory.CreepRequire) {
		room.memory.CreepRequire = new CreepRequire();
		console.log("wrote [" + room.name + "] room.memory.CreepRequire");
	}
};

var RequirementRun = function(room) {
	if (room.energyCapacityAvailable > 0) {
		KeeperHarvester(room);
		KeeperUpgrader(room);
		KeeperBuilder(room);
		KeeperStevedore(room);
		KeeperCollect(room);
		KeeperPioneer(room);
		KeeperSoldier(room);
		KeeperScout(room);
		KeeperMiner(room);
	}
};

var KeeperHarvester = function(room) {
	// 维护每个Source的采集者数量
	var sources = room.memory.Sources;
	var initState = "init";
	for (var id in sources) {
		if (room.memory.Sources[id].needAssigned) {
			room.memory.Sources[id].needAssigned = false;

			var bodys = [];
			
			// 房间内不存在任何采集者时
			if (room.memory.CreepState.harvester == 0 && room.memory.CreepState.harvesterFixed == 0) {
				var bodyGroupNum = _.max([1, _.floor(room.energyAvailable / BodyElement.WORK.Cost)]);
				bodys = BuildBody(bodyGroupNum, BodyElement.WORK.Body);
				factorySpawn.request(room, "harvester", bodys, initState, room.name, id, true);
				continue;
			}

			var CanSpawnFixed = (room.energyCapacityAvailable >= BodyElement.HarvesterFixed.Cost) && room.HasContainerAround(sources[id].pos);
			if (CanSpawnFixed) {
				let harFixedNum = CountHarverster(room.memory.Sources[id].assigned, "harvesterFixed");
				console.log("source[" + id + "] has " + harFixedNum + " harvesterFixed allocated.");
				if (harFixedNum == 0) {
					bodys = BuildBody(1, BodyElement.HarvesterFixed.Body);
					factorySpawn.request(room, "harvesterFixed", bodys, initState, room.name, id, true);
				}
			} else {
				var harNum = CountHarverster(room.memory.Sources[id].assigned, "harvester");
				console.log("source[" + id + "] has " + harNum + " harvester allocated.");
				for (var i = harNum; i < sources[id].CollectableNum; i++) {
					var bodyGroupNum = _.floor(room.energyCapacityAvailable / BodyElement.WORK.Cost);
					bodys = BuildBody(bodyGroupNum, BodyElement.WORK.Body);
					factorySpawn.request(room, "harvester", bodys, initState, room.name, id, true);
				}
			}
		}
	}
}

var KeeperUpgrader = function(room) {
	// 需求计算
	var RequireTotal = _.min([2, room.controller.level]);	
	if (room.memory.EnergyState) {
		let capacityRate = (room.memory.EnergyState.energy / room.memory.EnergyState.energyCapacity);
		if (room.controller.level <= 2 && capacityRate > 0.8) {
			RequireTotal += 4;
		}
	}
	room.memory.CreepRequire.upgrader.RequireTotal = RequireTotal;

	// 提交队列
	var InSpawnQueue = room.memory.CreepRequire.upgrader.InSpawnQueue;
	var UpgraderNum = room.memory.CreepState.upgrader;
	var SpawnRequire = RequireTotal - (UpgraderNum + InSpawnQueue);
	for (var i=0; i < SpawnRequire; i++) {
		var bodyGroupNum = _.min([4, _.floor(room.energyCapacityAvailable / BodyElement.WORK.Cost)]);
		var bodys = BuildBody(bodyGroupNum, BodyElement.WORK.Body);
		factorySpawn.request(room, "upgrader", bodys, "upgrade", room.name);
	}
}

var KeeperBuilder = function(room) {
	// 需求计算
	var RequireTotal = 0;	
	if (_.size(room.memory.LossySites) > 0) {
		RequireTotal = 1;
	}
	if (room.memory.construction > 0 || _.size(room.memory.defenseSites)) {
		RequireTotal = 3;
	}

	room.memory.CreepRequire.builder.RequireTotal = RequireTotal;

	// 提交队列
	var InSpawnQueue = room.memory.CreepRequire.builder.InSpawnQueue;
	var builderNum = room.memory.CreepState.builder;
	var SpawnRequire = RequireTotal - (builderNum + InSpawnQueue);
	for (var i=0; i < SpawnRequire; i++) {
		var bodyGroupNum = _.min([5, _.floor(room.energyCapacityAvailable / BodyElement.WORK.Cost)]);
		var bodys = BuildBody(bodyGroupNum, BodyElement.WORK.Body);
		factorySpawn.request(room, "builder", bodys, "building", room.name);
	}
}

var KeeperStevedore = function(room) {
	// 需求计算
	var RequireTotal = 0;
	if (room.storage) {
		RequireTotal = 1;
	}

	room.memory.CreepRequire.stevedore.RequireTotal = RequireTotal;

	// 提交队列
	var InSpawnQueue = room.memory.CreepRequire.stevedore.InSpawnQueue;
	var stevedoreNum = room.memory.CreepState.stevedore;
	var SpawnRequire = RequireTotal - (stevedoreNum + InSpawnQueue);
	for (var i=0; i < SpawnRequire; i++) {
		var bodyGroupNum = _.min([4, _.floor(room.energyCapacityAvailable / BodyElement.WORK.Cost)]);
		var bodys = BuildBody(bodyGroupNum, BodyElement.CARRY.Body);
		factorySpawn.request(room, "stevedore", bodys, "distribute", room.name);
	}
}

var KeeperCollect = function(room) {
	// 需求计算
	var RequireTotal = 0;
	if (room.memory.container) {
		if (room.controller.level <= 2){
			RequireTotal = 1;
		} else {
			RequireTotal = _.size(room.memory.container);	
		}		
	}
	room.memory.CreepRequire.collect.RequireTotal = RequireTotal;

	// 提交队列
	var InSpawnQueue = room.memory.CreepRequire.collect.InSpawnQueue;
	var collectNum = room.memory.CreepState.collect;
	var SpawnRequire = RequireTotal - (collectNum + InSpawnQueue);
	for (var i=0; i < SpawnRequire; i++) {
		var bodyGroupNum = _.min([10, _.floor(room.energyCapacityAvailable / BodyElement.CARRY.Cost)]);
		var bodys = BuildBody(bodyGroupNum, BodyElement.CARRY.Body);
		factorySpawn.request(room, "collect", bodys, "recycle", room.name);
	}
}

var KeeperPioneer = function(room) {
	// 需求计算
	var RequireTotal = 0;

	// 提交队列
	if (Memory.gameConfig.claimRoom.length) {
		if (room.energyCapacityAvailable > BodyElement.CLAIM.Cost) {
			var bodys = BuildBody(1, BodyElement.CLAIM.Body);
			var workRoom = Memory.gameConfig.claimRoom;
			factorySpawn.request(room, "pioneer", bodys, "explore", workRoom);			
		} else {
			console.log("Request claim creep failed. Has not enough energy.");
		}

		Memory.gameConfig.claimRoom = "";
	}
	

	// if (Memory.gameConfig.claimRoom.length()) {		
	// 	// RequireTotal = 1;
	// 	// Memory.gameState.needPioneer = false;
	// }
	// room.memory.CreepRequire.pioneer.RequireTotal = RequireTotal;

	// // 提交队列
	// if (room.energyCapacityAvailable > BodyElement.CLAIM.Cost) {
	// 	var InSpawnQueue = room.memory.CreepRequire.pioneer.InSpawnQueue;
	// 	var pioneerNum = room.memory.CreepState.pioneer;
	// 	var SpawnRequire = RequireTotal - (pioneerNum + InSpawnQueue);
	// 	for (var i = 0; i < SpawnRequire; i++) {
	// 		var bodys = BuildBody(1, BodyElement.CLAIM.Body);
	// 		factorySpawn.request(room, "pioneer", bodys, "explore", room.name);
	// 	}
	// }
}

var KeeperSoldier = function(room) {
	// 需求计算
	var RequireTotal = 0;
	var enemys = room.find(FIND_HOSTILE_CREEPS);
	if (_.size(enemys) > 0) {
		RequireTotal = _.size(enemys);
	}
	room.memory.CreepRequire.soldier.RequireTotal = RequireTotal;

	// 提交队列
	var InSpawnQueue = room.memory.CreepRequire.soldier.InSpawnQueue;
	var soldierNum = room.memory.CreepState.soldier;
	var SpawnRequire = RequireTotal - (soldierNum + InSpawnQueue);
	for (var i=0; i < SpawnRequire; i++) {
		var bodyGroupNum = _.floor(room.energyCapacityAvailable / BodyElement.ATTACK.Cost);		
		var bodys = BuildBody(bodyGroupNum, BodyElement.ATTACK.Body);
		factorySpawn.request(room, "soldier", bodys, "defense", room.name);
	}
}

var KeeperScout = function(room) {

}

var KeeperMiner = function(room) {
	// 需求计算
	var RequireTotal = 0;
	if (room.storage) {
		RequireTotal = 1;
	}	

	// 提交队列
	if (room.memory.CreepRequire.miner) {
		room.memory.CreepRequire.miner.RequireTotal = RequireTotal;
		
		var InSpawnQueue = room.memory.CreepRequire.miner.InSpawnQueue;
		var minerNum = room.memory.CreepState.miner;
		var SpawnRequire = RequireTotal - (minerNum + InSpawnQueue);
		for (var i = 0; i < SpawnRequire; i++) {
			var bodyGroupNum = _.min([4, _.floor(room.energyCapacityAvailable / BodyElement.WORK.Cost)]);
			var bodys = BuildBody(bodyGroupNum, BodyElement.WORK.Body);
			factorySpawn.request(room, "miner", bodys, "harvest", room.name);
		}
	}
}

var roomRequirement = {

	init: function(room) {
		RequirementInit(room);
	},

	/** @param {room} **/
	run: function(room) {
		RequirementRun(room);
	}
}

module.exports = roomRequirement;