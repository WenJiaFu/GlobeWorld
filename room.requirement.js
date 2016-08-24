// 房间需求管理
// -按需求提交Creep生成请求
// -负责控制Creep数量

var factorySpawn = require('factory.spawn');

// Body组合元素
var BodyElement = {
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
	this.upgrader = new RequirementState();
	this.builder = new RequirementState();
	this.stevedore = new RequirementState();
	this.collect = new RequirementState();
	this.pioneer = new RequirementState();
	this.soldier = new RequirementState();
	this.scout = new RequirementState();
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

var RequirementInit = function(room) {
	if (!room.memory.CreepRequire) {
		room.memory.CreepRequire = new CreepRequire();
		console.log("wrote [" + room.name + "] room.memory.CreepRequire");
	}
};

var RequirementRun = function(room) {	
	KeeperHarvester(room);
	KeeperUpgrader(room);
	KeeperBuilder(room);
	KeeperStevedore(room);
	KeeperCollect(room);
	KeeperPioneer(room);
	KeeperSoldier(room);
	KeeperScout(room);
};

var KeeperHarvester = function(room) {
	// 需求计算
	var RequireTotal = 0;
	var sources = room.memory.Sources;
	for (var id in sources) {
		RequireTotal += sources[id].CollectableNum;
	}
	room.memory.CreepRequire.harvester.RequireTotal = RequireTotal;

	// 提交队列
	var InSpawnQueue = room.memory.CreepRequire.harvester.InSpawnQueue;
	var HarvesterNum = room.memory.CreepState.harvester;
	var SpawnRequire = RequireTotal - (HarvesterNum + InSpawnQueue);
	for (var i=0; i < SpawnRequire; i++) {
		var bodyGroupNum = _.floor(room.energyCapacityAvailable / BodyElement.WORK.Cost);		
		var bodys = BuildBody(bodyGroupNum, BodyElement.WORK.Body);
		factorySpawn.request(room, "harvester", bodys, "harvester", room.name);
	}
}

var KeeperUpgrader = function(room) {
	// 需求计算
	var RequireTotal = 3;
	room.memory.CreepRequire.upgrader.RequireTotal = RequireTotal;

	// 提交队列
	var InSpawnQueue = room.memory.CreepRequire.upgrader.InSpawnQueue;
	var UpgraderNum = room.memory.CreepState.upgrader;
	var SpawnRequire = RequireTotal - (UpgraderNum + InSpawnQueue);
	for (var i=0; i < SpawnRequire; i++) {
		var bodyGroupNum = _.floor(room.energyCapacityAvailable / BodyElement.WORK.Cost);		
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
	if (room.memory.construction > 0) {
		RequireTotal = 3;
	}

	room.memory.CreepRequire.builder.RequireTotal = RequireTotal;

	// 提交队列
	var InSpawnQueue = room.memory.CreepRequire.builder.InSpawnQueue;
	var builderNum = room.memory.CreepState.builder;
	var SpawnRequire = RequireTotal - (builderNum + InSpawnQueue);
	for (var i=0; i < SpawnRequire; i++) {
		var bodyGroupNum = _.floor(room.energyCapacityAvailable / BodyElement.WORK.Cost);		
		var bodys = BuildBody(bodyGroupNum, BodyElement.WORK.Body);
		factorySpawn.request(room, "builder", bodys, "building", room.name);
	}
}

var KeeperStevedore = function(room) {

}

var KeeperCollect = function(room) {
	// 需求计算
	var RequireTotal = 0;
	if (room.memory.container) {
		RequireTotal = _.size(room.memory.container);
	}
	room.memory.CreepRequire.collect.RequireTotal = RequireTotal;

	// 提交队列
	var InSpawnQueue = room.memory.CreepRequire.collect.InSpawnQueue;
	var collectNum = room.memory.CreepState.collect;
	var SpawnRequire = RequireTotal - (collectNum + InSpawnQueue);
	for (var i=0; i < SpawnRequire; i++) {
		var bodyGroupNum = _.floor(room.energyCapacityAvailable / BodyElement.CARRY.Cost);		
		var bodys = BuildBody(bodyGroupNum, BodyElement.CARRY.Body);
		factorySpawn.request(room, "collect", bodys, "recycle", room.name);
	}
}

var KeeperPioneer = function(room) {

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
		factorySpawn.request(room, "soldier", bodys, "attack", room.name);
	}	
}

var KeeperScout = function(room) {

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