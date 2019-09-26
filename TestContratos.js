const Empleados = artifacts.require("Empleados");
const Tokies = artifacts.require("Tokie");
const Premios = artifacts.require("Premios");
const truffleAssert = require("truffle-assertions");


contract("TestContratos",async (accounts) => {

/* Por dotar de mayor comprension durante todos los tests:
accounts[1] es la cuenta admin y owner de los smart contracts
accounts[2] es la cuenta personal de alberto gomez, numEmpleado 1
accounts[3] es la cuenta administradora de marketing (clan 1) de alberto gomez
accounts[4] es la cuenta personal de maria salgado, numEmpleado2
accounts[5] la  cuenta administradora de rrhh (clan 2) de maria salgado
accounts[6] es la cuenta personal de javi jimenez, numEmpleado3
accounts[7] la cuenta administradora de javi jimenez, numEmpleado3
accounts[8] es la cuenta personal de cesar cercadillo, numEmpleado 4
accounts[9] es la cuenta administradora de cesar cercadillo, numEmpleado 4
*/


let admin = accounts[1];
let alberto_personal = accounts[2];
let alberto_clan = accounts[3];
let maria_personal = accounts[4];
let maria_clan = accounts[5];
let javier_personal = accounts[6];
let javier_clan = accounts[7];
let cesar_personal = accounts[8];
let cesar_clan = accounts[9];
let alberto_personal2;
/* SI LAB
// Crear cuentas
let admin = admin;
let alberto_personal = web3.personal.newAccount("");
let alberto_clan = web3.personal.newAccount("");
let maria_personal = web3.personal.newAccount("");
let maria_clan = web3.personal.newAccount("");
let javier_personal = web3.personal.newAccount("");
let javier_clan = web3.personal.newAccount("");
let cesar_personal = web3.personal.newAccount("");
let cesar_clan = web3.personal.newAccount("");
// Desbloquearlas todas

web3.personal.unlockAccount(admin, "", 3600);
web3.personal.unlockAccount(alberto_personal, "", 3600);
web3.personal.unlockAccount(alberto_clan, "", 3600);
web3.personal.unlockAccount(maria_personal, "", 3600);
web3.personal.unlockAccount(maria_clan, "", 3600);
web3.personal.unlockAccount(javier_personal, "", 3600);
web3.personal.unlockAccount(javier_clan, "", 3600);
web3.personal.unlockAccount(cesar_personal, "", 3600);
web3.personal.unlockAccount(cesar_clan, "", 3600);
//Introducir gas
var amount_to_send_eth = web3.fromWei(eth.getBalance(eth.accounts[0]), "ether");
var amount_to_send_wei = amount_to_send_eth *1000000000000000000;
var transactionFee = web3.eth.gasPrice * 21001;
var total_amount_to_send_wei = (transactionFee + amount_to_send_wei) / 10;
eth.sendTransaction({from:admin, to:alberto_personal, value: total_amount_to_send_wei });
*/

        it("Test1: Despliegue correcto y la cuenta administradora es la owner", async () => {
          let contract = await Empleados.deployed();
          console.log("Address superadmin:", admin);
          let response = await contract.getCuentaAdmin.call({from:admin});
          assert.equal(response, admin);
        });

        it("Test2: El empleado 1 se registra como empleado y se obtienen sus datos", async () => {
          let contract = await Empleados.deployed();
          let llamada = await contract.registrarmeComoEmpleado(1, "alberto", "gomez", {from:alberto_personal});
          let response = await contract.getEmpleado.call(1, {from:admin});
          let stringAccount = JSON.stringify(alberto_personal);
          assert.equal(response[0], stringAccount.replace(/\"/g,''));
          assert.equal(response[1], "alberto");
          assert.equal(response[2], "gomez");
	  truffleAssert.eventEmitted(llamada, "RegistrarmeComoEmpleadoEvent", (evento) =>{
          	return evento._name == response[1] && evento._surname == response[2] && evento._fromNumberID == 1 && evento._from == response[0];
          })
        });
        it("Test3: getEmpleadoNumero", async () => {
          let contract = await Empleados.deployed();
          let numero = await contract.getEmpleadoNumero.call(alberto_personal, {from:admin});
          assert.equal(numero.valueOf(), 1);
        });

        it("Test4-A: registrar al empleado 1 como administrador del clan marketing (1) desde la cuenta del empleado 1", async () => {
          let contract = await Empleados.deployed();
          let response = await contract.isClan.call(1, {from:admin});
          assert.equal(response, false);
          let llamada = await contract.solicitarRegistrarmeEnClan(1, 1, {from:alberto_clan});
          //await contract.aprobarRegistroEnClan.sendTransaction(1, 1, {from:alberto_clan});
            try{
                await contract.aprobarRegistroEnClan.sendTransaction(1, 1, {from:alberto_clan});
               console.error("\tNo debería pasar el test (_to)");
            } catch(error){
            }
            response = await contract.isClan.call(1, {from:admin});
            assert.equal(response, false);
        });

        it("Test4: registrar al empleado 1 como administrador del clan marketing (1) desde la cuenta admin", async () => {
          let contract = await Empleados.deployed();
          let response = await contract.isClan.call(1, {from:admin});
          assert.equal(response, false);
          //let llamada = await contract.solicitarRegistrarmeEnClan(1, 1, {from:alberto_clan});
           let llamada = await contract.aprobarRegistroEnClan(1, 1, {from:admin});
	         truffleAssert.eventEmitted(llamada, "AprobarRegistroEnClanEvent", (evento) =>{
          	return evento._employeeID == 1 && evento._clan == 1;
          })
          response = await contract.isClan.call(1, {from:admin});
          assert.equal(response, true);
        });

        it("Test5: isClan false", async () => {
          let contract = await Empleados.deployed();
          let response = await contract.isClan.call(2, {from:admin});
          assert.equal(response, false);
        });

        it("Test6: isClan true", async () => {
          let contract = await Empleados.deployed();
          let response = await contract.isClan.call(1, {from:admin});
          assert.equal(response, true);
        });

        it("Test7: desde la cuenta administradora de marketing de alberto, registrar al empleado 2 con la cuenta 3", async () => {
          let contract = await Empleados.deployed();
          let llamada = await contract.registrarmeComoEmpleado(2, "maria", "salgado", {from:maria_personal});
          let response = await contract.getEmpleado.call(2, {from:alberto_clan});
          let stringAccount = JSON.stringify(maria_personal);
          assert.equal(response[0], stringAccount.replace(/\"/g,''));
          assert.equal(response[1], "maria");
          assert.equal(response[2], "salgado");
	        truffleAssert.eventEmitted(llamada, "RegistrarmeComoEmpleadoEvent", (evento) =>{
          	return evento._name == response[1] && evento._surname == response[2] && evento._fromNumberID == 2 && evento._from == response[0];
          })
        });

        it("Test8: listar empleados", async () => {
          let contract = await Empleados.deployed();
          let lista = await contract.listEmpleadosIds.call({from:admin});
          assert.equal(lista.length, 2);
        });

        it("Test9: desde la cuenta admin, se registra como clan de la cuenta al empleado 2 (cuenta 4)", async () => {
          let contract = await Empleados.deployed();
          let llamada = await contract.solicitarRegistrarmeEnClan(2, 2, {from:maria_clan});
          await contract.aprobarRegistroEnClan.sendTransaction(2, 1, {from:admin});
	  truffleAssert.eventEmitted(llamada, "SolicitarRegistroEnClanEvent", (evento) =>{
          	return evento._employeeID == 2 && evento._clan == 2;
          })
        });

        it("Test10: El empleado 3 se registra como empleado y se obtiene su nombre: javi jimenez", async () => {
          let contract = await Empleados.deployed();
          let llamada = await contract.registrarmeComoEmpleado(3, "javi", "jimenez", {from:javier_personal});
          let response = await contract.getEmpleado.call(3, {from:admin});
          let stringAccount = JSON.stringify(javier_personal);
          assert.equal(response[0], stringAccount.replace(/\"/g,''));
          assert.equal(response[1], "javi");
          assert.equal(response[2], "jimenez");
	  truffleAssert.eventEmitted(llamada, "RegistrarmeComoEmpleadoEvent", (evento) =>{
          	return evento._name == response[1] && evento._surname == response[2] && evento._fromNumberID == 3 && evento._from == response[0];
          })
        });

        it("Test11: Javi Jimenez debe tener 0 tokies", async () => {
          let contract = await Empleados.deployed();
          let tokies = await Tokies.deployed();
          let balance = await tokies.balanceOf.call(javier_personal, {from:admin});
          assert.equal(balance, 0);
        });

        it("Test12: REGISTRAR VARIOS LOGROS", async () => {
              let logros = await Empleados.deployed();
              let response1 = await logros.listLogrosIds.call({from:admin});
              assert.equal(response1.length, 0);
              let llamada = await logros.registrarLogro(100, 10, "AMOR", "con amor desde marketing", {from:alberto_clan});
              await logros.registrarLogro.sendTransaction(101, 100, "Tweet Iecisa", "Tweetear con el hastag Iecisa", {from:alberto_clan});
              await logros.registrarLogro.sendTransaction(102, 20, "AMOR++", "con amor desde rrhh", {from:alberto_clan});
              await logros.registrarLogro.sendTransaction(112, 20, "AMOR++", "con amor desde rrhh", {from:maria_clan});
              await logros.registrarLogro.sendTransaction(103, 0, "Test", "Test", {from:alberto_clan});
              await logros.registrarLogro.sendTransaction(104, 120, "Cascos", "musico", {from:alberto_clan});
              await logros.registrarLogro.sendTransaction(105, 5, "Toalla", "playero", {from:alberto_clan});
              await logros.registrarLogro.sendTransaction(106, 5.5, "Microfono", "gamer", {from:alberto_clan});
              await logros.registrarLogro.sendTransaction(107, 1, "a", "a", {from:alberto_clan});
              await logros.registrarLogro.sendTransaction(108, 2, "b", "b", {from:alberto_clan});
              await logros.registrarLogro.sendTransaction(109, 3, "c", "c", {from:alberto_clan});
              let llamada2 = await logros.registrarLogro(110, 4, "d", "d", {from:alberto_clan});
              await logros.registrarLogro.sendTransaction(111, 6, "e", "e", {from:alberto_clan});
	      truffleAssert.eventEmitted(llamada, "RegistrarLogroEvent", (evento) =>{
          	return evento._name == "AMOR" && evento._id == 100 && evento._clan == 1 && evento._valor == 10;
              })
	      truffleAssert.eventEmitted(llamada2, "RegistrarLogroEvent", (evento) =>{
          	return evento._name == "d" && evento._id == 110 && evento._clan == 1 && evento._valor == 4;
              })
              let logrosIds = await logros.listLogrosIds.call({from:admin});
              assert.equal(logrosIds.length, 13);
            });

        it("Test13: Alberto de MKT asigna 100 tokies a Javi Jimenez. ", async () => {
          let contract = await Empleados.deployed();
          let cont = await contract.listTokiesRequestIds.call({from:admin});
          assert.equal(cont.length, 0);
          let llamada = await contract.emitirTokies(3, 101, {from:alberto_clan});
          let cont2 = await contract.listTokiesRequestIds.call({from:admin});
          assert.equal(cont2.length, 1);
	        truffleAssert.eventEmitted(llamada, "EmitirTokiesEvent", (evento) =>{
          	return evento._toNumberID == 3 && evento._idLogro == 101;
          })
        });

        it("Test14-A: El mismo empleado que solicito la emision de tokies, intenta aprobarlo y no se permite", async () => {
          let contract = await Empleados.deployed();
          let tokies = await Tokies.deployed();
          let balance = await tokies.balanceOf.call(javier_personal, {from:admin});
          assert.equal(balance, 0);
          let listTokiesRequestIds = await contract.listTokiesRequestIds.call({from:admin});
          try{
            let llamada = await contract.aprobarEmitirTokies(listTokiesRequestIds[0],1, "esto no deberia salir", {from:alberto_clan});
             console.error("\tNo debería pasar el test (_to)");
          } catch(error){
          }
          balance = await tokies.balanceOf.call(javier_personal, {from:admin});
          assert.equal(balance, 0);
        });

        it("Test14-B: Un empleado de otro clan aprueba esa emision de tokies", async () => {
          let contract = await Empleados.deployed();
          let tokies = await Tokies.deployed();
          let balance = await tokies.balanceOf.call(javier_personal, {from:admin});
          assert.equal(balance, 0);
          let listTokiesRequestIds = await contract.listTokiesRequestIds.call({from:admin});
          let llamada = await contract.aprobarEmitirTokies(listTokiesRequestIds[0],1, "esto no deberia salir", {from:maria_clan});
	        truffleAssert.eventEmitted(llamada, "AprobarEmitirTokiesEvent", (evento) =>{
          	return evento._idRequest == listTokiesRequestIds[0].valueOf() && evento._reason == "" && evento._toNumberID ==3 && evento._title == "Tweet Iecisa";
          })
          balance = await tokies.balanceOf.call(javier_personal, {from:admin});
          assert.equal(balance, 100);
        });

        it("Test15: getClan", async () => {
          let contract = await Empleados.deployed();
          let clan = await contract.getClan.call(1, {from:admin});
          assert.equal(clan.valueOf(), 1);
          let clan2 = await contract.getClan.call(2, {from:admin});
          assert.equal(clan2.valueOf(), 2);
        });

        it("Test16: Javi Jimenez ya dispone de los 100 tokies asignados", async () => {
          let contract = await Empleados.deployed();
          let tokies = await Tokies.deployed();
          let balance = await tokies.balanceOf.call(javier_personal, {from:admin});
          assert.equal(balance.valueOf(), 100);
        });

        it("Test17: No hay ninguna asignacion de tokies pendiente", async () => {
          let contract = await Empleados.deployed();
          let cont2 = await contract.listTokiesRequestIds.call({from:admin});
          assert.equal(cont2.length, 0);
        });

        it("Test18: Listar todos los TokiesRequest y acceder a su info", async () => {
          let contract = await Empleados.deployed();
          let llamada = await contract.emitirTokies(3, 100, {from:alberto_clan});
          let llamada2 = await contract.emitirTokies(3, 112, {from:maria_clan});
          let lista = await contract.listTokiesRequestIds.call({from:admin});
          assert.equal(lista.length, 2);
	        truffleAssert.eventEmitted(llamada, "EmitirTokiesEvent", (evento) =>{
          	return evento._toNumberID == 3 && evento._idLogro == 100;
          })
	        truffleAssert.eventEmitted(llamada2, "EmitirTokiesEvent", (evento) =>{
          	return evento._toNumberID == 3 && evento._idLogro == 112;
          })

          let tokiesRequest1 = await contract.getTokieRequest.call(lista[0],{from:admin});
          let tokiesRequest2 = await contract.getTokieRequest.call(lista[1],{from:admin});

          assert.equal(tokiesRequest1[0].valueOf(), lista[0]); //id
          //let stringAccount1 = JSON.stringify(alberto_clan); //from
          assert.equal(tokiesRequest1[1].valueOf(), 1);
          //let stringAccount2 = JSON.stringify(javier_personal); //to
          assert.equal(tokiesRequest1[2].valueOf(), 3);
          assert.equal(tokiesRequest1[3].valueOf(), 2); //_approved
          assert.equal(tokiesRequest1[4], 100);  //_logroID
          // _timestamp
          // _approvedTimestamp

          assert.equal(tokiesRequest2[0].valueOf(), lista[1]); //id
          //let stringAccount3 = JSON.stringify(maria_clan); //from
          assert.equal(tokiesRequest2[1].valueOf(), 2);
          //let stringAccount4 = JSON.stringify(javier_personal); //to
          assert.equal(tokiesRequest2[2].valueOf(), 3);
          assert.equal(tokiesRequest2[3].valueOf(), 2); //_approved
          assert.equal(tokiesRequest2[4], 112);  //_logroID
          // _timestamp
          // _approvedTimestamp
        });

        it("Test19: listar empleados OTRA VEZ!", async () => {
          let contract = await Empleados.deployed();
          let lista = await contract.listEmpleadosIds.call({from:admin});
          assert.equal(lista.length, 3);
        });

        it("Test20: solicitar registro en clan", async () => {
          let contract = await Empleados.deployed();
          let llamada = await contract.solicitarRegistrarmeEnClan(3, 1, {from:javier_clan});
          let lista = await contract.listClanRequestIds.call({from:alberto_clan});
          assert.equal(lista.length, 1);
	  truffleAssert.eventEmitted(llamada, "SolicitarRegistroEnClanEvent", (evento) =>{
          	return evento._employeeID == 3 && evento._clan == 1;
          })
        });

        it("Test21: listar direcciones de ClanRequest y acceder a su dato", async () => {
          let contract = await Empleados.deployed();
          let lista = await contract.listClanRequestIds.call({from:alberto_clan});
          let stringAccount = JSON.stringify(javier_clan);
          //assert.equal(lista[0], stringAccount.replace(/\"/g,''));
          let response = await contract.getClanRequest.call(lista[0],{from:alberto_clan});
          assert.equal(response[0].valueOf(), 1); // clan
          //assert.equal(response[1], timestamp);
          assert.equal(response[2].valueOf(), 2); // status
          assert.equal(response[3], 3); // numEmpleado
        });

        it("Test22: alberto en su cuenta de admin de clan MKT aprueba la solicitud", async () => {
          let contract = await Empleados.deployed();
          let clan = await contract.isClan.call(3,{from:alberto_clan});
          assert.equal(clan.valueOf(), 0);
          let llamada = await contract.aprobarRegistroEnClan(3, 1, {from:alberto_clan});
	  truffleAssert.eventEmitted(llamada, "AprobarRegistroEnClanEvent", (evento) =>{
          	return evento._fromNumberID == 1 && evento._employeeID == 3;
          })
          let lista = await contract.listClanRequestIds.call({from:alberto_clan});
          assert.equal(lista.length, 0);
          let clan2 = await contract.isClan.call(3,{from:alberto_clan});
          assert.equal(clan2.valueOf(), true);
        });

        it("Test23: un nuevo empleado, cesar cercadillo, hace una solicitud y alberto desde su cuenta de MKT deniega la solicitud", async () => {
          let contract = await Empleados.deployed();
          await contract.registrarmeComoEmpleado.sendTransaction(4, "cesar", "cercadillo", {from:cesar_personal});
          let nombre = await contract.getEmpleado.call(4, {from:admin});
          assert.equal(nombre[1], "cesar");
          let lista = await contract.listClanRequestIds.call({from:alberto_clan});
          assert.equal(lista.length, 0);
          await contract.solicitarRegistrarmeEnClan.sendTransaction(4, 1, {from:cesar_personal});
          let lista1 = await contract.listClanRequestIds.call({from:alberto_clan});
          assert.equal(lista1.length, 1);
          let llamada = await contract.aprobarRegistroEnClan(4, 0, {from:admin});
	  truffleAssert.eventEmitted(llamada, "AprobarRegistroEnClanEvent", (evento) =>{
          	return evento._fromNumberID == 0 && evento._employeeID == 4 && evento._approved == 0;
          })
          let lista2 = await contract.listClanRequestIds.call({from:alberto_clan});
          assert.equal(lista2.length, 0);
        });

        it("Test24: getEmpleadoAddress alberto, empleado 1", async () => {
          let contract = await Empleados.deployed();
          let result = await contract.getEmpleadoAddress.call(1,{from:alberto_clan});
          let stringAccount = JSON.stringify(alberto_personal);
          assert.equal(result, stringAccount.replace(/\"/g,''));
        });
/*
        it("Test25: getAdminNumEmpleado alberto, cuenta alberto_clan", async () => {
          let contract = await Empleados.deployed();
          let result = await contract.getAdminNumEmpleado.call(alberto_clan,{from:alberto_clan});
          assert.equal(result, 1);
        });*/

        it("Test26: desde la cuenta administradora de marketing de alberto, registrar un premio", async () => {
          let premios = await Premios.deployed();
          let response1 = await premios.listPremiosIds.call({from:admin});
          assert.equal(response1.length, 0);
          let llamada = await premios.registrarPremio(1, 10, "casquitos", {from:alberto_clan});
	  truffleAssert.eventEmitted(llamada, "RegistrarPremioEvent", (evento) =>{
          	return evento._prizeID == 1 && evento._price == 10;
          })
          let response2 = await premios.listPremiosIds.call({from:admin});
          assert.equal(response2.length, 1);
        });

        it("Test27: listarPremios y acceder a la info con getPremio", async () => {
          let premios = await Premios.deployed();
          let lista = await premios.listPremiosIds.call({from:admin});
          let response2 = await premios.getPremio.call(lista[0],{from:admin});
          assert.equal(response2[0].valueOf(), 10);   //prize
          assert.equal(response2[1].valueOf(), 1);  //clan
          assert.equal(response2[2], "casquitos");  //nombre
          assert.equal(response2[3].valueOf(), 1);  //activo
        });

        it("Test28: Javier Jimenez (empleado 3, javier_personal solicita canjear premio", async () => {
          let premios = await Premios.deployed();
          let listaPremios = await premios.listPremiosIds.call({from:alberto_clan});
          let listaRequests1 = await premios.listPremiosRequests.call({from:alberto_clan});
          assert.equal(listaRequests1.length, 0)
          let llamada = await premios.solicitarCanjearPremio(listaPremios[0], {from:javier_personal});
	  truffleAssert.eventEmitted(llamada, "SolicitarCanjearPremioEvent", (evento) =>{
          	return evento._prizeID == 1 && evento._clan == 1 && evento._employeeID == 3;
          })
          let listaRequests2 = await premios.listPremiosRequests.call({from:alberto_clan});
          assert.equal(listaRequests2.length, 1)
        });

        it("Test29: Javier Jimenez (empleado 3, javier_personal solicita canjear OTRO premio", async () => {
          let premios = await Premios.deployed();
          let listaPremios = await premios.listPremiosIds.call({from:javier_personal});
          let llamada = await premios.solicitarCanjearPremio(listaPremios[0], {from:javier_personal});
          let listaRequests2 = await premios.listPremiosRequests.call({from:alberto_clan});
	  truffleAssert.eventEmitted(llamada, "SolicitarCanjearPremioEvent", (evento) =>{
          	return evento._prizeID == 1 && evento._clan == 1  && evento._employeeID == 3;
          })
          assert.equal(listaRequests2.length, 2)
        });

        it("Test30: Se pueden listar todos los PremiosRequests y acceder a la info de cada uno", async () => {
          let premios = await Premios.deployed();
          let lista = await premios.listPremiosRequests.call({from:admin});

          let request = await premios.getPremioRequest.call(lista[0], {from:admin});
          let stringAccount = JSON.stringify(javier_personal);
          assert.equal(request[0], stringAccount.replace(/\"/g,'')); //_to
          assert.equal(request[1].valueOf(), 3);  //numEmpleado
          assert.equal(request[2].valueOf(), 1);  //_idPremio
          assert.equal(request[3].valueOf(), 1);  //_clan
          assert.equal(request[4].valueOf(), 10);  //_prize
          assert.equal(request[5].valueOf(), 2);  //_approved

          request = await premios.getPremioRequest.call(lista[1], {from:admin});
          stringAccount = JSON.stringify(javier_personal);
          assert.equal(request[0], stringAccount.replace(/\"/g,'')); //_to
          assert.equal(request[1].valueOf(), 3);  //numEmpleado
          assert.equal(request[2].valueOf(), 1);  //_idPremio
          assert.equal(request[3].valueOf(), 1);  //_clan
          assert.equal(request[4].valueOf(), 10);  //_prize
          assert.equal(request[5].valueOf(), 2);  //_approved
        });

        it("Test31: Alberto aprueba el PremioRequest", async () => {
          let premios = await Premios.deployed();
          let lista = await premios.listPremiosRequests.call({from:admin});
	  assert.equal(lista.length, 2);
          let request = await premios.aprobarCanjearPremio(lista[0], "", 1, {from:admin});
          let lista2 = await premios.listPremiosRequests.call({from:admin});
          assert.equal(lista2.length, 1);
	  truffleAssert.eventEmitted(request, "AprobarCanjearPremioEvent", (evento) =>{
          	return evento._prizeID == 1 && evento._clan == 1  && evento._employeeID == 3;
          })
        });
        it("Test32: desde la cuenta administradora de marketing de alberto, eliminar un premio", async () => {
          let premios = await Premios.deployed();
          let response1 = await premios.listPremiosIds.call({from:admin});
          assert.equal(response1.length, 1);
          let request = await premios.borrarPremio(1, {from:alberto_clan});
          let response2 = await premios.listPremiosIds.call({from:admin});
          assert.equal(response2.length, 0);
	  truffleAssert.eventEmitted(request, "BorrarPremioEvent", (evento) =>{
          	return evento._prizeID == 1 && evento._clan == 1 && evento._fromNumberID == 1;
          })
        });
  	it("Test33: listar premios cuando no hay premios y la informacion de un premio inexistente", async () => {
          let premios = await Premios.deployed();
          let lista = await premios.listPremiosIds.call({from:alberto_clan});
          assert.equal(lista.length, 0); // no elements
          let response = await premios.getPremio.call(0, {from:admin});
          assert.equal(response[0].valueOf(), 0);   //prize
          assert.equal(response[1].valueOf(), 0);  //clan
          assert.equal(response[2], "");  //nombre
          assert.equal(response[3].valueOf(), 0);  //activo
  	});

    it("Test34: Javier Jimenez (empleado 3, javier_personal solicita canjear premio no existente", async () => {
      let premios = await Premios.deployed();
      let listaPremios = await premios.listPremiosIds.call({from:alberto_clan});
  	  assert.equal(listaPremios.length, 0);
      let listaRequests1 = await premios.listPremiosRequests.call({from:alberto_clan});
      assert.equal(listaRequests1.length, 1) // 1 prize is pending before this tests
      try {
        let llamada = await premios.solicitarCanjearPremio(0, {from:javier_personal});
  		  console.error("\t Esto no deberia pasar");
  	  } catch(error){

      }
    });

    it("Test35: Un miembro de un clan intenta aprobar un PremioRequest que no existe. No se puede", async () => {
      let premios = await Premios.deployed();
      let lista = await premios.listPremiosRequests.call({from:admin});
      assert.equal(lista.length, 1); // 1 prize is pending before this tests
  	  try{
  		  let request = await premios.aprobarCanjearPremio(20, "", 1, {from:admin}); // id 20 doesnt exist
  		  console.error("\tEsto no deberia funcionar");
  	  }catch(error){
  	  }
    });

    it("Test36:Probar a emitir tokies a un empleado por el logro 103 (clan 1) \n  Aprobar emitir tokies de una request del logro 103 (clan 1) (OJO 0 TOKIES) desde la cuenta de un miembro de otro clan (2)", async () => {
           let contract = await Empleados.deployed();
           let tokies = await Tokies.deployed();

           let toEmpleado = await contract.getEmpleado(3);

           await contract.emitirTokies.sendTransaction(3, 103, {from:alberto_clan});

           let listTokiesRequestIds = await contract.listTokiesRequestIds.call({from:admin});
           assert.equal(listTokiesRequestIds.length, 3)
           let balance1 = await contract.balanceOfEmpleado.call(3, {from:admin});
		       //assert.equal(balance1.valueOf(), 80);

           let req = await contract.getTokieRequest(listTokiesRequestIds[2]);

           // Test sobre el check de los valores
           assert.equal(req[0],listTokiesRequestIds[2].valueOf()); //  uint256 _id
           assert.equal(req[1],1); //  _from
           assert.equal(req[2],3); //  _to
           assert.equal(req[3].valueOf(),2);  // status
           assert.equal(req[4].toString(),103); //  idLogro
           assert.equal(req[5].toString(),""); //  string _motivo_deny

           await contract.aprobarEmitirTokies.sendTransaction(listTokiesRequestIds[2],1,"", {from:maria_clan});

           listTokiesRequestIds = await contract.listTokiesRequestIds.call({from:admin});
           assert.equal(listTokiesRequestIds.length, 2)
           let balance2 = await contract.balanceOfEmpleado.call(3, {from:admin});
           assert.equal(balance2.valueOf(), balance1.valueOf());

           try{ // Test con _to no valido
             await contract.emitirTokies.sendTransaction(99, 100, {from:alberto_clan});
             console.error("\tNo debería pasar el test con empleado no existente, 99");
           } catch(error){
           // funcionamiento esperado. Se espera: "Error: VM Exception while processing transaction: revert No destinatario"
           }
           try{ // Test Enviarse tokies a la misma cuenta
             await contract.emitirTokies.sendTransaction(1,100, {from:alberto_clan});
             console.error("\tNo debería pasar el test (misma cuenta)");
           } catch(error){
           // funcionamiento esperado. Se espera: "Error: VM Exception while processing transaction: revert "Tx mismo usuario"
           }
           // Test Enviar con un parametro _esCuentaPersonal no valido || Los valores "true", 1, son validos
           // -> Para parametros no validos se emite por defecto a las cuentas de empleado
         })

         it("Test37: PROBAR APROBAR EMITIR TOKIES", async () => {
           let contract = await Empleados.deployed();
           let tokies = await Tokies.deployed();

           let balance1 = await contract.balanceOfEmpleado.call(3, {from:admin});
           // --- TEST sobre 'n'
           // sumamos 120 tokies a la cuenta 3
           let listTokiesRequestIds = await contract.listTokiesRequestIds.call({from:admin});
           assert.equal(listTokiesRequestIds.length, 2)
           await contract.emitirTokies.sendTransaction(3, 104, {from:alberto_clan});
           listTokiesRequestIds = await contract.listTokiesRequestIds.call({from:admin});
           assert.equal(listTokiesRequestIds.length, 3) // check aumenta la lista de request

           await contract.aprobarEmitirTokies.sendTransaction(listTokiesRequestIds[2],1,"", {from:maria_clan});
           let balance2 = await contract.balanceOfEmpleado.call(3, {from:admin});
           let test = parseFloat(balance1.valueOf())+parseFloat(120);
           assert.equal(balance2, test);

           // sumamos 0 tokies a la cuenta 3
           await contract.emitirTokies.sendTransaction(3, 103, {from:alberto_clan});
           listTokiesRequestIds = await contract.listTokiesRequestIds.call({from:admin})
           await contract.aprobarEmitirTokies.sendTransaction(listTokiesRequestIds[2],1,"", {from:maria_clan});
           let balance3 = await contract.balanceOfEmpleado.call(3, {from:admin});
           assert.equal(balance3.valueOf(), balance2.valueOf());

           // sumamos 5.5 tokies a la cuenta 3, a todos los efectos, 5
           await contract.emitirTokies.sendTransaction(3, 106, {from:alberto_clan});
           listTokiesRequestIds = await contract.listTokiesRequestIds.call({from:admin})
           await contract.aprobarEmitirTokies.sendTransaction(listTokiesRequestIds[2],1,"", {from:maria_clan});
           let balance4 = await contract.balanceOfEmpleado.call(3, {from:admin});
           test = parseFloat(balance3.valueOf())+parseFloat(5);
           assert.equal(balance4, test);

           // sumamos 5 en char tokies a la cuenta 3
           await contract.emitirTokies.sendTransaction(3, 105, {from:alberto_clan});
           listTokiesRequestIds = await contract.listTokiesRequestIds.call({from:admin})
           await contract.aprobarEmitirTokies.sendTransaction(listTokiesRequestIds[2],1,"", {from:maria_clan});
           let balance5 = await contract.balanceOfEmpleado.call(3, {from:admin});
           test = parseFloat(balance4.valueOf())+parseFloat(5);
           assert.equal(balance5.valueOf(), test);

          })

          it("Test38: PROBAR LISTAR PETICIONES DE TOKIES Y ACCEDER AL DETALLE", async () => {
            let contract = await Empleados.deployed();
            let tokies = await Tokies.deployed();

            let listTokiesRequestIds = await contract.listTokiesRequestIds.call({from:admin});
            let req = await contract.getTokieRequest(listTokiesRequestIds[0]);

            // Test sobre el check de los valores
            assert.equal(req[0], listTokiesRequestIds[0].valueOf()); //  uint256 _id
            assert.equal(req[1], 1); // _from
            assert.equal(req[2], 3); // _to
            assert.equal(req[3].valueOf(),2);  // uint8 _approved
            assert.equal(req[4].toString(),100); //  string _motivo_emit
            assert.equal(req[5].toString(),""); //  string _motivo_deny

          })

          it("Test39: PROBAR CONSULTAR SALDO DE UN EMPLEADO", async () => {
            let contract = await Empleados.deployed();
            let tokies = await Tokies.deployed();
            // --- TEST sobre 'n'
            // sumamos 120 tokies a la cuenta 3
            let listTokiesRequestIds = await contract.listTokiesRequestIds.call({from:admin})
            let lLenghtOld = listTokiesRequestIds.length;
            await contract.emitirTokies.sendTransaction(3, 104, {from:alberto_clan});
            listTokiesRequestIds = await contract.listTokiesRequestIds.call({from:admin})
            let lLenghtNew = listTokiesRequestIds.length;

            assert.equal(lLenghtOld+1,lLenghtNew); // check aumenta la lista de request;

            await contract.aprobarEmitirTokies.sendTransaction(listTokiesRequestIds[2],1,"", {from:maria_clan});
            let balance = await contract.balanceOfEmpleado.call(3, {from:admin})

            // sumamos 0 tokies a la cuenta 3
            await contract.emitirTokies.sendTransaction(3, 103, {from:alberto_clan});
            listTokiesRequestIds = await contract.listTokiesRequestIds.call({from:admin})
            await contract.aprobarEmitirTokies.sendTransaction(listTokiesRequestIds[2],1,"", {from:maria_clan});
            let balance1 = await contract.balanceOfEmpleado.call(3, {from:admin})
            assert.equal(balance1.valueOf(), balance.valueOf());

            // sumamos 5.5 tokies a la cuenta 3
            await contract.emitirTokies.sendTransaction(3, 106, {from:alberto_clan});
            listTokiesRequestIds = await contract.listTokiesRequestIds.call({from:admin})
            await contract.aprobarEmitirTokies.sendTransaction(listTokiesRequestIds[2],1,"", {from:maria_clan});
            let balance2 = await contract.balanceOfEmpleado.call(3, {from:admin})
            let test = parseFloat(balance1.valueOf())+parseFloat(5);
            assert.equal(test, balance2.valueOf());

            // sumamos 5 en char tokies a la cuenta 3
            await contract.emitirTokies.sendTransaction(3, 105, {from:alberto_clan});
            listTokiesRequestIds = await contract.listTokiesRequestIds.call({from:admin})
            await contract.aprobarEmitirTokies.sendTransaction(listTokiesRequestIds[2],1,"", {from:maria_clan});
            let balance3 = await contract.balanceOfEmpleado.call(3, {from:admin})
            test = parseFloat(balance2.valueOf())+parseFloat(5);
            assert.equal(test, balance3.valueOf());

            // Probamos que no se emite a la cuenta de clan de javier aunque se intente
            await contract.emitirTokies.sendTransaction(3, 101, {from:alberto_clan});
            listTokiesRequestIds = await contract.listTokiesRequestIds.call({from:admin})
            await contract.aprobarEmitirTokies.sendTransaction(listTokiesRequestIds[2],1,"", {from:maria_clan});
            let balance4 = await contract.balanceOfEmpleado.call(3, {from:admin})
            test = parseFloat(balance3.valueOf())+parseFloat(100);
            assert.equal(balance4.valueOf(), test);
            let balanceCuentaClanEmpleado = await tokies.balanceOf.call(javier_clan, {from:admin})
            assert.equal(balanceCuentaClanEmpleado.valueOf(), 0);

            // sin motivo  EXPECTED: -
            await contract.emitirTokies.sendTransaction(3, 105, {from:alberto_clan});
            listTokiesRequestIds = await contract.listTokiesRequestIds.call({from:admin})
          })


          it("Test40: PROBAR DENEGAR EMITIR TOKIES", async () => {
            let contract = await Empleados.deployed();
            let tokies = await Tokies.deployed();

            // Creamos 3 peticiones mas
            await contract.emitirTokies.sendTransaction(3, 107, {from:alberto_clan});
            await contract.emitirTokies.sendTransaction(3, 108, {from:alberto_clan});
            await contract.emitirTokies.sendTransaction(3, 109, {from:alberto_clan});
            await contract.emitirTokies.sendTransaction(3, 110, {from:alberto_clan});
            await contract.emitirTokies.sendTransaction(3, 105, {from:alberto_clan});
            await contract.emitirTokies.sendTransaction(3, 111, {from:alberto_clan});

            let listTokiesRequestIds = await contract.listTokiesRequestIds.call({from:admin});
            let oldLength = listTokiesRequestIds.length;
            let targetEliminar = listTokiesRequestIds[4]; // 0 1 2 3 4
            let llamada = await contract.aprobarEmitirTokies(targetEliminar, 0, "Test deny motivo",{from:maria_clan});
            listTokiesRequestIds = await contract.listTokiesRequestIds.call({from:admin});
	    truffleAssert.eventEmitted(llamada, "AprobarEmitirTokiesEvent", (evento) =>{
          	return evento._fromNumberID == 2 && evento._reason == "Test deny motivo";
            })
            newLength = listTokiesRequestIds.length;
            // comprovamos que la peticion se ha borrado con la longitud de la lista
            assert.equal(oldLength.valueOf()-1, newLength.valueOf());
            //vaciamos la lista:
             for (var i = listTokiesRequestIds.length-1; i >= 0; i--) {
               if (i!=1){await contract.aprobarEmitirTokies(listTokiesRequestIds[i],0, "Test deny motivo",{from:admin});}
               else {await contract.aprobarEmitirTokies(listTokiesRequestIds[i],0, "Test deny motivo",{from:admin});}
             }

             listTokiesRequestIds = await contract.listTokiesRequestIds.call({from:admin});
             newLength = listTokiesRequestIds.length;
             assert.equal(newLength.valueOf(),0);
          })

           it("Test41: PROBAR CREAR OTRO USUARIO CON LA MISMA CUENTA", async () => {
             let contract = await Empleados.deployed();
	    try{
		 let llamada= await contract.registrarmeComoEmpleado(2, "Roberto", "garcia", {from:alberto_personal});
	    }catch(e){}
   	  })
          it("Test42: Registrar empleado en una cuenta ya en uso", async () => {
          let contract = await Empleados.deployed();
          //await web3.eth.personal.unlockAccount(admin, "");
          try{
          await contract.registrarmeComoEmpleado.sendTransaction(99, "alberto", "gomez", {from:alberto_personal});
             console.error("\tNo debería pasar el test (_to)");
          } catch(error){
          // funcionamiento esperado. Se espera: "Error: VM Exception while processing transaction: revert Esta cuenta ya pertenece a un empleado"
          }
          });

          it("Test43: PROBAR DENEGAR CANJEAR PREMIO", async () => {
          let premios = await Premios.deployed();
          let contract = await Empleados.deployed();

          // Registramos 3 premios || Lista premios = 1,2,3
          await premios.registrarPremio.sendTransaction(1, 10, "Premio 1", {from:alberto_clan});
          await premios.registrarPremio.sendTransaction(2, 20, "Premio 2",{from:alberto_clan});
          await premios.registrarPremio.sendTransaction(3, 30, "Premio 3",{from:alberto_clan});

          // Creamos 3 peticiones mas
          await premios.solicitarCanjearPremio.sendTransaction( 1, {from:javier_personal});
          await premios.solicitarCanjearPremio.sendTransaction( 2, {from:javier_personal});
          await premios.solicitarCanjearPremio.sendTransaction( 3, {from:javier_personal});

          let listaRequests = await premios.listPremiosRequests({from:alberto_clan});
          let oldLength = listaRequests.length;
          let targetEliminar = listaRequests[2]; // 0 1 2
          let llamada = await premios.aprobarCanjearPremio(targetEliminar, "Test deny motivo", 0,{from:maria_clan});
	  truffleAssert.eventEmitted(llamada, "AprobarCanjearPremioEvent", (evento) =>{
          	return evento._prizeID == 2 && evento._clan == 1 && evento._employeeID == 3 && evento._approve == 0;
          })
          listaRequests = await premios.listPremiosRequests({from:alberto_clan});
          let newLength = listaRequests.length;
          // comprovamos que la peticion se ha borrado con la longitud de la lista
          assert.equal(oldLength.valueOf()-1, newLength.valueOf());

          newReq = await premios.getPremioRequest(targetEliminar);

          // Test sobre el check de los valores
          assert.equal(newReq[5].valueOf(),0); // uint256 _approved
          assert.equal(newReq[6].valueOf(),"Test deny motivo",{from:maria_clan});  // string _motivo_deny


          //vaciamos la lista:
          for (var i = listaRequests.length-1; i >= 0; i--) {
          await premios.aprobarCanjearPremio.sendTransaction(listaRequests[i], "Test deny motivo", 0,{from:maria_clan});
          }
          listaRequests = await premios.listPremiosRequests({from:alberto_clan});
          assert.equal(listaRequests.toString(),[]);
          })

          it("Test44: PROBAR LISTAR PETICIONES DE PREMIOS Y VER EL DETALLE", async () => {
            let premios = await Premios.deployed();

            await premios.solicitarCanjearPremio.sendTransaction( 1, {from:javier_personal});
            let listaRequests = await premios.listPremiosRequests({from:alberto_clan});
            let targetEliminar = listaRequests[0];
            await premios.aprobarCanjearPremio.sendTransaction(targetEliminar, "Test deny motivo", 0,{from:maria_clan});
            let newReq = await premios.getPremioRequest(targetEliminar);
            // Test sobre el check de los valoress
            assert.equal(newReq[0].valueOf(),javier_personal.valueOf()); //  address _to
            assert.equal(newReq[2].valueOf(),1); // uint256 _idPremio
            assert.equal(newReq[3],1); // uint256 _clan
            assert.equal(newReq[4].valueOf(),10); // int256 _prize
            assert.equal(newReq[5].valueOf(),0); // uint256 _approved
            assert.equal(newReq[6].valueOf(),"Test deny motivo",{from:maria_clan});  // string _motivo_deny
          })

          it("Test45: APROBAR SOLICITAR PREMIO CUANDO JUSTO DESPUES DE DESACTIVAR EL PREMIO", async () => {
            let premios = await Premios.deployed();

            let listaRequests = await premios.listPremiosRequests({from:alberto_clan});
            assert.equal(listaRequests.length,0);
            let response1 = await premios.listPremiosIds.call({from:admin});
            await premios.solicitarCanjearPremio.sendTransaction( 1, {from:javier_personal});
            await premios.solicitarCanjearPremio.sendTransaction( 1, {from:javier_personal});
            listaRequests = await premios.listPremiosRequests({from:alberto_clan});

            await premios.aprobarCanjearPremio.sendTransaction(listaRequests[1], "", 1, {from:admin});

            let llamada = await premios.activarPremio(1, 0, {from:alberto_clan});
	    truffleAssert.eventEmitted(llamada, "ActivarPremioEvent", (evento) =>{
          	return evento._prizeID == 1 && evento._clan == 1;
            })
            try{
		    await premios.aprobarCanjearPremio.sendTransaction(listaRequests[0], "", 0, {from:alberto_clan});
		    console.error("\tNo debería pasar el test ya que el premio esta desactivado");
            } catch(error){
              // funcionamiento esperado. Se espera: "Error: VM Exception while processing transaction: revert "
            }
          })

	it("Test46: LISTAR LOGROS Y ACCEDER A LA INFO CON GETLOGRO CUANDO NO HAY LOGROS DADOS DE ALTA", async () => {
          let logros = await Empleados.deployed();
	  try{ // Test con _to no valido
          	let lista = await logros.listLogrosIds.call({from:admin});
          	let response2 = await logros.getLogro.call(lista[0],{from:admin});
 		assert.equal(response2[0].valueOf(), 0);   //valor
          	assert.equal(response2[1].valueOf(), 0);  //clan
         	assert.equal(response2[2], "");  //nombre
          	assert.equal(response2[3], "");  //motivo
	  	assert.equal(response2[4].valueOf(), false); // estado
          	console.error("\tNo debería pasar el test no hay logros dados de alta");
           } catch(error){
           // funcionamiento esperado. Se espera: "Error: VM Exception while processing transaction: revert No Premio"
           }
        });


  	it("Test47: REGISTRAR UN LOGRO", async () => {
          let logros = await Empleados.deployed();
          let response1 = await logros.listLogrosIds.call({from:admin});
          assert.equal(response1.length, 13);
          let llamada = await logros.registrarLogro(1, 10, "test", "testear", {from:alberto_clan});
          let logrosIds = await logros.listLogrosIds.call({from:admin});
          assert.equal(logrosIds.length, 14);
	  truffleAssert.eventEmitted(llamada, "RegistrarLogroEvent", (evento) =>{
          	return evento._id == 1 && evento._valor == 10;
          })
        });

	it("Test48: REGISTRAR UN SEGUNDO LOGRO", async () => {
          let logros = await Empleados.deployed();

          let response1 = await logros.listLogrosIds.call({from:admin});
          assert.equal(response1.length, 14);
          let llamada = await logros.registrarLogro(2, 300, "MasterClass", "Impartir una MasterClass", {from:alberto_clan});
          let logrosIds = await logros.listLogrosIds.call({from:admin});
          assert.equal(logrosIds.length, 15);
	  truffleAssert.eventEmitted(llamada, "RegistrarLogroEvent", (evento) =>{
          	return evento._id == 2 && evento._valor == 300;
          })
        });

	it("Test49: listarLogros y acceder a la info con getLogro", async () => {
          let logros = await Empleados.deployed();
          let lista = await logros.listLogrosIds.call({from:admin});
          let response2 = await logros.getLogro.call(lista[1],{from:admin});
          assert.equal(response2[0].valueOf(), 100);   //valor
          assert.equal(response2[1].valueOf(), 1);  //clan
          assert.equal(response2[2], "Tweet Iecisa");  //nombre
          assert.equal(response2[3], "Tweetear con el hastag Iecisa");  //motivo
	  assert.equal(response2[4].valueOf(), true); // estado
        });

	it("Test50: REGISTRAR UN LOGRO QUE NO PERTENECE A TU CLAN", async () => {
          let logros = await Empleados.deployed();

          let response1 = await logros.listLogrosIds.call({from:admin});
          assert.equal(response1.length, 15);
	  try{ // Test con _to no valido
          	await logros.registrarLogro.sendTransaction(3, 300, "MasterClass", "Impartir una MasterClass", 2, {from:alberto_clan});
          	let logrosIds = await logros.listLogrosIds.call({from:admin});
          	assert.equal(logrosIds.length, 15);
          	console.error("\tNo debería pasar el test diferente clan");
           } catch(error){
           // funcionamiento esperado. Se espera: "Error: VM Exception while processing transaction: revert No mismo clan"
           }
        });

	it("Test51: REGISTRAR UN LOGRO CON MISMO ID", async () => {
          let logros = await Empleados.deployed();

          let response1 = await logros.listLogrosIds.call({from:admin});
          assert.equal(response1.length, 15);
	  try{ // Test con _to no valido
          	await logros.registrarLogro.sendTransaction(2, 300, "MasterClass", "Impartir una MasterClass", 1, {from:alberto_clan});
          	let logrosIds = await logros.listLogrosIds.call({from:admin});
          	assert.equal(logrosIds.length, 15);
          	console.error("\tNo debería pasar el test mismo id");
           } catch(error){
           // funcionamiento esperado. Se espera: "Error: VM Exception while processing transaction: revert Mismo id"
           }
        });

	it("Test52: REGISTRAR UN LOGRO CON UN CLAN QUE NO EXISTE", async () => {
          let logros = await Empleados.deployed();

          let response1 = await logros.listLogrosIds.call({from:admin});
          assert.equal(response1.length, 15);
	  try{ // Test con _to no valido
          	await logros.registrarLogro.sendTransaction(3, 300, "MasterClass", "Impartir una MasterClass", 4, {from:alberto_clan});
          	let logrosIds = await logros.listLogrosIds.call({from:admin});
          	assert.equal(logrosIds.length, 15);
          	console.error("\tNo debería pasar el test clan inexistente");
           } catch(error){
           // funcionamiento esperado. Se espera: "Error: VM Exception while processing transaction: revert No clan"
           }
        });

	it("Test53: REGISTRAR UN LOGRO CON NOMBRE VACIO", async () => {
          let logros = await Empleados.deployed();

          let response1 = await logros.listLogrosIds.call({from:admin});
          assert.equal(response1.length, 15);
	  try{ // Test con _to no valido
          	await logros.registrarLogro.sendTransaction(3, 300, "", "Impartir una MasterClass", 1, {from:alberto_clan});
          	let logrosIds = await logros.listLogrosIds.call({from:admin});
          	assert.equal(logrosIds.length, 15);
          	console.error("\tNo debería pasar el test nombre vacio");
           } catch(error){
           // funcionamiento esperado. Se espera: "Error: VM Exception while processing transaction: revert No Name"
           }
        });
 	it("Test54: Activar y Desactivar Logro", async () => {
         let logros = await Empleados.deployed();
         let llamada = await logros.activarLogro(100, 0,{from:alberto_clan})
         let logro2 = await logros.getLogro(100,{from:admin});
         assert.equal(logro2[4],false)
	  truffleAssert.eventEmitted(llamada, "ActivarLogroEvent", (evento) =>{
          	return evento._logroID == 100;;
          })
         let llamada2 = await logros.activarLogro(100, 1, {from:alberto_clan})
	  truffleAssert.eventEmitted(llamada2, "ActivarLogroEvent", (evento) =>{
          	return evento._logroID == 100;;
          })
         logro2 = await logros.getLogro(100,{from:admin});
         assert.equal(logro2[4],true)
       });

        it("Test55: Actualizar el wallet de un empleado que existe con una cuenta nueva", async () => {
	  // Creamos nueva cuenta
	  alberto_personal2 = web3.personal.newAccount("");
	  web3.personal.unlockAccount(alberto_personal2, "", 3600);
	  // Damos gas
	  var amount_to_send_eth = web3.fromWei(web3.eth.getBalance(web3.eth.accounts[0]), "ether");
	  var amount_to_send_wei = amount_to_send_eth *1000000000000000000;
	  var transactionFee = web3.eth.gasPrice * 21001;
	  var total_amount_to_send_wei = (transactionFee + amount_to_send_wei) / 10;
	  web3.eth.sendTransaction({from:admin, to:alberto_personal2, value: total_amount_to_send_wei });

          let contract = await Empleados.deployed();
          let tokies = await Tokies.deployed();
          let empleadoAntes = await contract.getEmpleado.call(1, {from:admin});
	  let clanAntes = await contract.getClan(1, {from:admin});
	  // Damos tokies
          await contract.emitirTokies.sendTransaction(1, 112, {from:maria_clan});
          let listTokiesRequestIds = await contract.listTokiesRequestIds.call({from:admin});
          await contract.aprobarEmitirTokies.sendTransaction(listTokiesRequestIds[0],1,"", {from:admin});
	  let balanceAntes = await tokies.balanceOf.call(alberto_personal, {from:admin});
          let llamada = await contract.registrarmeComoEmpleado(1, "alberto", "gomez", {from:alberto_personal2});
          let empleadoDespues = await contract.getEmpleado.call(1, {from:admin});
          let stringAccount = JSON.stringify(alberto_personal2);
          assert.equal(empleadoDespues[0], stringAccount.replace(/\"/g,''));
          assert.equal(empleadoDespues[1], empleadoAntes[1]);
          assert.equal(empleadoDespues[2], empleadoAntes[2]);
          assert.equal(empleadoDespues[3], empleadoAntes[3]);
	  let balanceDespues = await tokies.balanceOf.call(alberto_personal2, {from:admin});
	  assert.equal(balanceAntes.valueOf(), balanceDespues.valueOf());
	  let clanDespues = await contract.getClan(1, {from:admin});
	  assert.equal(clanAntes.valueOf(), clanDespues.valueOf());
	  truffleAssert.eventEmitted(llamada, "WalletActualizadoEvent", (evento) =>{
          	return evento._name == empleadoDespues[1] && evento._surname == empleadoDespues[2] && evento._fromNumberID == 1 && evento._from == empleadoDespues[0];
         })
        });

          it("Test56: DESACTIVAR Y ACTIVAR PREMIO DESDE CUENTA DE CLAN", async () => {
            let premios = await Premios.deployed();
            let response1 = await premios.listPremiosIds.call({from:admin});
            let response2 = await premios.getPremio.call(response1[1],{from:admin});
            await premios.activarPremio.sendTransaction(response1[1], 0, {from:alberto_clan});
            let response3 = await premios.getPremio.call(response1[1],{from:admin});
	    assert.notEqual(response3[3].valueOf(), response2[3].valueOf()); // El estado activo de antes distinto al de después de la desactivación
	    await premios.activarPremio.sendTransaction(response1[1], 1, {from:alberto_clan});
            let response4 = await premios.getPremio.call(response1[1],{from:admin});
	    assert.equal(response4[3].valueOf(), response2[3].valueOf()); // El estado activo de antes igual al de después de la desactivación
          })

          it("Test57: DESACTIVAR PREMIO DESDE CUENTA DE CLAN DISTINTO", async () => {
            let premios = await Premios.deployed();
	    try{
		    await premios.desactivarPremio.sendTransaction(1,{from:maria_clan});
		    console.error("No debería suceder esto");
	    }catch(e){ /* Comportamiento esperado*/}
          })
          it("Test58: ACTIVAR PREMIO DESDE CUENTA DE CLAN DISTINTO", async () => {
            let premios = await Premios.deployed();
	    try{
		    await premios.activarPremio.sendTransaction(1,{from:maria_clan});
		    console.error("No debería suceder esto");
	    }catch(e){ /* Comportamiento esperado*/}
    })

      it("Test59: DESACTIVAR Y ACTIVAR LOGRO DESDE CUENTA DE CLAN", async () => {
        let logros = await Empleados.deployed();
        let listLogros = await logros.listLogrosIds.call({from:admin});
        let logro = await logros.getLogro.call(listLogros[1],{from:admin});
        assert.equal(logro[4], 1);
        await logros.activarLogro.sendTransaction(listLogros[1], 0, {from:alberto_clan});
        logro = await logros.getLogro.call(listLogros[1],{from:admin});
        assert.equal(logro[4], 0);
        await logros.activarLogro.sendTransaction(listLogros[1], 1, {from:alberto_clan});
        logro = await logros.getLogro.call(listLogros[1],{from:admin});
        assert.equal(logro[4], 1);
      })

      it("Test60: DESACTIVAR LOGRO DESDE CUENTA DE CLAN DISTINTO", async () => {
        let logros = await Empleados.deployed();
	      try{
  		    await logros.activarLogro.sendTransaction(2, 0,{from:maria_clan});
	      }catch(e){ /* Comportamiento esperado*/}
      })

    it("Test61: ACTIVAR LOGRO DESDE CUENTA DE CLAN DISTINTO", async () => {
      let logros = await Empleados.deployed();
	    try{
		    await logros.activarLogro.sendTransaction(2, 1, {from:maria_clan});
	    }catch(e){ /* Comportamiento esperado*/}
    })

	  it("Test62: Un empleado solicita quitar del clan a otro empleado de su mismo clan", async () => {
		  let contract = await Empleados.deployed();
		  let lista = await contract.listQuitarDeClanRequestIds.call({from:alberto_clan});
		  assert.equal(lista.length, 0);
		  let llamada = await contract.solicitarQuitarDeClan(3, "chau pescau", {from:alberto_clan});
		  lista = await contract.listQuitarDeClanRequestIds.call({from:alberto_clan});
		  assert.equal(lista.length, 1);
		  truffleAssert.eventEmitted(llamada, "SolicitarQuitarDeClanEvent", (evento) =>{
		  	return evento._fromNumberID == 1 && evento._clan == 1;
      })
      let clan = await contract.getClan(3,{from:admin});
      assert.equal(clan.valueOf(), 1);
	  })

    it("Test63: Intentar aprobar/denegar quitar de clan a un empleado, desde la misma cuenta que hizo la solicitud, no se puede", async () => {
        let contract = await Empleados.deployed();
        let lista = await contract.listQuitarDeClanRequestIds.call({from:alberto_clan});
        assert.equal(lista.length, 1);
        try{
          let llamada = await contract.aprobarQuitarDeClan(3, 0, {from:alberto_clan});
        }catch(error){
        }
        lista = await contract.listQuitarDeClanRequestIds.call({from:alberto_clan});
        assert.equal(lista.length, 1);
        isClan = await contract.isClan(3,{from:alberto_clan});
        assert.equal(isClan, true);
      })

  it("Test64: Intentar aprobar/denegar quitar de clan a un empleado, desde un un empleado de otro clan, no se puede", async () => {
		  let contract = await Empleados.deployed();
		  let clan = await contract.getClan(3,{from:javier_clan});
		  assert.equal(clan.valueOf(), 1);  // javier es de clan 1
      clan = await contract.getClan(2,{from:maria_clan});
		  assert.equal(clan.valueOf(), 2);  // maria es de clan 2
      try{
		      let llamada = await contract.aprobarQuitarDeClan(3, 1, {from:maria_clan});
             console.error("\tNo debería pasar el test (_to)");
      } catch(error){
      }
		  lista = await contract.listQuitarDeClanRequestIds.call({from:javier_clan});
		  assert.equal(lista.length, 1);
		  isClan = await contract.isClan(3);
		  assert.equal(isClan, true);
	  })

    it("Test65: El super admin elimina de un clan a un empleado (solicita y aprueba) y éste se registra en otro clan para poder hacer los siguientes test.Asi tenemos tres miembros de un mismo clan", async ()  => {
  		  let contract = await Empleados.deployed();
  		  let clan = await contract.getClan(2,{from:admin});
  		  assert.equal(clan.valueOf(), 2);
        let solicitud = await contract.solicitarQuitarDeClan(2, "chau pescau", {from:admin});
        let aprobacion = await contract.aprobarQuitarDeClan(2, 1, {from:admin});
  		  truffleAssert.eventEmitted(aprobacion, "AprobarQuitarDeClanEvent", (evento) =>{
  		  	return evento._fromNumberID == 0 && evento._clan == 2 && evento._employeeID == 2 && evento._approved == 1;
        })
  		  isClan = await contract.isClan(2);
  		  assert.equal(isClan, false);
        await contract.solicitarRegistrarmeEnClan(2, 1, {from:maria_clan});
        await contract.aprobarRegistroEnClan.sendTransaction(2, 1, {from:admin});
        clan = await contract.getClan(2,{from:admin});
        assert.equal(clan.valueOf(), 1);
  	  })

      it("Test66: Denegar la solicitud por un miembro del clan que no es ni el emisor ni el empleado a quitar. ", async () => {
    		  let contract = await Empleados.deployed();
    		  let isClan = await contract.isClan(3);
    		  assert.equal(isClan, true);
    		  let llamada = await contract.aprobarQuitarDeClan(3, 0, {from:maria_clan});
          truffleAssert.eventEmitted(llamada, "AprobarQuitarDeClanEvent", (evento) =>{
    		  	return evento._fromNumberID == 2 && evento._clan == 1 && evento._employeeID == 3 && evento._approved == 0;
          })
    		  lista = await contract.listQuitarDeClanRequestIds.call({from:alberto_clan});
    		  assert.equal(lista.length, 0);
    		  isClan = await contract.isClan(3);
    		  assert.equal(isClan, true);
    	  })

        it("Test67: Otra vez, un empleado solicita quitar del clan a otro empleado de su mismo clan", async () => {
          let contract = await Empleados.deployed();
          let lista = await contract.listQuitarDeClanRequestIds.call({from:alberto_clan});
          assert.equal(lista.length, 0);
          let llamada = await contract.solicitarQuitarDeClan(3, "chau pescau", {from:alberto_clan});
          lista = await contract.listQuitarDeClanRequestIds.call({from:alberto_clan});
          assert.equal(lista.length, 1);
          truffleAssert.eventEmitted(llamada, "SolicitarQuitarDeClanEvent", (evento) =>{
            return evento._fromNumberID == 1 && evento._clan == 1;
          })
          let clan = await contract.getClan(3,{from:admin});
          assert.equal(clan.valueOf(), 1);
        })

    	it("Test69: Aprobar la solicitud por un miembro del clan que no es ni el emisor ni el empleado a quitar.", async () => {
    		  let contract = await Empleados.deployed();
    		  let isClan = await contract.isClan(3);
    		  assert.equal(isClan, true);
    		  let llamada = await contract.aprobarQuitarDeClan(3, 1, {from:maria_clan});
          truffleAssert.eventEmitted(llamada, "AprobarQuitarDeClanEvent", (evento) =>{
    		  	return evento._fromNumberID == 2 && evento._clan == 1 && evento._employeeID == 3 && evento._approved == 1;
          })
    		  lista = await contract.listQuitarDeClanRequestIds.call({from:alberto_clan});
    		  assert.equal(lista.length, 0);
    		  isClan = await contract.isClan(3);
    		  assert.equal(isClan, false);
        })

        it("Test70: Un empleado que ya pertenece a un clan, no puede solicitar registrarse en otro clan a la vez", async () => {
      		  let contract = await Empleados.deployed();
      		  let clan = await contract.getClan(2);
      		  assert.equal(clan.valueOf(), 1);
            try{
      		      let llamada = await contract.solicitarRegistrarmeEnClan(2, 2, {from:maria_clan});
                truffleAssert.eventEmitted(llamada, "SolicitarRegistroEnClanEvent", (evento) =>{
          		  	return evento._fromNumberID == 2 && evento._clan == 2;
                })
             console.error("\tNo debería pasar el test (_to)");
            }catch(error){
            }
      		  lista = await contract.listClanRequestIds.call({from:maria_clan});
      		  assert.equal(lista.length, 0);
      		  clan = await contract.getClan(2);
      		  assert.equal(clan.valueOf(), 1);
          })

      it("Test71: Un nuevo empleado no puede registrarse en mas de un clan. Se machaca siempre su request con la mas reciente", async () => {
    		  let contract = await Empleados.deployed();
    		  let isClan = await contract.isClan(4);
    		  assert.equal(isClan, false);
          let llamada = await contract.solicitarRegistrarmeEnClan(4, 1, {from:cesar_clan});
          truffleAssert.eventEmitted(llamada, "SolicitarRegistroEnClanEvent", (evento) =>{
            return evento._fromNumberID == 4 && evento._clan == 1;
          })
          let lista = await contract.listClanRequestIds.call({from:alberto_clan});
    		  assert.equal(lista.length, 1);
          try{
            let llamada2 = await contract.solicitarRegistrarmeEnClan(4, 2, {from:cesar_clan});
            truffleAssert.eventEmitted(llamada2, "SolicitarRegistroEnClanEvent", (evento) =>{
              return evento._fromNumberID == 4 && evento._clan == 2;
            })
             console.error("\tNo debería pasar el test (_to)");
          }catch(error){
          }
    		  lista = await contract.listClanRequestIds.call({from:alberto_clan});
    		  assert.equal(lista.length, 1);
    		  isClan = await contract.isClan(4);
    		  assert.equal(isClan, false);
        })

        it("Test72: Comprobacion de que balanceOf (Tokie) y balanceOfEmpleado (Empleados) funcionan identicamente ", async () => {
          let contract = await Empleados.deployed();
          let tokies = await Tokies.deployed();
          let balanceTokie = await tokies.balanceOf.call(javier_personal, {from:admin});
          let balanceEmpleado = await contract.balanceOfEmpleado.call(3, {from:admin});
          assert.equal(balanceTokie.valueOf(), balanceEmpleado.valueOf());
          balanceTokie = await tokies.balanceOf.call(maria_personal, {from:admin});
          balanceEmpleado = await contract.balanceOfEmpleado.call(2, {from:admin});
          assert.equal(balanceTokie.valueOf(), balanceEmpleado.valueOf());
	        balanceTokie = await tokies.balanceOf.call(alberto_personal2, {from:admin});
          balanceEmpleado = await contract.balanceOfEmpleado(1, {from:admin});
          assert.equal(balanceTokie.valueOf(), balanceEmpleado.valueOf());
        });

        it("Test73: Comprobar que se aprueba la solicitud de premio correcta tras realizar varias solicitudes del mismo premio seguidas", async () => {
          let premios = await Premios.deployed();
          let contract = await Empleados.deployed();
          let listaPremios = await premios.listPremiosIds.call({from:admin});
          let balance = await contract.balanceOfEmpleado.call(3, {from:admin});

          let solicitud1 = await premios.solicitarCanjearPremio(listaPremios[2], {from:javier_personal});
	        truffleAssert.eventEmitted(solicitud1, "SolicitarCanjearPremioEvent", (evento) =>{
          	return evento._prizeID == 3 && evento._clan == 1 && evento._employeeID == 3;
          })
          let balance1 = await contract.balanceOfEmpleado.call(3, {from:admin});
          let test =  parseFloat(balance.valueOf()) - parseFloat(30);
          assert.equal(balance1.valueOf(), test)

          let solicitud2 = await premios.solicitarCanjearPremio(listaPremios[2], {from:javier_personal});
	         truffleAssert.eventEmitted(solicitud2, "SolicitarCanjearPremioEvent", (evento) =>{
          	return evento._prizeID == 3 && evento._clan == 1 && evento._employeeID == 3;
          })
          let balance2 = await contract.balanceOfEmpleado.call(3, {from:admin});
          test =  parseFloat(balance1.valueOf()) - parseFloat(30);
          assert.equal(balance2.valueOf(), test)

          let listaRequest = await premios.listPremiosRequests.call({from:admin});
	        assert.equal(listaRequest.length, 3);

          let aprobacion1 = await premios.aprobarCanjearPremio(listaRequest[1], "", 1, {from:admin});
	        truffleAssert.eventEmitted(aprobacion1, "AprobarCanjearPremioEvent", (evento) =>{
          	return evento._prizeID == 3 && evento._clan == 1  && evento._employeeID == 3;
          })
          let balance3 = await contract.balanceOfEmpleado.call(3, {from:admin});
          assert.equal(balance3.valueOf(), balance2.valueOf())

	        let aprobacion2 = await premios.aprobarCanjearPremio(listaRequest[1], "", 1, {from:admin});
	        truffleAssert.eventEmitted(aprobacion2, "AprobarCanjearPremioEvent", (evento) =>{
          	return evento._prizeID == 3 && evento._clan == 1  && evento._employeeID == 3;
          })
          let balance4 = await contract.balanceOfEmpleado.call(3, {from:admin});
          assert.equal(balance4.valueOf(), balance3.valueOf())

          listaRequest = await premios.listPremiosRequests.call({from:admin});
	        assert.equal(listaRequest.length, 1);
        });

        it("Test74: Comprobar que getAdministrador del empleado con id 1 funciona correctamente", async () => {
          let contract = await Empleados.deployed();
          let empleado = await contract.getAdministrador.call(1, {from:admin});
          let cuentaClan = JSON.stringify(alberto_clan);
          assert.equal(empleado[0], cuentaClan.replace(/\"/g,''));
          let cuentaPersonal = JSON.stringify(alberto_personal2);
          assert.equal(empleado[1], cuentaPersonal.replace(/\"/g,''));
          assert.equal(empleado[2], 1);
          assert.equal(empleado[3], 1);
        });

        it("Test75: Comprobar que sudo no puede registrar un premio ya existente", async () => {
          let premios = await Premios.deployed();
          try{
            await premios.registrarPremio(1, 50, "mochila", {from:admin});
            console.error("\t Esto no deberia de ocurrir");
          } catch (error) {
          }
        });

        it("Test76: Comprobar que sudo puede borrar correctamente", async () => {
          let premios = await Premios.deployed();
          let response1 = await premios.listPremiosIds.call({from:admin});
          assert.equal(response1.length, 3);
          let request = await premios.borrarPremio(2, {from:admin});
          let response2 = await premios.listPremiosIds.call({from:admin});
          assert.equal(response2.length, 2);
            truffleAssert.eventEmitted(request, "BorrarPremioEvent", (evento) =>{
            return evento._prizeID == 2 && evento._clan == 1 && evento._fromNumberID == 0;
          })
        });


})
