// 侦察兵
// -探索周边房间
// -侦察房间情况

var State = {
    Explore: "explore",
    Stay: "stay"
};

var Explore = function(creep) {
    creep.say("explore");

    var exits = Game.map.describeExits(creep.room.name);
    var BottomRoom = exits[FIND_EXIT_TOP];
    if (BottomRoom) {
        var exitDir = Game.map.findExit(creep.room, BottomRoom);
        var exit = creep.pos.findClosestByRange(exitDir);
        //console.log("exit:" + exit);
        creep.moveTo(exit);
    }
}

var Stay = function(creep) {

}

var roleScout = {

    /** @param {Creep} creep **/
    run: function(creep) {        
        var IsMyController = creep.room.controller.my;
        if (IsMyController) {
            creep.memory.state = State.Explore;
        } else {
            creep.memory.state = State.Stay;
        }

        switch (creep.memory.state) {
            case State.Explore:
                Explore(creep);
                break;

            case State.Stay:
                Stay(creep);
                break;

            default:
                break;
        }
    }
};

module.exports = roleScout;