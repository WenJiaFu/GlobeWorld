// 拓荒者
// -向附近房间探索
// -找到可占领房间的开始占领

var State = {
    Explore: "explore",
    Claim: "claim"
};

var Explore = function(creep) {
    creep.say("explore");

    var exits = Game.map.describeExits(creep.room.name);
    var TopRoom = exits[FIND_EXIT_TOP];
    if (TopRoom) {
        var exitDir = Game.map.findExit(creep.room, TopRoom);
        var exit = creep.pos.findClosestByRange(exitDir);
        creep.moveTo(exit);
    }
}

var Claim = function(creep) {
    creep.say("claim");
    
    var ret = creep.claimController(creep.room.controller);
    //var ret = creep.reserveController(creep.room.controller);
    console.log("reserveController:" + ret);
    if (ret == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller);
    }
}

var rolePioneer = {

    /** @param {Creep} creep **/
    run: function(creep) {

        var IsMyController = creep.room.controller.my;
        if (IsMyController) {
            creep.memory.state = State.Explore;
        } else {
            creep.memory.state = State.Claim;
        }

        switch (creep.memory.state) {
            case State.Explore:
                Explore(creep);
                break;

            case State.Claim:
                Claim(creep);
                break;

            default:
                break;
        }
    }
};

module.exports = rolePioneer;