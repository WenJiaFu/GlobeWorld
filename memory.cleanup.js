// 内存清理
// -清理不存在对象的内存

var MemoryCleanup = function() {
    // 清除不存在的Creep
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            // 清除分配的资源信息
            var source = Game.getObjectById(Memory.creeps[name].AllocatedSourceID);
            if (source) {
                if (source.room.memory.Sources[source.id] && source.room.memory.Sources[source.id].assigned) {
                    console.log("Clearing non-existing source assigned:", name);
                    delete source.room.memory.Sources[source.id].assigned[name];
                }

                let roleType = Memory.creeps[name].role;
                if (roleType == "harvester" || roleType == "harvesterFixed") {
                    console.log(`Source[${source.id}] set needAssigned: true`);
                    source.room.memory.Sources[source.id].needAssigned = true;
                }
            }

            // 清除自身
            console.log(`Clearing non-existing creep memory[${name}] role[${Memory.creeps[name].role}]`);
            delete Memory.creeps[name];
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