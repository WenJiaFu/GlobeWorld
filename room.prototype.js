var roomConstruction = require('room.construction');

var STEP_TOP = {x:0, y:-1};
var STEP_TOP_RIGHT = {x:1, y:-1};
var STEP_RIGHT = {x:1, y:0};
var STEP_BOTTOM_RIGHT = {x:1, y:1};
var STEP_BOTTOM = {x:0, y:1};
var STEP_BOTTOM_LEFT = {x:-1, y:1};
var STEP_LEFT = {x:-1, y:0};
var STEP_TOP_LEFT = {x:-1, y:-1};

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
// 房间Source资源重分配
// **
Room.prototype.ReAllocate = function() {
    for (var id in this.memory.Sources) {
        this.memory.Sources[id].needAssigned = true;
        console.log("Room source[" + id + "] ReAllocate.");
    }    
}

// **
// 房间内是否有损坏的设施(公路、集装箱)
// **
Room.prototype.ExistImpairedSite = function() {
    return this.memory.LossySites ? _.size(this.memory.LossySites) > 0 : false;
}

// **
// 房间是否需要建筑防御(墙、关卡)
// **
Room.prototype.ExistImpairedDefense = function() {
    return this.memory.defenseSites ? _.size(this.memory.defenseSites) > 0 : false;
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

var StepGo = function(origin, direction, stepNum) {
    return {
        x: (origin.x + direction.x * stepNum),
        y: (origin.y + direction.y * stepNum)
    };
};

Room.prototype.CleanFlag = function() {
    var flags = this.find(FIND_FLAGS);
    flags.forEach(function(flag) {
        flag.remove();
    });
}

Room.prototype.CanConstruct = function(pos) {
    var look = this.lookAt(pos.x, pos.y);
    var canDo = true;
    look.forEach(function(lookObject) {
        if (lookObject.type == LOOK_STRUCTURES || (lookObject.type == LOOK_TERRAIN && lookObject[LOOK_TERRAIN] == "wall")) {
            canDo = false;
        }
    });

    //var FlagColor = canDo ? COLOR_GREEN : COLOR_RED;
    //this.createFlag(pos.x, pos.y, undefined, FlagColor);
    return canDo;
}

Room.prototype.AutoExtension = function(CenterPos, ExtensionNum) {
    var StepDirectionOrder = [STEP_TOP, STEP_RIGHT, STEP_BOTTOM, STEP_LEFT];
    for (var ring = 1; ring <= 5; ring++) {
        // 确定每圈起点
        var StartingPoint = StepGo(CenterPos, STEP_BOTTOM_LEFT, ring);
        var CurrentCheckPoint = StartingPoint;
        for (var index in StepDirectionOrder) {
            // 循环一圈构建
            var StepNum = ring * 2;
            while (StepNum) {
                CurrentCheckPoint = StepGo(CurrentCheckPoint, StepDirectionOrder[index], 1);
                if (this.CanConstruct(CurrentCheckPoint)) {
                    let createRoad = StepNum % 2;
                    if (createRoad) {
                        this.createConstructionSite(CurrentCheckPoint.x, CurrentCheckPoint.y, STRUCTURE_ROAD);
                    } else {
                        if (this.createConstructionSite(CurrentCheckPoint.x, CurrentCheckPoint.y, STRUCTURE_EXTENSION) == OK) {
                            ExtensionNum--;
                        }
                    }

                    if (ExtensionNum == 0) {
                        return;
                    }

                    // console.log(`At pos[${CurrentCheckPoint.x},${CurrentCheckPoint.y}] StepNum[${StepNum}] ring[${ring}] Extension[${createRoad}]`);
                    // let FlagColor = createRoad ? COLOR_GREY : COLOR_YELLOW;
                    // this.createFlag(CurrentCheckPoint.x, CurrentCheckPoint.y, undefined, FlagColor);
                } else {
                    //this.createFlag(CurrentCheckPoint.x, CurrentCheckPoint.y, undefined, COLOR_RED);
                }

                //console.log(`at pos[${CurrentCheckPoint.x}, ${CurrentCheckPoint.y}] CanConstruct:` + this.CanConstruct(CurrentCheckPoint));
                StepNum--;
            }
        }
    }
}

// **
// 房间测试函数
// **
Room.prototype.Upgrader = function () {
    roomConstruction.OnControllerUpgrade(this);
}

var roomPrototype = {
    
}
    
module.exports = roomPrototype;