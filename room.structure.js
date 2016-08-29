var towerNormal = require('tower.normal');

function ControllerObj() {	
	this.level = false;
	this.pathReached = false;
	this.prepareStore = false;
}

// 能源(source)对象声明
function SourceObj(pos) {
	this.pos = pos;
	this.assigned = new Object();
	this.allowedAssigned = 0;
	this.needAssigned = true;
	this.pathReached = false;
}

// 工路(Road)对象声明
function RoadRepairObj(hits, pos) {
    this.hits = hits;
    this.pos = pos;
    this.needRepair = true;
}

// 扫描Source周围(9宫格内)有多少可采集位
var ScanCollectableNum = function(Room, SourcePos) {
    var top = SourcePos.y - 1;
    var left = SourcePos.x - 1;
    var bottom = SourcePos.y + 1;
    var right = SourcePos.x + 1;
    
    var AreaTerrain = Room.lookForAtArea(LOOK_TERRAIN, top, left, bottom, right, true);
    var CollectableNum = 0;
    for (var index in AreaTerrain){
    	if (AreaTerrain[index].x == SourcePos.x && AreaTerrain[index].y == SourcePos.y) {
    		continue;
    	}

        if (AreaTerrain[index].terrain == "plain") {
            CollectableNum++;
        }
    }
    
    return CollectableNum;
}

// 初始化房间内的Source
var InitSource = function(room) {
    if (room.memory.Sources) {
        delete room.memory.Sources;
        console.log("Clearing room.memroy.Sources..");
    }
    
    room.memory.Sources = new Object();

    var sources = room.find(FIND_SOURCES);    
    for (var index in sources) {
        var source = sources[index];
        var sourceObj = new SourceObj(source.pos);
        var id = source.id;
        sourceObj.CollectableNum = ScanCollectableNum(room, sourceObj.pos);
        sourceObj.allowedAssigned = sourceObj.CollectableNum * 2;
        room.memory.Sources[id] = sourceObj;        

        console.log("wrote [" + room.name + "] memory.Sources ->"
        + " source" + source.pos
        + ", allowedAssigned:" + sourceObj.allowedAssigned);
    }
}

// 初始化房间内的Controller
var InitController = function(room) {
	if (room.memory.controller) {
        delete room.memory.controller;
        console.log("Clearing room.memroy.controller..");
    }    
    
    room.memory.controller = new ControllerObj();
	console.log("wrote [" + room.name + "] memory.controller");
}

var InitRoom = function(room) {
	if (!room.memory.init) {
		InitSource(room);
		InitController(room);

        room.memory.init = true;
        console.log("Room[" + room.name + "] initialization has completed.");
	}
}

// Update All Structure
var UpdateStructure = function(room) {
	//var BeginCPU = Game.cpu.getUsed();

	var structures = room.find(FIND_STRUCTURES, {
		filter: (structure) => {
			return structure.structureType == STRUCTURE_LINK ||
				structure.structureType == STRUCTURE_TOWER ||
				structure.structureType == STRUCTURE_CONTAINER;
		}
	});

	for (var obj in structures) {
		switch (structures[obj].structureType) {
			case STRUCTURE_LINK:
				UpdateLink(structures[obj]);
				break;
			case STRUCTURE_TOWER:
				UpdateTower(structures[obj]);
				break;
			case STRUCTURE_CONTAINER:
				UpdateContainer(structures[obj]);
				break;
			default:
				console.log("no matched structure type update.");
				break;
		}
	}

	UpdateController(room);
	//console.log("UpdateStructure Cost:" + (Game.cpu.getUsed() - BeginCPU));
}

// 更新传送器(Link)
var UpdateLink = function(link) {
	// var BeginCPU = Game.cpu.getUsed();

	// Init Link Memory
	if (!link.room.memory.Links) {
		link.room.memory.Links = new Object();
	}

	// 查询周边设施
	var AroundStructs = link.room.findInRange(FIND_STRUCTURES, 5, {
		filter: (structure) => {
			return structure.structureType == STRUCTURE_LINK ||
				structure.structureType == STRUCTURE_TOWER;
		}
	});

	var linkid = link.id;
	link.room.memory.Links[linkid] = {
		around: new Object()
	};
	for (var obj in AroundStructs) {
		var ar_id = AroundStructs[obj].id;
		link.room.memory.Links[id].around[ar_id] = AroundStructs[obj].structureType;
	}
}

// 更新炮台(Tower)
var UpdateTower = function(tower) {
	// Init Tower Memory
	if (!tower.room.memory.towers) {
		tower.room.memory.towers = new Object();
	}

	var id = tower.id;
	var isFull = (tower.energy == tower.energyCapacity);
	tower.room.memory.towers[id] = {
		energy: tower.energy,
		energyCapacity: tower.energyCapacity,
		full: isFull
	};
}

