const Productos = artifacts.require("Productos");

contract("Productos", async (accounts) => {

	it ("Añadir 2 frutas, 2 animales, 2 verduras...", async() => {

		let instance = await Productos.deployed();
		instance._addProduct("Manzana", "Fruta", 1);
		instance._addProduct("Naranja", "Fruta", 2);
		instance._addProduct("Cerdo", "Animales", 3);
		instance._addProduct("Vaca", "Animales", 4);
		instance._addProduct("Lechuga", "Verduras", 5);
		instance._addProduct("Brocoli", "Verduras", 6);
	
	});

	it ("Buscar por nombre...", async() => {
		let instance = await Productos.deployed();
	
	});

});
