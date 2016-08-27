// 工路(Road)对象声明
function RoadRepairObj(hits, pos) {
    this.hits = hits;
    this.pos = pos;
    this.needRepair = true;
}

// room属性定义
Room.prototype.CreepState = {
    harvester: 0,
    upgrader: 0,
    builder: 0,
    stevedore: 0,
    collect: 0,
    pioneer: 0,
    soldier: 0,
    scout: 0
}

// 房间内存在Tower数量
Room.prototype.TowerCount = function() {
    return _.size(this.memory.towers);
}

Room.prototype.GetStorage = function() {
    var storage = null;
    if (this.memory.Storage) {
        storage = Game.getObjectById(this.memory.Storage);
    } else {
        storage = this.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_STORAGE;
            }
        })[0];

        if (storage) {
            this.memory.Storage = storage.id;
        }
    }

    return storage;
}

Room.prototype.GetLink = function(InOrOut) {
    var Links = this.memory.Links;
    for (var id in Links) {
        if (Links[id] == InOrOut) {            
            return Game.getObjectById(id);
        }        
    }
}

// 检测房间指定位置周围(9宫格内)是否有Container
Room.prototype.HasContainerAround = function(CheckPos) {
    var top = CheckPos.y - 1;
    var left = CheckPos.x - 1;
    var bottom = CheckPos.y + 1;
    var right = CheckPos.x + 1;
    
    var LookArea = this.lookForAtArea(LOOK_STRUCTURES, top, left, bottom, right, true);
    var ContainerNum = 0;

    for (var index in LookArea){
        if (LookArea[index].structure.structureType == STRUCTURE_CONTAINER) {
            ContainerNum++;
        }
    }
    
    return ContainerNum;
}

// 找到房间指定位置周围的建筑
Room.prototype.FindAroundContainer = function(FindPos) {
    var top = FindPos.y - 1;
    var left = FindPos.x - 1;
    var bottom = FindPos.y + 1;
    var right = FindPos.x + 1;
    
    var LookArea = this.lookForAtArea(LOOK_STRUCTURES, top, left, bottom, right, true);
    for (var index in LookArea){
        if (LookArea[index].structure.structureType == STRUCTURE_CONTAINER) {
            return LookArea[index].structure;
        }
    }
    
    return undefined;
}

// **
// 重置房间状态
// **
Room.prototype.Reset = function() {
    this.memory.init = false;
    console.log("Room[" + this.name + "] already reset.");
}

// **
// 杀死房间内所有Creep
// **
Room.prototype.KillAll = function() {
    for (var name in Game.creeps){
       Game.creeps[name].suicide();
       console.log(name + " suicide.");
    }
    
    console.log("KillAll Done");
}

// **
// 在指定房间内建造Road【从出生点到Sources】
// **
var ConstructionRoad = function(Room, RoadPathStep){
    for (var Path in RoadPathStep){
        Room.createConstructionSite(RoadPathStep[Path].x, RoadPathStep[Path].y, STRUCTURE_ROAD);
    }
};

Room.prototype.PaveRoad = function(From, To) {
    var PathStep = this.findPath(From, To);
    if (PathStep.length > 0) {
        ConstructionRoad(this, PathStep);
    }
    console.log("Room[" + this.name + "] pave road From" + From +" To " + To + " finished.");
};

// **
// 统计房间内角色数量
// **
Room.prototype.RoleCount = function () {

    var harvesterCount = 0;
    var builderCount = 0;
    var upgraderCount = 0;
    var stevedoreCount = 0;
    var collectCount = 0;
    var pioneerCount = 0;
    var soldierCount = 0;
    var scoutCount = 0;

    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.memory.role == 'harvester') {
            harvesterCount++;
        } else if (creep.memory.role == 'upgrader') {
            upgraderCount++;
        } else if (creep.memory.role == 'builder') {
            builderCount++;
        } else if (creep.memory.role == 'stevedore') {
            stevedoreCount++;
        } else if (creep.memory.role == 'collect') {
            collectCount++;
        } else if (creep.memory.role == 'pioneer') {
            pioneerCount++;
        } else if (creep.memory.role == 'soldier') {
            soldierCount++;
        } else if (creep.memory.role == 'scout') {
            scoutCount++;
        }
    }

    console.log("---- Role Count----");
    console.log("harvester : " + harvesterCount);
    console.log("builderCount : " + builderCount);
    console.log("upgraderCount : " + upgraderCount);
    console.log("stevedoreCount : " + stevedoreCount);
    console.log("collectCount : " + collectCount);
    console.log("pioneerCount : " + pioneerCount);
    console.log("soldierCount : " + soldierCount);
    console.log("scoutCount : " + scoutCount);    
    console.log("-------------------");
};
    
// **
// 房间测试函数
// **
Room.prototype.Test = function () {

    // EXTENSION
    var extensions = this.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType == STRUCTURE_EXTENSION;
        }
    });

    for (var name in extensions){
        console.log(extensions[name]);
    }

    // CONTAINER
    var containers = this.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType == STRUCTURE_CONTAINER;
        }
    });

    for (var name in containers){
        console.log(containers[name]);
    }

    // combined
    var combined = extensions.concat(containers);
    console.log("--------------------");
    for (var name in combined){
        console.log(combined[name]);
    }
}

var roomPrototype = {
    
}
    
module.exports = roomPrototype;