// 更新集装箱(Container)
var UpdateContainer = function(container) {
	var id = container.id;

	// Init Container Memory
	if (!container.room.memory.container) {
		container.room.memory.container = new Object();
	}

	if (!container.room.memory.container[id]) {
		container.room.memory.container[id] = {
			discharge: false,
			storeEnergy: 0,
			storeCapacity: 0
		};
	}

	var discharge = container.room.memory.container[id].discharge;
	if (_.sum(container.store) >= container.storeCapacity * 0.9) {
		container.room.memory.container[id].discharge = true;
	}
	if (discharge && container.store[RESOURCE_ENERGY] == 0) {
		container.room.memory.container[id].discharge = false;
	}

	container.room.memory.container[id].storeEnergy = container.store[RESOURCE_ENERGY];
	container.room.memory.container[id].storeCapacity = container.storeCapacity;

	// 清理内存
	var containerMemory = container.room.memory.container;
	for (var id in containerMemory) {
		if (!Game.getObjectById(id)) {
			delete container.room.memory.container[id];
		}
	}

	//console.log("container.store: " + container.store[RESOURCE_ENERGY]);
}

var UpdateController = function(room) {
	room.memory.controller.level = room.controller.level;
}

// 运转传送器
var RunLinks = function(room) {
	var LinkIn = room.GetLink("IN");
	var LinkOut = room.GetLink("OUT");
	if (LinkIn && LinkOut) {
		if (LinkIn.cooldown == 0 && LinkIn.energy == LinkIn.energyCapacity) {
			LinkIn.transferEnergy(LinkOut);
		}
	}
}

// 运转炮台
var RunningTower = function(room) {    
	var towers = room.find(FIND_STRUCTURES, {
		filter: (structure) => {
			return structure.structureType == STRUCTURE_TOWER;
		}
	});

	for (var name in towers) {
		towerNormal.run(towers[name]);
		//console.log(towers[name]);
	}    
}

// 房间设施维护
var MaintainSite = function(room) {
    
    // var BeginCPU =Game.cpu.getUsed();
    
    // 有损耗的设施
    var LossySites = room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_ROAD ||
                structure.structureType == STRUCTURE_CONTAINER || 
                structure.structureType == STRUCTURE_RAMPART)
        }
    });

    if (!room.memory.LossySites) {
        room.memory.LossySites = new Object();        
        console.log("wrote [" + room.name + "] room.memory.LossySites");
    }
    
    // 检测是否设施需要维修
    for (var name in LossySites) {
        var id = LossySites[name].id;
        var needRepair = LossySites[name].hits < LossySites[name].hitsMax / 3;
        var repairOK = LossySites[name].hits == LossySites[name].hitsMax;
        
        if (needRepair && !room.memory.LossySites[id]) {
            room.memory.LossySites[id] = new RoadRepairObj(LossySites[name].hits, LossySites[name].pos);
            //console.log(LossySites[name].structureType + "[" + LossySites[name].pos.x + "," + LossySites[name].pos.y + "] need repair");
        }
        else if (repairOK && room.memory.LossySites[id]) {
            delete room.memory.LossySites[id];
            //console.log(LossySites[name].structureType + "[" + LossySites[name].pos.x + "," + LossySites[name].pos.y + "] repair completed. Remove from the memory");
        }
    }
    
    // var CostCPU = Game.cpu.getUsed() - BeginCPU;
    // console.log("CostCPU:" + CostCPU);
}

// Source状态追踪
var sourceTrace = function(source) {
	var name = source.room.name;
	var id = source.id;

	// LastEmptyTime
	if (source.energy == 0) {
		if (!Game.rooms[name].memory.Sources[id].LastEmptyTime) {
			Game.rooms[name].memory.Sources[id].LastEmptyTime = source.ticksToRegeneration;

			if (source.ticksToRegeneration > 30) {
				//source.ReduceSourceAssigned();
			}
		}
	} else if (source.ticksToRegeneration == 299) {
		if (Game.rooms[name].memory.Sources[id].LastEmptyTime) {
			delete Game.rooms[name].memory.Sources[id].LastEmptyTime;
		}
	}

	// RemainingEnergy
	var MinIncreaseEnergy = 150;
	if (source.ticksToRegeneration == 1) {
		Game.rooms[name].memory.Sources[id].RemainingEnergy = source.energy;

		if (source.energy > MinIncreaseEnergy) {
			//source.IncreaseSourceAssigned();
		}
	}
}

var roomStructure = {
	// 初始化房间
	init: function(room) {
		InitRoom(room);
	},

	// 更新状态
	update: function(room) {
		UpdateStructure(room);
	},

	// 运行设施
	run: function(room) {
		RunLinks(room);
		RunningTower(room);
	},

	// 设施维护
	maintain: function(room) {
		MaintainSite(room);
	},

	// 设施状态追踪
	trace: function(room) {
		for (var id in room.memory.Sources) {
			var source = Game.getObjectById(id);
			sourceTrace(source)
		}
	}
}

module.exports = roomStructure;