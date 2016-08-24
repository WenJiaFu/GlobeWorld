// 内存清理
// -清理不存在对象的内存

var MemoryCleanup = function() {
    // 清除不存在的Creep
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            console.log('Clearing non-existing creep memory:', name);
            delete Memory.creeps[name];
        }
    }

    // 清除已无效的资源分配信息
    for (var id in Memory.rooms) {
        if (Memory.rooms[id].Sources) {
            for (var sourceid in Memory.rooms[id].Sources) {
                var assigned = Memory.rooms[id].Sources[sourceid].assigned;
                for (var creep in assigned) {
                    var creepId = assigned[creep];
                    if (!Game.getObjectById(creepId)) {
                        console.log("Clearing non-existing source assigned:", creep);
                        delete Memory.rooms[id].Sources[sourceid].assigned[creep];
                    }
                }
            }
        }
    }
}

var memoryCleanup = {

    /** @param {room} **/
    run: function() {
    	MemoryCleanup();
    }
}

module.exports = memoryCleanup;