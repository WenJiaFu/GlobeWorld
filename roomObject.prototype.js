// **
// 减少Source可分配数
// **
RoomObject.prototype.ReduceSourceAssigned = function() {
	var CurAllowedAssigned = this.room.memory.Sources[this.id].allowedAssigned;
	var CollectableNum = this.room.memory.Sources[this.id].CollectableNum;
    this.room.memory.Sources[this.id].allowedAssigned = _.max([CollectableNum, --CurAllowedAssigned]);
    console.log("source[" + this.id + "] reduce allowed assigned: " + this.room.memory.Sources[this.id].allowedAssigned);
    return CurAllowedAssigned;
};

// **
// 增加Source可分配数
// **
RoomObject.prototype.IncreaseSourceAssigned = function() {
	var CurAllowedAssigned = this.room.memory.Sources[this.id].allowedAssigned;
    this.room.memory.Sources[this.id].allowedAssigned = _.min([8, ++CurAllowedAssigned]);
    console.log("source[" + this.id + "] increase allowed assigned: " + this.room.memory.Sources[this.id].allowedAssigned);
    return CurAllowedAssigned;
};

// 控制器原型
StructureController.prototype.pathReached = false;

var roomObjectPrototype = {
    
}

module.exports = roomObjectPrototype;