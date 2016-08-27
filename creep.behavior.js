// 角色模块
var roleHarvester = require('role.harvester');
var roleHarvesterFixed = require('role.harvester.fixed');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleStevedore = require('role.stevedore');
var roleCollect = require('role.collect');
var rolePioneer = require('role.pioneer');
var roleSoldier = require('role.soldier');
var roleScout = require('role.scout');

var RunningCreep = function(creep) {
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.spawning)
            continue;

        if (creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        } else if (creep.memory.role == 'harvesterFixed') {            
            roleHarvesterFixed.run(creep);
        } else if (creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        } else if (creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        } else if (creep.memory.role == 'stevedore') {
            roleStevedore.run(creep);
        } else if (creep.memory.role == 'collect') {
            roleCollect.run(creep);        
        } else if (creep.memory.role == 'pioneer') {
            rolePioneer.run(creep);
        } else if (creep.memory.role == 'soldier') {
            roleSoldier.run(creep);
        } else if (creep.memory.role == 'scout') {
            roleScout.run(creep);
        }
    }
}

var creepBehavior = {

    /** @param {creep} **/
    run: function(creep) {
        RunningCreep(creep);
    }
}

module.exports = creepBehavior;