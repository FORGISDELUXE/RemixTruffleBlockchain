pragma solidity ^0.5.8;

contract Productos{
    
    struct Producto{
        string nombre;
        string tipo;
        uint256 id;
        uint256 index;
    }
    
    mapping(string => uint256)  nombres;
    mapping(string => uint256) tipos;
    mapping(uint256 => Producto) idProducto;
    mapping(uint256 => uint256) misIndices;
    
    uint256[] ids;
    
    function _addProduct(string memory _nombre, string memory _tipo, uint256 _id) public {
		require(!(_found(_id)));
        uint256 index = ids.push(_id) - 1;
        misIndices[index] = _id;
        
        idProducto[_id] = Producto(_nombre, _tipo, _id, index);
        nombres[_nombre] = _id;
        tipos[_tipo] = _id;
    }
    
    function _locateName (string memory _nombre) public view returns (string memory  nombre, string memory tipo, uint256 id){
		require(_found(nombres[_nombre]));
        nombre = _nombre;
        tipo = idProducto[(nombres[_nombre])].tipo;
        id = nombres[_nombre];
    }
   
    // Tiene que devolver todos los productos dentro del tipo especificado, asi que hay que cambiar la funcion.
    function _locateType (string memory _tipo) public view returns (string memory  nombre, string memory tipo, uint256 id){
		require(_found(tipos[_tipo]));
        nombre = idProducto[(tipos[_tipo])].nombre;
        tipo = _tipo;
        id = tipos[_tipo];
    }
    
    function _locateId (uint256 _id) public view returns (string memory  nombre, string memory tipo, uint256 id){
		require(_found(_id));
        nombre = idProducto[_id].nombre;
        tipo = idProducto[_id].tipo;
        id = _id;
    }
    
    function _deleteProduct(uint256 _id) public {
		require(_found(_id));
        uint256 idx = idProducto[_id].index;
        
        for(uint256 i = idx; i<ids.length-1; i++){
            ids[i] = ids[i+1];
            idProducto[(misIndices[i])].index --;
        }
        
        delete ids[ids.length-1];
        
        delete nombres[idProducto[_id].nombre];
        delete tipos[idProducto[_id].tipo];
        delete idProducto[_id];
        delete misIndices[idx];
        
    }

	function _found(uint256 _id) private view returns (bool){
		if(_id < 0)
			return true;

		bool gotit = false;
		for(uint256 i = 0; i < ids.length && !gotit; i++){
			if(ids[i] == _id)
				gotit = true;
		}
		return gotit;
	}
    
}

