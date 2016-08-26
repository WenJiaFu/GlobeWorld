// 分卸工人
// - 从storage分配energy到extension
// - 从storage分配energy到tower
// state: distribute

var State = {
    Distribute: "distribute",
    Unload: "unload"
};

var Distribute = function(creep) {
	// 状态切换
	if (creep.memory.state == State.Distribute && creep.carry.energy == 0) {
		creep.memory.state = State.Unload;
		creep.say("unload");
	}

	if (creep.memory.state == State.Unload && creep.carry.energy == creep.carryCapacity) {
		creep.memory.state = State.Distribute;
		creep.say("distribute:");
	}

	// 分配资源
	if (creep.memory.state == State.Distribute) {
		var extensions = creep.room.find(FIND_STRUCTURES, {
			filter: (structure) => {
				return (structure.structureType == STRUCTURE_EXTENSION && structure.energy < structure.energyCapacity);
			}
		});

		var nearestExtension = creep.pos.findClosestByRange(extensions);
		if (nearestExtension) {
			if (creep.transfer(nearestExtension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
				creep.moveTo(nearestExtension);
			}
		} else {
			var tower = creep.FindClosestTower();
			if (tower) {
				creep.say('toTower');
				creep.TransferEnergyTo(tower);
			}
		}
	} else {
		// 拾取房间内掉落Energy
		var DropEnergys = creep.room.find(FIND_DROPPED_ENERGY);
		if (DropEnergys.length > 0) {
			creep.say('pickup');
			var NearestEnergy = creep.pos.findClosestByRange(DropEnergys);
			if (creep.pickup(NearestEnergy) == ERR_NOT_IN_RANGE) {
				creep.moveTo(NearestEnergy);
			}
			//console.log("DropEnergys:" + DropEnergys);
		} else {
			// 从房间Storage卸载Energy
			var Storages = creep.room.find(FIND_STRUCTURES, {
				filter: (structure) => {
					return (structure.structureType == STRUCTURE_STORAGE && structure.store[RESOURCE_ENERGY] > 0);
				}
			});

			var RoomStorage = Storages.length > 0 ? _.first(Storages) : undefined;
			if (creep.withdraw(RoomStorage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
				creep.moveTo(RoomStorage);
			}
		}
	}
}

var roleStevedore = {

	/** @param {Creep} creep **/
    run: function(creep) {
		Distribute(creep);
    }
};

module.exports = roleStevedore;