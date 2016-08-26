// 机器人生成工厂
// -每个房间维持一个生成需求队列
// -从队列中按优先级生成机器人

// Creep生成请求
function SpawnRequest() {	
	this.initState = "";
	this.roleType = "";
	this.bodys = [];
	this.workRoom = "";	
};

// 生成Creep
var SpawnCreep = function(RoleType, BodyGroupNum, BaseBodyItem, RoleMemory){
    var BodyGroup = BuildBody(BodyGroupNum, BaseBodyItem);
    var newName = Game.spawns['Spawn1'].createCreep(BodyGroup, undefined, RoleMemory);
    if (_.isString(newName)) {
        console.log('Spawning new ' + RoleType + ': ' + newName);    
    }
    else {
        //console.log("Spawning failed code: " + newName);
    }
}

var InitSpawnQueue = function(room) {
	if (!room.memory.SpawnSqueue) {
		room.memory.SpawnSqueue = new Array();
		console.log("wrote [" + room.name + "] room.memory.SpawnSqueue");
	}
}

var ChooseIdleSpawn = function(room) {	
	var IdleSpawn = room.find(FIND_STRUCTURES, {
		filter: (structure) => {
			return (structure.structureType == STRUCTURE_SPAWN && !structure.spawning);
		}
	})[0];

	return IdleSpawn;
}

var SpawnCreep = function (room) {
	// 从生产队列中取出优先级最高的Creep,开始生产	
	var SpawnSqueue = room.memory.SpawnSqueue;
	if (SpawnSqueue.length > 0) {
		SpawnRequest = SpawnSqueue[0];
		var Spawn = ChooseIdleSpawn(room);
		if (Spawn) {
			// 检测是否可生产
			var CreepCost = Spawn.creepCost(SpawnRequest.bodys);
			if (CreepCost > room.energyCapacityAvailable) {
				SpawnSqueue.shift();
				console.log("Factory Spawn - Cann't spawn " 
					+ SpawnRequest.roleType + ", energy capacity[" + room.energyCapacityAvailable + "] is not enough.");
				return ;
			}

			var creepMemory = {
				role: SpawnRequest.roleType,
				state: SpawnRequest.initState,
				workRoom: SpawnRequest.workRoom 
			};
			
			var newName = Spawn.createCreep(SpawnRequest.bodys, undefined, creepMemory);
			if (_.isString(newName)) {				
				var roleType = SpawnRequest.roleType;				
				--room.memory.CreepRequire[roleType].InSpawnQueue;
				SpawnSqueue.shift();
				console.log('Spawning new ' + SpawnRequest.roleType + ': ' + newName);
			} else {
				//console.log('Spawning failed | error code:' + newName);
			}
		}
	}
}

var PushRequest = function(room, roleType, bodys, initState, workRoom) {		
	if (_.isArray(bodys) && bodys.length > 0) {		
		//var newRequest = new SpawnRequest();
		var newRequest = new Object();
		newRequest.roleType = roleType;		
		newRequest.bodys = bodys;
		newRequest.initState = initState;
		newRequest.workRoom = workRoom;
		if (_.isArray(room.memory.SpawnSqueue)) {
			room.memory.SpawnSqueue.push(newRequest);
			room.memory.CreepRequire[roleType].InSpawnQueue++;
		}
	} else {
		console.log("PushRequest failed. bodys is empty.");
	}
}

var factorySpawn = {
	init: function(room) {		
		InitSpawnQueue(room);
	},

    /** @param {room} **/
    run: function(room) {
    	SpawnCreep(room);
	},

    request: function(room, roleType, bodys, initState, workRoom) {
    	//console.log("roleType:" + roleType);
    	PushRequest(room, roleType, bodys, initState, workRoom);
        //return true;
    }
}

module.exports = factorySpawn;