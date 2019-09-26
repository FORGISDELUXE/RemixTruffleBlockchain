function borrarPremio(uint256  _id) public {
        Empleados empleadosContract = Empleados(E);
        require(listPremios[_id]._isValue == 1 
        && (empleadosContract.getClan(empleadosContract.getEmpleadoNumero(msg.sender)) == listPremios[_id]._clan || msg.sender == sudo));
        emit BorrarPremioEvent(msg.sender, empleadosContract.getEmpleadoNumero(msg.sender), _id, listPremios[_id]._clan, block.timestamp);
        uint256 index = listPremios[_id]._indexPremio;
        for (uint i = index; i<premios.length-1; i++){
            premios[i] = premios[i+1];
        }
        delete premios[premios.length-1];
        delete listPremios[_id];
        premios.length--;
    }