// 移动测试
Creep.prototype.MoveTo = function (posX, posY) {
    //console.log("posX:" + posX + " posY:" + posY + " room:" + this.room.name);
    var pos = new RoomPosition(posX, posY, this.room.name);

    if (!this.memory.pathTo) {
        this.memory.pathTo = "";
    }

    var path = this.pos.findPathTo(pos);
    this.memory.pathTo = Room.serializePath(path);
    console.log("serialize path:" + this.memory.pathTo);

    //console.log("room name" + this.room);

// var path = spawn.pos.findPathTo(source);
// Memory.path = Room.serializePath(path);
// creep.moveByPath(Memory.path);

    //var pos = new RoomPosition(10, 25, 'sim');
    //console.log(pos);
    return true;
}

// 统计Body个数
Creep.prototype.BodyCount = function (BodyName){
    var BodyNum = 0;
    for (var index in this.body){
        if (this.body[index].type == BodyName){
            BodyNum++;
        }
    }
    
    return BodyNum;
};

// ******************************
// 资源采集
// ******************************

// 查找到距离最近的可采集资源
Creep.prototype.FindClosestSource = function() {
    var NearestSource = null;
    var LeastStepNum = 0;
    var Sources = this.room.memory.Sources;

    if (Sources) {
        for (var id in Sources) {
            var source = Game.getObjectById(id);
            var PathStep = this.pos.findPathTo(source);

            // 资源是否可采集            
            if (_.size(Sources[id].assigned) >= Sources[id].allowedAssigned || source.energy == 0){
                //console.log("资源[" + id + "]已达到最大分配");
                continue;
            }

            // 距离判断            
            if (!NearestSource || PathStep.length < LeastStepNum){
                NearestSource = source;
                LeastStepNum = PathStep.length;
            }

            //console.log("find range in sources[" + id + "] | PathStep:" + PathStep.length + " Cost:" + findPathCost);
        }
    }
    else{
        console.log("Cann't find memroy sources in room[" + this.room.name +"]");
    }
    
    return NearestSource;
};

// 分配存储罐(storage)
Creep.prototype.AllocateStorage = function(MinStock) {
    var storages = this.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return ((structure.structureType == STRUCTURE_STORAGE && structure.store[RESOURCE_ENERGY] > MinStock) ||
            (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0));            
        }
    });    

    try {        
        if (_.size(storages) > 0) {
            var BeginCPU = Game.cpu.getUsed();
            var storage = this.pos.findClosestByPath(storages);
            //console.log("AllocateStorage find closest storage cost: " + (Game.cpu.getUsed() - BeginCPU));            
            this.memory.AllocatedSourceID = storage.id;
            return storage;
        }
    } catch (e) {
        console.log(e);
    }

    return undefined;
}

// 分配资源
Creep.prototype.AllocateSource = function(allocateId) {
    let source = undefined;
    if (allocateId) {
        source = Game.getObjectById(allocateId);
    } else {
        source = this.FindClosestSource();
    }

    if (source) {
        let id = source.id;
        this.memory.AllocatedSourceID = id;
        Memory.rooms[this.room.name].Sources[id].assigned[this.name] = this.id;
    } else {
        //console.log("Cann't allocation to source");
    }
    
    return source;
}

// 释放分配的资源
Creep.prototype.UnAllocateSource = function (){
    if (this.memory.AllocatedSourceID) {
        var id = this.memory.AllocatedSourceID;
        if (this.room.memory.Sources[id]) {
            var assigned = this.room.memory.Sources[id].assigned;
            delete this.room.memory.Sources[id].assigned[this.name];
            delete this.memory.AllocatedSourceID;
            //console.log("un assigned[" + id + "] from: " + this.name);
        }
    }

    return true;
}

// 获取已分配的资源
Creep.prototype.GetAllocatedObject = function (){
    if (this.memory.AllocatedSourceID){
        var id = this.memory.AllocatedSourceID;
        return Game.getObjectById(id);
    }

    return undefined;
}

// ******************************
// 资源存储
// ******************************

// 找到存储回收资源的设施
Creep.prototype.FindStorableForRecycle = function(){
    var target = undefined;

    // Step1: CONTAINER && EXTENSION && SPAWN
    var storages = this.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION ||
                structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity;            
        }
    });

    // Step2: STORAGE
    if (storages.length == 0) {
        storages = this.room.storage;
    }

    // 从可存储设施列表中选出最近的目标
    target = this.pos.findClosestByRange(storages);
    return target;
}

// 找到可存储目标
// 优先级 CONTAINER && EXTENSION & SPAWN > STORAGE
Creep.prototype.FindStorableForStore = function(wantContainter){
    var target = undefined;

    // Step1: CONTAINER && EXTENSION && SPAWN
    var storages = this.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            var isFinded = false;
            if (structure.structureType == STRUCTURE_EXTENSION ||
                structure.structureType == STRUCTURE_SPAWN) {
                isFinded = structure.energy < structure.energyCapacity;
            }
            else if (wantContainter && structure.structureType == STRUCTURE_CONTAINER) {
                isFinded = _.sum(structure.store) < structure.storeCapacity;
            }
            return isFinded;
        }
    });

    // Step2: STORAGE
    if (storages.length == 0) {
        storages = this.room.storage;
    }

    // 从可存储设施列表中选出最近的目标
    target = this.pos.findClosestByRange(storages);
    return target;
}

// ******************************
// 设施操作
// ******************************

// 转换能量到设施
Creep.prototype.TransferEnergyTo = function(struct) {
    if (struct) {
        if (this.transfer(struct, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(struct);
        }
    }
}

// 查找到距离最近的tower
// - 能量未满
Creep.prototype.FindClosestTower = function() {
    var towers = this.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_TOWER && structure.energy < structure.energyCapacity);
        }
    });

    var tower = this.pos.findClosestByRange(towers);
    return tower;
}

// 查找到距离最近的container
Creep.prototype.FindClosestContainer = function() {
    var containers = this.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_CONTAINER);
        }
    });

    var container = this.pos.findClosestByRange(containers);
    return container;
}

var creepPrototype = {
    
};

module.exports = creepPrototype;