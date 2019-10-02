const Productos = artifacts.require("Productos");

contract("Productos", async (accounts) => {

it ("TEST 1: Añadir 6 producto.", async() => {

	let exec = await Productos.deployed();
	await exec._addProduct.sendTransaction("Manzana", "Fruta", 1);
	await exec._addProduct.sendTransaction("Pera", "Fruta", 2);
	await exec._addProduct.sendTransaction("Leche", "Lacteos", 3);
	await exec._addProduct.sendTransaction("Yogurt", "Lacteos", 4);
	await exec._addProduct.sendTransaction("Vaca", "Animal", 5);
	await exec._addProduct.sendTransaction("Cerdo", "Animal", 6);

});

it("TEST 2: Recuperar 3 producto por el nombre.", async() => {

	let exec = await Productos.deployed();
	let frutas = await exec._locateName.call("Manzana");
	assert.equal(frutas[0], "Manzana"); 
	assert.equal(frutas[1], "Fruta");
	assert.equal(frutas[2], 1); 

	let lacteos = await exec._locateName.call("Leche");
	assert.equal(lacteos[0], "Leche"); 
	assert.equal(lacteos[1], "Lacteos");
	assert.equal(lacteos[2], 3); 

	let animales = await exec._locateName.call("Vaca");
	assert.equal(animales[0], "Vaca"); 
	assert.equal(animales[1], "Animal");
	assert.equal(animales[2], 5); 

});

// ESTE TEST ES ERRONEO, NO POR EL TEST EN SI SINO POR QUE _locatetype NO DEVUELVE LO QUE QUIERO.

it("TEST 3: Recuperar 3 producto por el tipo.", async() => {

	let exec = await Productos.deployed();
	let frutas = await exec._locateType.call("Fruta");
	assert.equal(frutas[0], "Pera"); 
	assert.equal(frutas[1], "Fruta");
	assert.equal(frutas[2], 2); 

	let lacteos = await exec._locateType.call("Lacteos");
	assert.equal(lacteos[0], "Yogurt"); 
	assert.equal(lacteos[1], "Lacteos");
	assert.equal(lacteos[2], 4); 

	let animales = await exec._locateType.call("Animal");
	assert.equal(animales[0], "Cerdo"); 
	assert.equal(animales[1], "Animal");
	assert.equal(animales[2], 6); 

});

it("TEST 4: Recuperar 3 producto por el id.", async() => {

	let exec = await Productos.deployed();
	let frutas = await exec._locateId.call(1);
	assert.equal(frutas[0], "Manzana"); 
	assert.equal(frutas[1], "Fruta");
	assert.equal(frutas[2], 1); 

	let lacteos = await exec._locateId.call(3);
	assert.equal(lacteos[0], "Leche"); 
	assert.equal(lacteos[1], "Lacteos");
	assert.equal(lacteos[2], 3); 

	let animales = await exec._locateId.call(5);
	assert.equal(animales[0], "Vaca"); 
	assert.equal(animales[1], "Animal");
	assert.equal(animales[2], 5); 

});

it("TEST 5: Añadir a alguien que ya existe.", async() => {

	let exec = await Productos.deployed();
	exec._addProduct.sendTransaction("Manzana", "Fruta", 1).then((response)=>{console.log(responde);},
	(error)=>{
		assert(error.message.indexOf('revert') >= 0, "Este producto ya existe.")
	});

})

it("TEST 6: Buscar a alguien que no existe.", async() => {


	let exec = await Productos.deployed();
	exec._locateName.call("Cactus").then((response)=>{console.log(responde);},
	(error)=>{
		assert(error.message.indexOf('revert') >= 0, "Este producto no existe.")
	});
	

})

it("TEST 7: Borrar un dato." , async() => {

	let exec = await Productos.deployed();
	exec._deleteProduct.call(1).then((response)=>{console.log(responde);},
	(error)=>{
		assert(error.message.indexOf('revert') >= 0, "No se ha borrado correctamente.")
	});	

});


});
