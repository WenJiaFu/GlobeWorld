// 单个房间管理
// -监测房间状态
// -管理房间Creep需求

var roomStructure = require('room.structure');
var roomConstructionSite = require('room.construction');
var roomRequirement = require('room.requirement');
var factorySpawn = require('factory.spawn');

// 房间Creep状态
function CreepState() {    
    this.harvester = 0;
    this.harvesterFixed = 0;
    this.upgrader = 0;
    this.builder = 0;
    this.stevedore = 0;
    this.collect = 0;
    this.pioneer = 0;
    this.soldier = 0;
    this.scout = 0;
    this.miner = 0;
}

// 房间Creep状态
function EnergyState() {    
    this.energy = 0;
    this.energyCapacity = 0;
}

// 统计房间内某个角色类型数量
var StatCreepType = function (room, roleName) { 
    var creeps = _.filter(Game.creeps, (creep) => ( creep.memory.role == roleName && creep.memory.workRoom == room.name));
    return creeps.length;
}

var StatCreep = function(room) {
    //console.log("harvester:" + StatCreepType(room, "harvester"));
    if (_.isObject(room.memory.CreepState)) {
        room.memory.CreepState.harvester = StatCreepType(room, "harvester");
        room.memory.CreepState.harvesterFixed = StatCreepType(room, "harvesterFixed");        
        room.memory.CreepState.upgrader = StatCreepType(room, "upgrader");
        room.memory.CreepState.builder = StatCreepType(room, "builder");
        room.memory.CreepState.stevedore = StatCreepType(room, "stevedore");
        room.memory.CreepState.collect = StatCreepType(room, "collect");
        room.memory.CreepState.pioneer = StatCreepType(room, "pioneer");
        room.memory.CreepState.soldier = StatCreepType(room, "soldier");
        room.memory.CreepState.scout = StatCreepType(room, "scout");
        room.memory.CreepState.miner = StatCreepType(room, "miner");
    }
}

var roomStateUpdate = function(room) {
    // 房间energy统计
    if (!room.memory.EnergyState) {
        room.memory.EnergyState = new EnergyState();
    }

    room.memory.EnergyState.energy = 0;
    room.memory.EnergyState.energyCapacity = 0;

    for (var id in room.memory.container) {
        let container = room.memory.container[id];
        room.memory.EnergyState.energy += container.storeEnergy;
        room.memory.EnergyState.energyCapacity += container.storeCapacity;
    }
}

var ManagerInit = function(room) {
    if (!room.memory.CreepState) {
        room.memory.CreepState = new CreepState();
        console.log("wrote [" + room.name + "] room.memory.CreepState");
    }
}

var ManagerRun = function(room) {
    // Creep状态
    StatCreep(room);

    // 初始化
    roomStructure.init(room);
    roomConstructionSite.init(room);
    factorySpawn.init(room);
    roomRequirement.init(room);

    // 建设状态
    roomConstructionSite.update(room);
    roomConstructionSite.run(room);

    // 设施状态    
    roomStructure.update(room);
    roomStructure.run(room);
    roomStructure.maintain(room);
    roomStructure.trace(room);

    // 房间状态
    roomStateUpdate(room);

    // 需求更新    
    roomRequirement.run(room);

    // 生成工厂
    factorySpawn.run(room);    
}

var roomManager = {
    init: function(room) {
        ManagerInit(room);
    },

    /** @param {room} **/
    run: function(room) {
        ManagerRun(room);
    }
}

module.exports = roomManager;