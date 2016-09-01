// 士兵
// -近战士兵

var State = {
    Defense: "defense",
    Attack: "attack",
    MoveTo: "moveTo"
};

var MoveToRoom = function(creep, room) {
    if (!creep.memory.moveTo) {
        creep.memory.moveTo = room;
    }

    if (creep.room.name != creep.memory.moveTo) {
        var route = Game.map.findRoute(creep.room, creep.memory.moveTo);
        if (route.length > 0) {            
            var exit = creep.pos.findClosestByRange(route[0].exit);
            //console.log('moveTo exit :' + exit);
            creep.moveTo(exit);
            //creep.moveTo(new RoomPosition(0, 30, 'W30N26'));
        }
    }
}

var Defense = function(creep) {    
    if (!creep.memory.enemy) {
        //let enemies = creep.room.find(FIND_HOSTILE_CREEPS);
        let enemies = creep.room.find(FIND_HOSTILE_STRUCTURES);        
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

        var beginCPU = Game.cpu.getUsed();

        if (creep.attack(enemy) == ERR_NOT_IN_RANGE) {
            creep.moveTo(enemy);
        }
    }
}

var Attack = function(creep) {
    let AttackRoom = Memory.gameConfig.attackRoom;    

    // 移到目标房间
    //console.log(`${creep.memory.moveTo} != ${creep.room.name}`)
    if (creep.memory.moveTo != creep.room.name) {
        MoveToRoom(creep, AttackRoom);
    } else {
        //console.log("defnese");
        Defense(creep);
    }
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

            case State.MoveTo:
                MoveToRoom(creep);
                break;

            default:
                break;
        }
    }
};

module.exports = roleSoldier;