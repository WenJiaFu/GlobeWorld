// 最大采矿者数
var MaxHarvesterCount = 4;
// 最大升级者数
var MaxUpgraderCount = 4;
// 最大建造者数
var MaxBuilderCount = 0;
// 最大搬运工数
var MaxStevedoreCount = 1;
// 最大回收工人数
var MaxCollectCount = 2;
// 最大殖民者者数
var MaxPioneerCount = 0;
// 最大士兵数
var MaxSoldierCount = 0;
// 最大侦察兵数
var MaxScoutCount = 0;

// Body组合元素
var BodyElement = {
    WORK: {
        Body: [WORK, CARRY, MOVE],
        Cost: 200
    },
    CARRY: {
        Body: [CARRY, CARRY, MOVE],
        Cost: 150
    },
    CLAIM: {
        Body: [CLAIM, MOVE],
        Cost: 650
    },
    ATTACK: {
        Body: [ATTACK, ATTACK, MOVE],
        Cost: 210
    },
    SCOUT: {
        Body: [MOVE],
        Cost: 50
    }
}

// Role类型
var HARVESTER = 'harvester';
var UPGRADER = 'upgrader';
var BUILDER = 'builder';
var STEVEDORE = 'stevedore';
var COLLECT = 'collect';
var PIONEER = 'pioneer';
var SOLDIER = 'soldier';
var SCOUT = 'scout';

// 根据角色名过滤角色
var FindCreepByRole = function (roleName) {
    return _.filter(Game.creeps, (creep) => creep.memory.role == roleName);
}

// 计算Body消费
var CaluBodyCost = function(BodyGroup) {
    var CostTotal = 0;
    for (var index in BodyGroup){
        CostTotal += BODYPART_COST[BodyGroup[index]];
    }
    return CostTotal;
}

// 构建Body
var BuildBody = function (BodyGroupNum, BaseBodyItem) {
    var BodyGroup = [];
    for (var i = 0; i < BodyGroupNum; i++) {
        BodyGroup = BodyGroup.concat(BaseBodyItem);
    }
    return BodyGroup;
};

// 生成Creep
var SpawnCreep = function(RoleType, BodyGroupNum, BaseBodyItem, RoleMemory){
    var BodyGroup = BuildBody(BodyGroupNum, BaseBodyItem);
    var newName = Game.spawns['Spawn1'].createCreep(BodyGroup, undefined, RoleMemory);
    if (_.isString(newName)) {
        console.log('Spawning new ' + RoleType + ': ' + newName);    
    }
    else {
        //console.log("Spawning failed code: " + newName);
    }    
}

var creepAutoSpawn = {
    
    run: function() {
        var harvesters = FindCreepByRole(HARVESTER);
        var upgraders = FindCreepByRole(UPGRADER);
        var builders = FindCreepByRole(BUILDER);
        var stevedores = FindCreepByRole(STEVEDORE);
        var collects = FindCreepByRole(COLLECT);
        var pioneers = FindCreepByRole(PIONEER);
        var soldiers = FindCreepByRole(SOLDIER);
        var scouts = FindCreepByRole(SCOUT);

        var BodyGroupNum = 0;
        var RoleMemory = null;
        var RoleType = null;
        var BaseBodyItem = BodyElement.WORK.Body;        

        for (var name in Game.rooms) {
            var ControllerLevel = Game.rooms[name].controller.level;

            if (harvesters.length < MaxHarvesterCount) {
                RoleType = HARVESTER;
                BodyGroupNum = _.floor(Game.rooms[name].energyAvailable / BodyElement.WORK.Cost);
                RoleMemory = {
                    role: HARVESTER,
                    harvesting: false,
                    room: name
                };
            } else if (builders.length < MaxBuilderCount) {
                RoleType = BUILDER;
                BodyGroupNum = _.min([6, _.floor(Game.rooms[name].energyAvailable / BodyElement.WORK.Cost)]);
                RoleMemory = {
                    role: BUILDER,
                    building: true,
                    room: name
                };
            } else if (upgraders.length < MaxUpgraderCount) {
                RoleType = UPGRADER;
                BodyGroupNum = _.min([6, _.floor(Game.rooms[name].energyAvailable / BodyElement.WORK.Cost)]);
                RoleMemory = {
                    role: UPGRADER,
                    upgrading: true,
                    room: name
                };
            } else if (stevedores.length < MaxStevedoreCount && (ControllerLevel >= 4 || Game.rooms[name].TowerCount() > 0)) {
                RoleType = STEVEDORE;
                BaseBodyItem = BodyElement.CARRY.Body;
                BodyGroupNum = _.min([4, _.floor(Game.rooms[name].energyAvailable / BodyElement.CARRY.Cost)]);
                RoleMemory = {
                    role: STEVEDORE,
                    distribute: false,
                    room: name
                };
            } else if (collects.length < MaxCollectCount && Game.rooms[name].memory.container) {
                RoleType = COLLECT;
                BaseBodyItem = BodyElement.CARRY.Body;
                BodyGroupNum = _.floor(Game.rooms[name].energyAvailable / BodyElement.CARRY.Cost);
                RoleMemory = {
                    role: COLLECT,
                    state: "collect",
                    room: name
                };
            } else if (pioneers.length < MaxPioneerCount) {
                RoleType = PIONEER;
                BaseBodyItem = BodyElement.CLAIM.Body;
                BodyGroupNum = 1;
                RoleMemory = {
                    role: PIONEER,
                    state: "explore",
                    room: name
                };
            } else if (soldiers.length < MaxSoldierCount) {
                RoleType = SOLDIER;
                BaseBodyItem = BodyElement.ATTACK.Body;
                BodyGroupNum = _.min([5, _.floor(Game.rooms[name].energyAvailable / BodyElement.ATTACK.Cost)]);;
                RoleMemory = {
                    role: SOLDIER,
                    state: "move.to.room",
                    room: name
                };
            } else if (scouts.length < MaxScoutCount) {
                RoleType = SCOUT;
                BaseBodyItem = BodyElement.SCOUT.Body;
                BodyGroupNum = 1;
                RoleMemory = {
                    role: SCOUT,
                    state: "explore",
                    room: name
                };
            }

            if (BodyGroupNum > 0) {
                SpawnCreep(RoleType, BodyGroupNum, BaseBodyItem, RoleMemory);
            } else {
                //console.log("MAX CREEP REACHED");
            }
        }
    }
}

module.exports = creepAutoSpawn