// 建筑工人
// -负责建设设施
// -负责维修

var State = {
    Harvester: "harvester",
    Building: "building"
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
    console.log("MoveToRoom(" + creep.room + "," + ToRoomName + ")");
    var route = Game.map.findRoute(creep.room, ToRoomName);
    if (route.length > 0) {
        //console.log('Now heading to room ' + route[0].room);
        var exit = creep.pos.findClosestByRange(route[0].exit);
        creep.moveTo(exit);
    }
}

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

	    if(creep.memory.state == State.Building && creep.carry.energy == 0) {
            if (creep.AllocateStorage(0) || creep.AllocateSource()){
                creep.memory.state = State.Harvester;
                creep.say('harvesting');
            }            
	    }
	    if(creep.memory.state == State.Harvester && creep.carry.energy == creep.carryCapacity) {
            if (creep.UnAllocateSource()){
                creep.memory.state = State.Building;
                creep.say('building');
            }
	    }

        // 优先级 build(修造) > repair(修复)
        if (creep.memory.state == State.Building) {
            var targets = undefined;
            for (var name in Game.rooms) {
                var room = Game.rooms[name];
                targets = room.find(FIND_CONSTRUCTION_SITES);
                if (targets.length > 0) {
                    break;
                }
            }

            if (targets.length) {
                creep.say('building');

                // 不在一个房间
                if (targets[0].room.name != creep.room.name) {
                    MoveToRoom(creep, targets[0].room.name);
                } else {
                    var nearestSite = creep.pos.findClosestByRange(targets);
                    if (creep.build(nearestSite) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(nearestSite);
                    }
                }
            } else {
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
                    }
                }
            }
        } else {
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
	}
};

module.exports = roleBuilder;