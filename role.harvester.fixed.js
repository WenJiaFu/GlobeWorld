// 采集者(固定)状态
var State = {
    Init: "init",
    MoveToFixed: "moveToFixed",
    Harvest: "harvest"    
};

var Init = function(creep) {
    var id = creep.memory.PreAllocate;
    creep.AllocateSource(id);
}

var MoveToFixed = function(creep) {    
    var source = creep.GetAllocatedObject();
    if (!creep.memory.fixedHarvestPos) {
        var Target = creep.room.FindAroundContainer(source.pos);
        if (Target) {
            creep.memory.fixedHarvestPos = Target.pos;
        } else {
            console.log("harvesterFixed cann't find container around source at " + source.pos);
        }
    }
    
    var fixedPos = creep.memory.fixedHarvestPos;
    if (!creep.pos.isEqualTo(fixedPos.x, fixedPos.y)) {
        var ret = creep.moveTo(fixedPos.x, fixedPos.y);
        return false;
    }

    return true;
}

var Harvest = function(creep) {
    var source = creep.GetAllocatedObject();
    if (source) {
        var ret = creep.harvest(source);
        switch (ret) {
            case ERR_NOT_IN_RANGE:
                creep.moveTo(source);
                break;
            default:
                //console.log("harvest ret: " + ret);
        }
    } else {
        //console.log(`creep[${creep.name}] harvest hasn't allocate source object`);
    }
}

var roleHarvesterFixed = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.memory.state == State.Init) {
            Init(creep);
            creep.memory.state = State.MoveTo;
        } else if (creep.memory.state == State.MoveToFixed) {
            if (MoveToFixed(creep)) {
                creep.memory.state = State.Harvest;
            }
        } else if (creep.memory.state == State.Harvest) {
            Harvest(creep);
        }
    }
};

module.exports = roleHarvesterFixed;