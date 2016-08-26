// 采集者状态
var State = {
    Harvest: "harvest",
    Store: "store",
    Suicide: "suicide"
};

var Harvest = function(creep) {
    var source = creep.GetAllocatedObject();
    if (source) {
        var ret = creep.harvest(source);
        switch (ret) {
            case ERR_NOT_IN_RANGE:
                creep.moveTo(source);
                break;
            case ERR_NOT_ENOUGH_RESOURCES:
                creep.UnAllocateSource();
                break;
            default:
                //console.log("harvest ret: " + ret);
        }
    } else {
        creep.AllocateSource();
    }

    // 采集达到最大值直接Store      
    //console.log(`energy: ${creep.carry.energy} creep.carryCapacity: ${creep.carryCapacity}`);
    if (creep.carry.energy == creep.carryCapacity) {
        console.log("直接存储");
        var store = creep.FindStorableForStore(true);
        creep.transfer(store, RESOURCE_ENERGY);
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
        if (creep.memory.harvesting && creep.carry.energy == creep.carryCapacity) {
            if (creep.UnAllocateSource()) {
                creep.memory.harvesting = false;
                creep.say('store');
            }
        } else if (!creep.memory.harvesting && creep.carry.energy == 0) {
            if (creep.AllocateSource()) {
                creep.memory.harvesting = true;
                creep.say('harvesting');
            }
        }

        var SuicideTick = 30;
        if (creep.ticksToLive < SuicideTick) {
            creep.say("Suicide");
            GoingToSuicide(creep);
        } else if (creep.memory.harvesting) {
            //creep.say("Harvest");
            Harvest(creep);
        } else {
            //creep.say("Store");
            Store(creep);
        }
    }
};

module.exports = roleHarvester;