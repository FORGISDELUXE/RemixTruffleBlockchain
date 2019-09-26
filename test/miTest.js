const Productos = artifacts.require("Productos");

contract("Productos", async (accounts) => {

it ("Añadir 1 producto", async() => {

	let instance = await Productos.deployed();
	instance._addProduct("Manzana", "Fruta", 1);
});

});
