// 士兵
// -近战士兵

var State = {
    Defense: "defense",
    Attack: "attack"
};

// var MoveToRoom = function(creep) {
//     var AttackRoomName = creep.memory.AttackRoom;
//     var route = Game.map.findRoute(creep.room, AttackRoomName);
//     if (route.length > 0) {
//         //console.log('Now heading to room ' + route[0].room);
//         var exit = creep.pos.findClosestByRange(route[0].exit);
//         creep.moveTo(exit);
//     }
// }

var Defense = function(creep) {    
    if (!creep.memory.enemy) {
        let enemies = creep.room.find(FIND_HOSTILE_CREEPS);
        let enemy = creep.pos.findClosestByRange(enemies);
        if (enemy) {
            creep.memory.enemy = {
                id: enemy.id
            };
        }
    }

    if (creep.memory.enemy) {
        let id = creep.memory.enemy.id;
        let enemy = Game.getObjectById(id);
        if (!enemy) {
            delete creep.memory.enemy;
            return ;
        }        
        
        // "owner": {
        //     "username": "Source Keeper"
        // }

        // var jsonStr = JSON.stringify(enemy);
        // console.log(jsonStr);
        var beginCPU = Game.cpu.getUsed();

        if (creep.attack(enemy) == ERR_NOT_IN_RANGE) {
            creep.moveTo(enemy);
        }

        //console.log("Cost CPU:" + (Game.cpu.getUsed() - beginCPU));
    }
}

var Attack = function(creep) {    
    // var Target = creep.room.controller;
    // var ret = creep.attackController(Target);
    // console.log("attack ret:" + ret);
    // if (creep.attackController(Target) == ERR_NOT_IN_RANGE) {
    //     creep.moveTo(Target);
    // }
}

// // 找到被标记为攻击目标的房间
// var FindAttackRoom = function () {    
//     var AttackRoom = undefined;
//     for (var name in Game.rooms) {
//         if (Game.rooms[name].memory.Attack == true) {
//             AttackRoom = Game.rooms[name];            
//             break;
//         }
//     }

//     return AttackRoom;
// }

var roleSoldier = {

    /** @param {Creep} creep **/
    run: function(creep) {
        switch (creep.memory.state) {
            case State.Defense:
                Defense(creep);
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