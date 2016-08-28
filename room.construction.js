var InitConstructionSite = function(room) {
    if (_.isUndefined(room.memory.construction)) {
        room.memory.construction = 0;
        console.log("wrote [" + room.name + "] room.memory.construction");
    }
}

var UpdateConstructionSite = function(room) {
    var Sites = room.find(FIND_CONSTRUCTION_SITES);
    room.memory.construction = _.size(Sites);
}

var AutoConstruct = function(room) {
    // construct road from [Spawn] to [Source]
    var Sources = room.memory.Sources;
    for (var id in Sources) {        
        if (_.isUndefined(Sources[id].pathReached)) {
            continue;
        }

        if (!Sources[id].pathReached) {
            var spawn = room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_SPAWN && structure.my && !structure.spawning);
                }
            })[0];

            if (spawn) {
                room.PaveRoad(spawn.pos, Sources[id].pos);
                Sources[id].pathReached = true;
            }
        }
    }

    // construct road from [Spawn] to [Controller]    
    if (room.controller.my && (room.memory.controller && !room.memory.controller.pathReached)) {
        var spawn = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_SPAWN && structure.my && !structure.spawning);
            }
        })[0];

        if (spawn) {
            room.PaveRoad(spawn.pos, room.controller.pos);
            room.memory.controller.pathReached = true;
        }
    }    
}

var roomConstructionSite = {
    init: function(room) {
        InitConstructionSite(room);
    },

    // 更新状态
    update: function(room) {
        UpdateConstructionSite(room);
    },

    // 自动建设
    run: function(room) {
        AutoConstruct(room);
    }
};

module.exports = roomConstructionSite;