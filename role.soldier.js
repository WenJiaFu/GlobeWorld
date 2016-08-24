// 士兵
// -近战士兵

var State = {
    MoveToRoom: "move.to.room",
    Attack: "attack"
};

var MoveToRoom = function(creep) {
    var AttackRoomName = creep.memory.AttackRoom;
    var route = Game.map.findRoute(creep.room, AttackRoomName);
    if (route.length > 0) {
        //console.log('Now heading to room ' + route[0].room);
        var exit = creep.pos.findClosestByRange(route[0].exit);
        creep.moveTo(exit);
    }
}

var Attack = function(creep) {
    creep.say("Attack");
    var Target = creep.room.controller;
    var ret = creep.attackController(Target);
    console.log("attack ret:" + ret);
    if (creep.attackController(Target) == ERR_NOT_IN_RANGE) {
        creep.moveTo(Target);
    }    
}

// 找到被标记为攻击目标的房间
var FindAttackRoom = function () {    
    var AttackRoom = undefined;
    for (var name in Game.rooms) {
        if (Game.rooms[name].memory.Attack == true) {
            AttackRoom = Game.rooms[name];            
            break;
        }
    }

    return AttackRoom;
}

var roleSoldier = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (!creep.memory.AttackRoom) {
            var TargetRoom = FindAttackRoom();
            creep.memory.AttackRoom = TargetRoom.name;
            creep.memory.state = State.MoveToRoom;
        } else if (creep.memory.AttackRoom == creep.room.name) {
            creep.memory.state = State.Attack;
        }

        switch (creep.memory.state) {
            case State.MoveToRoom:
                MoveToRoom(creep);
                break;

            case State.Attack:
                Attack(creep);
                break;

            default:
                break;
        }
    }
};

module.exports = roleSoldier;