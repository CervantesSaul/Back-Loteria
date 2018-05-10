'use strict'

var mysql = require('mysql');
var express = require('express');
//var app = express();
var app = require('../app');
var server = require('http').Server(app);
var io = require('socket.io')(server);

var rooms = [];

/*var room = [{
	nombreSala: "",
	numerosBaraja: []
}];*/

//PARA EJEMPLO UN ARRAY DE MENSAJES AQUI VA LA DB
/*var messages=[{
		id:1,
		text: "Bienvenido a la sala",
		autor:"Loteria"
}];*/

app.use(express.static('public'));


io.on('connection',function(socket){
	console.log('todo va bien');

	socket.on('new-message',function(data){
		//AVISAR A TODOS LOS SOCKETS QUE HAY UN NUEVO MENSAJE
		//io.sockets.emit('messages',messages);
		io.sockets.in(socket.room).emit('messages', data);
	});
	
	//CONFIGURACION DE LAS SALAS
	   //Cuando el cliente emita 'adduser', escucha y ejecuta
	   
	socket.on('ConexionEscuchar',function(nombreSala){
		socket.room = nombreSala;
		socket.join(nombreSala);
	});

	socket.on('adduser', function(username, nombreSala){
		var salaExiste = false;
		//Guarda username en la sesion del socket para cada cliente
		socket.username = username;
		//guarda el nombre de la sala en la sesion del socket para cada cliente
		//socket.room = nombreSala;
		socket.room = nombreSala;
		var len = 0;
		
		for( var i=0; i<rooms.length;i++ ){
			if(rooms[i].nombreSala == nombreSala){
				salaExiste = true;
				len = i+1;
				break;
			}else{
				salaExiste =false;
			}
		}
		
		if(salaExiste){
			rooms[len-1].numJugadores ++;
			if(rooms[len-1].numJugadores==2){
			rooms[len-1].estado = "Listo para Jugar";
			}
		}else{
			/*var rom = room;
			rom.nombreSala = nombreSala;
			rom.numerosBaraja = new Array();*/

			rooms.push({nombreSala:nombreSala,cartasSelect:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], numerosBaraja: [],numJugadores: 1,estado: "Esperando Jugadores",inter:null,intervalSalas:null,intervalIniciar:null,intervalEspera:null,intervalTerminada:null,intervalReiniciar:null,contarEspera:0,contarTerminada:0,contarReiniciar:0});
			len = rooms.length;
		}
		

		// Unir al cliente a la sala
		socket.join(rooms[len-1].nombreSala);
		// Mandar mensaje cuando se conecte al usuario
		socket.emit('messages', {autor:'Loteria',text:'Bienvenido a la sala ' + rooms[len-1].nombreSala});
		//Mandar mensaje a todas las personas de la sala excepto al usuario actual
		socket.broadcast.to(rooms[len-1].nombreSala).emit('messages',{autor:'Loteria',text: username +' se ha unido a la sala'});
	});

	socket.on('AgregarCartaSelect',function(idCarta,nombreSala){
		var idSala = Sala(nombreSala);
		rooms[idSala].cartasSelect[idCarta] = 1;

	});

	socket.on('RetornarCartasSelect',function(nombreSala){
		var idSala = Sala(nombreSala);
		io.sockets.in(nombreSala).emit('CartasSeleccionadas',rooms[idSala].cartasSelect);
	});


	function laLimpiaIntervals(idSala){
		clearInterval(rooms[idSala].inter);
		clearInterval(rooms[idSala].intervalEspera);
		clearInterval(rooms[idSala].intervalIniciar);
		clearInterval(rooms[idSala].intervalReiniciar);
		clearInterval(rooms[idSala].intervalTerminada);
	}

	socket.on('Estado',function IniciarPartida (){
		var idSala = Sala(socket.room);
		io.sockets.in(rooms[idSala].nombreSala).emit('EstadoPartida',"Esperando Jugadores");
		rooms[idSala].intervalIniciar = setInterval(EstadoJugada,1000,idSala);
	});

	function Listo(idSala){
		rooms[idSala].intervalEspera = setInterval(conteoEspera,1000,idSala);
	}

	function Jugando(idSala){
		rooms[idSala].inter = setInterval(intervalFunc,2000,idSala);
	}

	function PartidaTerminada(idSala){
		rooms[idSala].intervalTerminada = setInterval(conteoTerminada,2000,idSala);
	}

	function EstadoJugada(idSala){
		//var idSala = Sala(socket.room);
		if(rooms[idSala].estado=="Listo para Jugar"){
			laLimpiaIntervals(idSala);
			io.sockets.in(rooms[idSala].nombreSala).emit('EstadoPartida',"Listo para Jugar");
			Listo(idSala);
		}
	}

	function ReiniciarPartida(idSala){
		rooms[idSala].numerosBaraja = [];
		rooms[idSala].intervalReiniciar = setInterval(conteoReiniciar,2000,idSala);
	}

	function conteoReiniciar(idSala){
		if(rooms[idSala].contarReiniciar<20){
			rooms[idSala].contarReiniciar ++;
			io.sockets.in(rooms[idSala].nombreSala).emit('Conteo',rooms[idSala].contarReiniciar);
			//io.sockets.in(rooms[idSala].nombreSala).emit('Conteo',rooms[idSala].contarEspera);
		}else{
			laLimpiaIntervals(idSala);
			rooms[idSala].contarReiniciar = 0;
			io.sockets.in(rooms[idSala].nombreSala).emit('EstadoPartida',"Jugando");
			Jugando(idSala);
		}
	}

	function conteoEspera(idSala){
		if(rooms[idSala].contarEspera<30){
			rooms[idSala].contarEspera ++;
			
			io.sockets.in(rooms[idSala].nombreSala).emit('Conteo',rooms[idSala].contarEspera);
		}else{
			laLimpiaIntervals(idSala);
			rooms[idSala].numerosBaraja = [];
			rooms[idSala].estado = "Jugando";
			io.sockets.in(rooms[idSala].nombreSala).emit('EstadoPartida',"Jugando");
			Jugando(idSala);
		}
	}

	function conteoTerminada(idSala){
		if(rooms[idSala].contarTerminada<10){
			rooms[idSala].contarTerminada ++;
			
			io.sockets.in(rooms[idSala].nombreSala).emit('Conteo',rooms[idSala].contarTerminada);
		}else{
			laLimpiaIntervals(idSala);
			rooms[idSala].contarReiniciar = 0;
			rooms[idSala].estado = "Iniciando Partida";
			io.sockets.in(rooms[idSala].nombreSala).emit('EstadoPartida',"Iniciando Partida");
			ReiniciarPartida(idSala);
		}
	}

	socket.on('Salas',function(){
		var idSala = Sala(socket.room);
		//salas();
		rooms[idSala].intervalSalas = setInterval(salas,1000);
	});

	function salas(){
		var salas = new Array();
		for(var i = 0; i< rooms.length;i++){
			salas.push({nombreSala:rooms[i].nombreSala,cartasSelect:rooms[i].cartasSelect,numJugadores: rooms[i].numJugadores,Estado:rooms[i].estado})
		}
		io.sockets.emit('SalasInf',salas);
	}

	// Cuando un usuario se desconecta
	socket.on('desconectar', function(){
		var idSala = Sala(socket.room);
		socket.broadcast.to(socket.room).emit('messages',{autor:'Loteria',text: socket.username +' ha abandonado la sala'});
		socket.leave(socket.room);
		rooms[idSala].numJugadores--;
		socket.room = "";
	});


	socket.on('verificarLlenas',function(data,vectores){

		var idSala = Sala(socket.room);
		var jugada = [];
		var centro = [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false];
		var bandera = false;
		for (var i=0; i<vectores.length;i++) {
			for(var j=0;j<rooms[idSala].numerosBaraja.length;j++){
				
				if(vectores[i] == rooms[idSala].numerosBaraja[j]){
					centro[i] = true;
					//console.log(vectores[i] + " "+ cartasDestapadas[j]);
					break;
				}else{
					centro[i] = false;
				}
			}
			for (var j=0; j<vectores.length;j++){
				if(centro[j]){
					//console.log(esquinas[j] + " "+ j + " " +i);
					bandera = true;
				}else{
					bandera = false;
					break;
				}
				
			}
			if(bandera){
				jugada.push({userName:data.autor,jugada:"Llenas",valido:true});
				io.sockets.in(socket.room).emit('jugada',jugada);

				//PARA TERMINAR LA PARTIDA
				
				console.log("Hemos terminado");
				var GameOver = [{
					GameOver: true
				}]
				//PARA PARAR EL INTERVALO
				rooms[idSala].numerosBaraja = [];


				laLimpiaIntervals(idSala);
				rooms[idSala].contarTerminada = 0;
				rooms[idSala].estado = "Partida Terminada";
				io.sockets.in(rooms[idSala].nombreSala).emit('EstadoPartida',"Partida Terminada");
				PartidaTerminada(idSala);
				io.sockets.in(rooms[idSala].nombreSala).emit('GameOver',GameOver);

				break;
			}
		}
		if(bandera != true){
			jugada.push({userName:data.autor,jugada:"Llenas",valido:false});
			io.sockets.in(socket.room).emit('jugada',jugada);
		}
	});

	socket.on('verificarCentro',function(data,vectores){
		var idSala = Sala(socket.room);
		var jugada = [];
		var centro = [false,false,false,false];
		var bandera = false;
		for (var i=0; i<vectores.length;i++) {
			for(var j=0;j<rooms[idSala].numerosBaraja.length;j++){
				if(vectores[i] == rooms[idSala].numerosBaraja[j]){
					centro[i] = true;
					//console.log(vectores[i] + " "+ cartasDestapadas[j]);
					break;
				}else{
					centro[i] = false;
				}
			}
			for (var j=0; j<vectores.length;j++){
				if(centro[j]){
					//console.log(centro[j] + " "+ j + " " +i);
					bandera = true;
				}else{
					bandera = false;
					break;
				}
				
			}
			if(bandera){
				jugada.push({userName:data.autor,jugada:"Centro",valido:true});
				io.sockets.in(socket.room).emit('jugada',jugada);
				break;
			}
		}
		if(bandera != true){
			jugada.push({userName:data.autor,jugada:"Centro",valido:false});
			io.sockets.in(socket.room).emit('jugada',jugada);
		}
	});

	socket.on('prueba',function(){
		var idSala = Sala(socket.room);
		rooms[idSala].inter = setInterval(intervalFunc,2000,idSala);
		
	});

	function intervalFunc(idSala){
		if(rooms[idSala].numerosBaraja.length < 54){
			var number = randomGenerate(idSala);
			rooms[idSala].numerosBaraja.push(number);
			//pay.text = number;
			io.sockets.in(rooms[idSala].nombreSala).emit('numerosBaraja',number);
			//setInterval(intervalFunc(pay), 1500);
		}else
		{
			console.log("Hemos terminado");
			var GameOver = [{
				GameOver: true
			}]
			//PARA PARAR EL INTERVALO
			laLimpiaIntervals(idSala);
			rooms[idSala].contarTerminada = 0;
			rooms[idSala].estado = "Partida Terminada";
			io.sockets.in(rooms[idSala].nombreSala).emit('EstadoPartida',"Partida Terminada");
			PartidaTerminada(idSala);
			io.sockets.in(rooms[idSala].nombreSala).emit('GameOver',GameOver);
		}
	}

	function randomGenerate(idSala){
		var randomizar = true;
		if(rooms[idSala].numerosBaraja.length <54){

		
			if(rooms[idSala].numerosBaraja.length>0){
				while(randomizar){
					var number = Math.floor(Math.random() * 54) + 1;
					for(var i=0;i<rooms[idSala].numerosBaraja.length;i++){
						if(rooms[idSala].numerosBaraja[i]==number){
							randomizar = true;
							break;
						}else{
							randomizar=false;
						}
					}
				}
			}else{
				var number = Math.floor(Math.random() * 54) + 1;
			}
			return number;
		}
	}

	function Sala(nombreSala){
		for(var i=0; i<rooms.length;i++){
			if(rooms[i].nombreSala==nombreSala){
				return i;
			}
		}
	}
	  

	socket.on('verificarEsquinas',function(data,vectores){
		var idSala = Sala(socket.room);
		var jugada = [];
		var esquinas = [false,false,false,false];
		var bandera = false;
		for (var i=0; i<vectores.length;i++) {
			for(var j=0;j<rooms[idSala].numerosBaraja.length;j++){
				if(vectores[i] == rooms[idSala].numerosBaraja[j]){
					esquinas[i] = true;
					//console.log(vectores[i][j] + " "+ cartasDestapadas[k]);
					break;
				}else{
					esquinas[i] = false;
				}
			}
			for (var j=0; j<vectores.length;j++){
				if(esquinas[j]){
					//console.log(esquinas[j] + " "+ j + " " +i);
					bandera = true;
				}else{
					bandera = false;
					break;
				}
				
			}
			if(bandera){
				jugada.push({userName:data.autor,jugada:"Esquinas",valido:true});
				io.sockets.in(socket.room).emit('jugada',jugada);
				break;
			}
		}
		if(bandera != true){
			jugada.push({userName:data.autor,jugada:"Esquinas",valido:false});
			io.sockets.in(socket.room).emit('jugada',jugada);
		}
	});

	socket.on('verificarChorro',function(data,vectores){
		var idSala = Sala(socket.room);
		var jugada = [];
		var chorro = [false,false,false,false];
		var bandera = false;
		for (var i=0; i<vectores.length; i++){
			//console.log(vectores[i]);
			for (var j=0; j<vectores[i].length; j++){
				for(var k=0;k<rooms[idSala].numerosBaraja.length;k++){
					if(vectores[i][j] == rooms[idSala].numerosBaraja[k]){
						chorro[j] = true;
						//console.log(vectores[i][j] + " "+ cartasDestapadas[k]);
						break;
					}else{
						chorro[j] = false;
					}
				}
			}
			for (var j=0; j<vectores[i].length;j++){
				if(chorro[j]){
					//console.log(chorro[j] + " "+ j + " " +i);
					bandera = true;
				}else{
					bandera = false;
					break;
				}
				
			}
			if(bandera){
				jugada.push({userName:data.autor,jugada:"Chorro",valido:true});
				io.sockets.in(socket.room).emit('jugada',jugada);
				break;
			}
		}
		if(bandera != true){
			jugada.push({userName:data.autor,jugada:"Chorro",valido:false});
			io.sockets.in(socket.room).emit('jugada',jugada);
		}
	});

});


//CONFIGURACION DE LA BD
/*var connection = mysql.createConnection({
   host: 'sql165.main-hosting.eu',
   user: 'u541737295_azu',
   password: '12345678',
   database: 'u541737295_lote',
   port: 3306
});

connection.connect(function(error){
   if(error){
      throw error;
   }else{
      console.log('Conexion correcta.');
   }
});*/

server.listen(8080, function(){
	console.log("Servidor corriendo en el puerto 8080");
});
//connection.end();

