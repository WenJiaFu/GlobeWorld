StructureSpawn.prototype.creepCost = function(parts) {
	if (parts === undefined)
		return 0;

	let cost = 0;
	_.forEach(parts, function(part) {
		cost += BODYPART_COST[part];
	});

	return cost;
};