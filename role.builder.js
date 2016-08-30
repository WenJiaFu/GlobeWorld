// 建筑工人
// -负责建设设施
// -负责维修

var State = {
    Harvester: "harvester",
    Building: "building",
    Repair: "repair"
};

// 找到需要维修的工路
var FindImpairedRoad = function(Room) {
    var LossySites = Room.memory.LossySites;
    
    if (LossySites){ 
        for (var id in LossySites) {            
            var ImpairedRoad = Game.getObjectById(id);

            // 已不存在，从内存中清除
            if (!ImpairedRoad){
                delete Room.memory.LossySites[id];
                continue;
            }

            return ImpairedRoad;
        }
    }
}

var MoveToRoom = function(creep, ToRoomName) {
    //console.log("MoveToRoom(" + creep.room + "," + ToRoomName + ")");
    var route = Game.map.findRoute(creep.room, ToRoomName);
    if (route.length > 0) {
        //console.log('Now heading to room ' + route[0].room);
        var exit = creep.pos.findClosestByRange(route[0].exit);
        creep.moveTo(exit);
    }
}

var DoHarvester = function(creep) {
    var source = creep.GetAllocatedObject();
    if (source && (source.structureType == STRUCTURE_STORAGE || source.structureType == STRUCTURE_CONTAINER)) {
        //console.log("builder withdraw:" + source.structureType);
        if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(source);
        }
    } else {
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.moveTo(source);
        }
    }
}

var DoBuild = function(creep) {
    var room = Game.rooms[creep.room.name];
    var targets = room.find(FIND_CONSTRUCTION_SITES);
    if (targets.length) {
        // 不在一个房间                
        if (creep.memory.workRoom != creep.room.name) {
            MoveToRoom(creep, creep.memory.workRoom);
        } else {
            var nearestSite = creep.pos.findClosestByRange(targets);
            var ret = creep.build(nearestSite);
            if (ret == ERR_NOT_IN_RANGE) {
                creep.moveTo(nearestSite);
            }
        }
    }
}

var DoRepair = function(creep) {
    var RepairRoad = FindImpairedRoad(creep.room);
    if (RepairRoad) {
        creep.say('repairing');
        if (creep.repair(RepairRoad) != 0) {
            creep.moveTo(RepairRoad);
        }
    } else {
        creep.say('store');
        var store = creep.FindStorableForStore();
        if (store) {
            if (creep.transfer(store, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(store);
            }
        } else {
            var target = creep.room.controller;
            if (creep.upgradeController(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {
                    reusePath: 50
                });
            }
        }
    }
}

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

	    if(creep.memory.state == State.Building && creep.carry.energy == 0) {
            if (creep.AllocateStorage(0, creep.carryCapacity) || creep.AllocateSource()){
                creep.memory.state = State.Harvester;
                creep.say('harvesting');
            }
	    } else if(creep.memory.state == State.Harvester && creep.carry.energy == creep.carryCapacity) {
            if (creep.UnAllocateSource()){
                if (creep.room.ExistImpairedSite()){
                    creep.memory.state = State.Repair;
                    creep.say('repair');
                } else {
                    creep.memory.state = State.Building;
                    creep.say('building');
                }
            }
	    }

        // 状态执行
        if (creep.memory.state == State.Building) {
            DoBuild(creep);
        } else if (creep.memory.state == State.Repair) {
            DoRepair(creep);
        } else if (creep.memory.state == State.Harvester) {
            DoHarvester(creep);
        }
	}
};

module.exports = roleBuilder;