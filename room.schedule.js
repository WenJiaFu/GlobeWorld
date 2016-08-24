// 房间调度
// -管理世界范围内的所有房间
// -多个房间之间的需求、任务调度

var roomManager = require('room.manager');

var roomSchedule = {
    /** @param {room} **/
    run: function() {
    	//StatCreep();
		for (var name in Game.rooms) {			
			var room = Game.rooms[name];						
			roomManager.init(room);
			roomManager.run(room);
		}
    }
}

module.exports = roomSchedule;