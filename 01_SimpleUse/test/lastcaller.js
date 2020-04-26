const LastCaller = artifacts.require("../contracts/LastCaller.sol");

contract("LastCaller", async accounts => {
	it ('text clause text', async () => {
		const lastcaller = await LastCaller.new();

		const res = await lastcaller.getLastCaller();
		assert.equal(res.logs[0].event, "LastCallerIs", "Wrong event");
		assert.equal(res.logs[0].args["0"], 0, "Wrong initial last caller");

		const res2 = await lastcaller.getLastCaller();
		assert.equal(res2.logs[0].event, "LastCallerIs", "Wrong event");
		assert.equal(res2.logs[0].args["0"], accounts[0], "Wrong second last caller");

		const res3 = await lastcaller.getLastCaller();
		assert.equal(res.logs[0].event, "LastCallerIs", "Wrong event");
		assert.equal(res3.logs[0].args["0"], res2.logs[0].args["0"], 
			"Wrong third last caller");

	});
});

