var MinStock = 20000; // 20K

var State = {
    Harvester: "harvester",
    Upgrade: "upgrade"
};

var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        // 状态检测
        if (creep.memory.state == State.Upgrade && creep.carry.energy == 0) {
            if (creep.AllocateStorage(MinStock, creep.carryCapacity) || creep.AllocateSource()) {
                creep.memory.state = State.Harvester;
                creep.say('harvesting');
            }
        }
        if (creep.memory.state == State.Harvester && creep.carry.energy == creep.carryCapacity) {
            if (creep.UnAllocateSource()) {
                creep.memory.state = State.Upgrade;
                creep.say('upgrading');
            }
        }

        // 动作执行
        if (creep.memory.state == State.Upgrade) {
            var target = creep.room.controller;
            if (creep.upgradeController(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {reusePath: 50});
            }
        } else {
            var source = creep.GetAllocatedObject();
            if (source && (source.structureType == STRUCTURE_STORAGE || source.structureType == STRUCTURE_CONTAINER)) {                
                if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {reusePath:50});
                }
            } else {                
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {reusePath:50});
                }
            }
        }
	}
};

module.exports = roleUpgrader;