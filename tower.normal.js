// 找到需要维修的工路
var FindImpairedRoad = function(room) {
    var LossySites = room.memory.LossySites;
    
    if (LossySites){ 
        for (var id in LossySites) {            
            var ImpairedRoad = Game.getObjectById(id);

            // 已不存在，从内存中清除
            if (!ImpairedRoad){
                delete room.memory.LossySites[id];
                continue;
            }

            return ImpairedRoad;
        }
    }
}

var FindEnermy = function(room) {
    var enermys = room.find(FIND_HOSTILE_CREEPS);
    if (enermys.length > 0) {
        return enermys[0];
    }

    return undefined;
}

var towerNormal = {

    /** @param {tower} tower **/
    run: function(tower) {
        var enermy = FindEnermy(tower.room);
        if (enermy) {
            tower.attack(enermy);
        } else {
            var ImpairedRoad = FindImpairedRoad(tower.room);
            tower.repair(ImpairedRoad);
        }
    }
}

module.exports = towerNormal;