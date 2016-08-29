// 采矿(harvester)
Game.spawns['Spawn1'].createCreep( [WORK,CARRY,MOVE], undefined, { role: 'harvester', workRoom: 'E16S41', state: 'init', preAllocate: '577b93a60f9d51615fa48792'});
Game.spawns['Spawn1'].createCreep( [WORK,WORK,MOVE], undefined, { role: 'harvester.fixed', workRoom: 'sim', state: 'init', preAllocate: '0f24b9d26ef7b6314ca609f0'});
Game.spawns['Spawn1'].createCreep( [CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE], undefined, { role: 'collect', workRoom: 'E16S41', state: 'recycle'});

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