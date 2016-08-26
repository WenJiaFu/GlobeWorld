// 采矿(harvester)
Game.spawns['Spawn1'].createCreep( [WORK,WORK,CARRY,MOVE], undefined, { role: 'harvester', workRoom: 'sim'});
Game.spawns['Spawn1'].createCreep( [WORK,WORK,CARRY,MOVE], undefined, { role: 'harvester'} );
Game.spawns['Spawn1'].createCreep( [MOVE], "mover");

// 升级人(upgrader)
Game.spawns['Spawn1'].createCreep( [WORK,CARRY,CARRY,CARRY,MOVE], 'upgrader1', { role: 'upgrader', workplace: 'sim' } );

// 建造者(builder)
Game.spawns['Spawn1'].createCreep([WORK, CARRY, CARRY, MOVE], 'builder1', { role: 'builder', workplace: 'sim' });

// 自动铺路
// #Room.prototype.PaveRoad
//Game.rooms.sim.PaveRoad();

// var jsonStr = JSON.stringify(source);
// console.log(jsonStr);