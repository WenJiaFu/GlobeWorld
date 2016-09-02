// 游戏相关
var gameConsole = require('game.console');
var gameConfig = require('game.config');
var gameState = require('game.state');
// 原型加载
var roomPrototype = require('room.prototype');
var roomObjectPrototype = require('roomObject.prototype');
var creepPrototype = require('creep.prototype');
var structurePrototype = require('structure.prototype');
// Creep行为
var creepBehavior = require('creep.behavior');
// 房间调度
var roomSchedule = require('room.schedule');
// 内存清理
var memoryCleanup = require('memory.cleanup');

global.FindExit = function() {

    var exitDir = Game.rooms.W32N28.findExitTo("W32N27");
    var exits = Game.spawns['Spawn1'].pos.findClosestByPath(exitDir);
    console.log(exits);

    // var route = Game.map.findRoute(creep.room.name, "W32N27");
    // if (route.length > 0) {
    //     //console.log('Now heading to room ' + route[0].room);
    //     var exit = creep.pos.findClosestByRange(route[0].exit);
    //     creep.moveTo(exit);
    //     return false;
    // }
}

module.exports.loop = function () 
{   
    //var BeginCPU = Game.cpu.getUsed();
    //console.log("loop begin - limit: " + Game.cpu.limit + " tickLimit: " + Game.cpu.tickLimit + " bucket: " + Game.cpu.bucket);
    //console.log("begin ameConfig.refresh cost:" + (Game.cpu.getUsed() - BeginCPU));

    // 游戏配置
    gameConfig.init();

    // 游戏状态
    gameState.init();
    //console.log("gameConfig.refresh cost:" + (Game.cpu.getUsed() - BeginCPU));

    // 房间调度
    roomSchedule.run();

	// var ScheduleCPU = Game.cpu.getUsed();
	// var ScheduleCost = ScheduleCPU - BeginCPU;	

    //Creep行为
    creepBehavior.run();

    // var BehaviorCPU = Game.cpu.getUsed();
    // var BehaviorCost = BehaviorCPU - ScheduleCPU;

    // 擦除内存
    memoryCleanup.run();

	// var CleanCPU = Game.cpu.getUsed();
	// var CleanCost = CleanCPU - BehaviorCPU;	

	// console.log("ScheduleCost: " + ScheduleCost.toFixed(2) + " BehaviorCost: " + BehaviorCost.toFixed(2) + " CleanCost: " + CleanCost.toFixed(2));
 //    console.log("loop end - limit: " + Game.cpu.limit + " tickLimit: " + Game.cpu.tickLimit + " bucket: " + Game.cpu.bucket);
}
