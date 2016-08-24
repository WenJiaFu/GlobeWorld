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

module.exports.loop = function () 
{
	var BeginCPU = Game.cpu.getUsed();

    // 房间调度
    roomSchedule.run();

	var ScheduleCPU = Game.cpu.getUsed();
	var ScheduleCost = ScheduleCPU - BeginCPU;	

    //Creep行为
    creepBehavior.run();

    var BehaviorCPU = Game.cpu.getUsed();
    var BehaviorCost = BehaviorCPU - ScheduleCPU;

    // 擦除内存
    memoryCleanup.run();

	var CleanCPU = Game.cpu.getUsed();
	var CleanCost = CleanCPU - BehaviorCPU;	

	//console.log("ScheduleCost: " + ScheduleCost + " BehaviorCost: " + BehaviorCost + " CleanCost: " + CleanCost);
}
