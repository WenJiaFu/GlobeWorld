// 拓荒者
// -向附近房间探索
// -找到可占领房间的开始占领

var State = {
    Explore: "explore",
    Claim: "claim"
};

var MoveToRoom = function(creep, ToRoom) {
    //console.log("MoveToRoom(" + creep.room.name + "," + ToRoom + ")");
    var route = Game.map.findRoute(creep.room.name, ToRoom);
    if (route.length > 0) {
        //console.log('Now heading to room ' + route[0].room);
        var exit = creep.pos.findClosestByRange(route[0].exit);
        creep.moveTo(exit);
    }
}

var Explore = function(creep) {
    creep.say("explore");    
    MoveToRoom(creep, creep.memory.workRoom);

    // var exits = Game.map.describeExits(creep.room.name);
    // var TopRoom = exits[FIND_EXIT_TOP];
    // if (TopRoom) {
    //     var exitDir = Game.map.findExit(creep.room, TopRoom);
    //     var exit = creep.pos.findClosestByRange(exitDir);
    //     creep.moveTo(exit);
    // }
}

var Claim = function(creep) {
    creep.say("claim");    
    var ret = creep.claimController(creep.room.controller);    
    if (ret == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller);
    }
}

var rolePioneer = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if (creep.room.name != creep.memory.workRoom) {
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