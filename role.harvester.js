// 采集者状态
var State = {
    Init: "init",
    Harvest: "harvest",
    Store: "store",
    Suicide: "suicide"
};

var Init = function(creep) {
    var id = creep.memory.PreAllocate;
    creep.AllocateSource(id);
}

var Harvest = function(creep) {
    var source = creep.GetAllocatedObject();
    if (source) {
        var ret = creep.harvest(source);
        switch (ret) {
            case ERR_NOT_IN_RANGE:
                creep.moveTo(source);
                break;
            case ERR_NOT_ENOUGH_RESOURCES:
                //creep.UnAllocateSource();
                break;
            default:
                //console.log("harvest ret: " + ret);
        }
    } else {
        //console.log(`creep[${creep.name}] harvest hasn't allocate source object`);
    }
}

var Store = function(creep) {
    // 无回收工人时，过滤掉Containter    
    var wantContainter = creep.room.memory.CreepState.collect > 0;
    var store = creep.FindStorableForStore(wantContainter);
    var linkIn = creep.room.GetLink("IN");
    if (linkIn) {
        var ToStoreRange = creep.pos.getRangeTo(store);
        var ToLinkInRange = creep.pos.getRangeTo(linkIn);
        var target = ToStoreRange < ToLinkInRange ? store : linkIn;
    } else {
        target = store;
    }

    if (target) {
        var ret = creep.transfer(target, RESOURCE_ENERGY);
        if (ret == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    } else if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller);
    }
}

var GoingToSuicide = function(creep) {
    creep.say("Suicide");
    var container = creep.FindClosestContainer();
    if (container) {
        var ret = creep.transfer(container, RESOURCE_ENERGY);
        if (ret == OK) {
            //console.log("creep[" + creep.name + "] suicide at " + creep.pos.x + "," + creep.pos.y);
            creep.suicide();
        } else if (ret == ERR_NOT_IN_RANGE) {
            creep.moveTo(container);
        }
    }
}

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        let SuicideTick = 30;

        // 初始状态
        if (creep.memory.state == State.Init) {
            Init(creep);
            creep.memory.state = State.Harvest;
        }

        // 状态运行
        if (creep.memory.state == State.Harvest && creep.carry.energy == creep.carryCapacity) {            
            creep.memory.state = State.Store;
        } else if (creep.memory.state == State.Store && creep.carry.energy == 0) {
            creep.memory.state = State.Harvest;
        } else if (creep.ticksToLive < SuicideTick) {
            creep.memory.state = State.Suicide;
        }

        if (creep.memory.state == State.Suicide) {
            GoingToSuicide(creep);
        } else if (creep.memory.state == State.Harvest) {
            Harvest(creep);
        } else if (creep.memory.state == State.Store) {
            Store(creep);
        }
    }
};

module.exports = roleHarvester;