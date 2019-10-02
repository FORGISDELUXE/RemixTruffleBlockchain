/// @title Tienda de Productos
/// @author Jorge Sol
/// @notice Este contrato no hará crecer tu negocio de productos.
/// @dev Working On

pragma solidity ^0.5.8; 
contract Productos{
    
    struct Producto{
        string nombre;
        string tipo;
        uint256 id;
    }
    
    mapping(string => uint256)  nombres;
    mapping(string => uint256) tipos;
    mapping(uint256 => Producto) idProducto;
    mapping(uint256 => uint256) misIndices; // Asignamos a cada id del producto el indice en el que se encuentra en el array + 1: id -> index
											// la razon del + 1 es debido a que al verificar en el modifier si existe o no un producto, podemos compararlo con 0
    
    uint256[] ids;

	// Con este modifier verifico si un producto existe o no existe.
	/// @param _id es el id del producto que quieres buscar
	/// @return un error o nada
	modifier _found (uint256 _id){
		require(misIndices[_id] != 0);
		_;
	}
    
	// Añadimos un producto si y solo si este no exciste ya (solo verificamos id, puesto que puedes tener productos con el mismo nombre y tipo)
	/// @param _nombre y demas parametros para añadir un nuevo producto, todos son obligatorios
    function _addProduct(string memory _nombre, string memory _tipo, uint256 _id) public {
		require(misIndices[_id] == 0);
        uint256 index = ids.push(_id);
        misIndices[_id] = index;
        
        idProducto[_id] = Producto(_nombre, _tipo, _id);
        nombres[_nombre] = _id;
        tipos[_tipo] = _id;
    }
    
	// Buscamos por nombre
	/// @param _nombre es el nombre que va a buscar
	/// @return nombre, tipo e id del último parametro añadido con ese nombre, si hay 3 productos con el mismo nombre, solo devolverá el útlimo
    function _locateName (string memory _nombre) public view _found(nombres[_nombre]) returns (string memory  nombre, string memory tipo, uint256 id){
        nombre = _nombre;
        tipo = idProducto[(nombres[_nombre])].tipo;
        id = nombres[_nombre];
    }
   
	// Buscamos por tipo
    // Tiene que devolver todos los productos dentro del tipo especificado, asi que tengo que seguir trabajando sobre esta funcion, por ahora
	// devuelve el ultimo tipo añadido.
	/// @param _tipo es el tipo que va a buscar
	/// @return nombre, tipo e id del último parametro añadido con ese nombre, si hay 3 productos con el mismo nombre, solo devolverá el útlimo
    function _locateType (string memory _tipo) public view _found(tipos[_tipo]) returns (string memory  nombre, string memory tipo, uint256 id){
        nombre = idProducto[(tipos[_tipo])].nombre;
        tipo = _tipo;
        id = tipos[_tipo];
    }
    
	// Buscamos por id
	/// @param _id es el id que va a buscar
	/// @return nombre, tipo e id del último parametro añadido con ese nombre, si hay 3 productos con el mismo nombre, solo devolverá el útlimo
    function _locateId (uint256 _id) public view _found(_id) returns (string memory  nombre, string memory tipo, uint256 id){
        nombre = idProducto[_id].nombre;
        tipo = idProducto[_id].tipo;
        id = _id;
    }
    
	// Borramos un elemento dado su id, basicamente se mueve el elemento siguiente a la posición del elemento que queremos eliminar,
	// luego reasiganmos en el mapping misIndices[] al id su nuevo indice, y se borran los datos del array y de los mappings.
	/// @param _id es el id que va borrar
    function _deleteProduct(uint256 _id) public _found(_id) {
        uint256 idx = misIndices[_id] - 1;
        
        for(uint256 i = idx; i<ids.length-1; i++){
            ids[i] = ids[i+1];
            misIndices[ids[i]] = i + 1;
        }
        
        delete ids[ids.length-1];
        
        delete nombres[idProducto[_id].nombre];
        delete tipos[idProducto[_id].tipo];
        delete idProducto[_id];
        delete misIndices[idx + 1];
        
    }

}

