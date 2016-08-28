// 收集工人
// 从传送器回收资源到Storage
// 从Container回收资源到Storage

var State = {
    Recycle: "recycle",
    Collect: "collect"    
};

var FindDischargeContainer = function(RoomName, CarryCapacity) {
	var findContainer = undefined;

	var containers = Memory.rooms[RoomName].container;
	for (var id in containers) {
		if (containers[id].storeEnergy >= CarryCapacity) {
			findContainer = Game.getObjectById(id);			
			break;
		}
	}

	return findContainer;
}

var Recycle = function(creep) {
	creep.say("Recycle");
	var store = creep.FindStorableForRecycle();
	if (store) {
		if (creep.transfer(store, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
			creep.moveTo(store);
		}
	} else {
		var tower = creep.FindClosestTower();
		if (tower) {			
			creep.TransferEnergyTo(tower);
		}
	}
}

var Collect = function(creep) {
	var CarryCapacity = creep.getActiveBodyparts(CARRY) * 50;
	var Container = FindDischargeContainer(creep.room.name, CarryCapacity);
	if (Container && Container.store[RESOURCE_ENERGY] > 0) {
		if (creep.withdraw(Container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
			creep.moveTo(Container);
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
		} else {
			var LinkOut = creep.room.GetLink("OUT");
			if (LinkOut && LinkOut.energy > 0) {
				if (creep.withdraw(LinkOut, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					creep.moveTo(LinkOut);
				}
			}
		}
	}
}

var roleCollect = {

	/** @param {Creep} creep **/
	run: function(creep) {
		if (creep.memory.state == State.Collect && creep.carry.energy == creep.carryCapacity) {
			creep.memory.state = State.Recycle;
			creep.say("recycle");
		}
		if (creep.memory.state == State.Recycle && creep.carry.energy == 0) {
			creep.memory.state = State.Collect;
			creep.say("collect");
		}

		switch (creep.memory.state) {
			case State.Recycle:
				Recycle(creep);
				break;
			case State.Collect:
				Collect(creep);
				break;
		}
	}
};

module.exports = roleCollect;