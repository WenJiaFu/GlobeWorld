var State = {    
    Harvest: "harvest",
    Store: "store"
};

var Harvest = function(creep) {
    if (!creep.memory.mineral) {
        var mineral = creep.room.find(FIND_MINERALS, {
            filter: (mineral) => {
                return mineral.mineralAmount > 0;
            }
        })[0];

        if (mineral) {
            creep.memory.mineral = mineral.id;
        }
    }

    if (creep.memory.mineral) {
        var mineral = Game.getObjectById(creep.memory.mineral);
        if (creep.harvest(mineral) == ERR_NOT_IN_RANGE) {
            creep.moveTo(mineral);
        }
    }
}

var Store = function(creep) {
    var wantContainter = true;    
    var store = creep.FindStorableForStore(wantContainter);
    if (store) {
        for (var type in creep.carry) {
            if (creep.carry[type] > 0) {
                var ret = creep.transfer(store, type);
                if (ret == ERR_NOT_IN_RANGE) {
                    creep.moveTo(store);
                    break;
                }
            }
        }
    }
}

var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // 状态运行
        if (creep.memory.state == State.Harvest && _.sum(creep.carry) == creep.carryCapacity) {
            creep.memory.state = State.Store;
        } else if (creep.memory.state == State.Store && _.sum(creep.carry) == 0) {
            creep.memory.state = State.Harvest;
        }

        if (creep.memory.state == State.Harvest) {
            Harvest(creep);
        } else if (creep.memory.state == State.Store) {
            Store(creep);
        }
	}
};

module.exports = roleMiner;