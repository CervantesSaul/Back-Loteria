var socket = io.connect('http://localhost:8080', {'forceNew':true});

socket.on('connect', function(){
	// call the server-side function 'adduser' and send one parameter (value of prompt)
	socket.emit('adduser', prompt("Cual es tu nombre?"), prompt("Nombre de la sala: "));
});

socket.on('messages', function(data){
	console.log(data);
	render(data);
});

socket.on('CartasSeleccionadas',function(data){
	console.log(data);
});

function Desconectar(){
	socket.emit('desconectar');
}

function AgregarCartaSelect(){
	socket.emit('AgregarCartaSelect',2,"2");
}

function RetornarCartas(){
	socket.emit('RetornarCartasSelect',"2");
}

function Jugar(){
	socket.emit('Estado');
}

function random(){
	var payload={
		autor:document.getElementById('username').value,
		text:document.getElementById('texto').value,
		verificar: false
	};
	socket.emit('prueba',payload);
}

function salas(){
	var payload={
		autor:document.getElementById('username').value,
		text:document.getElementById('texto').value,
		verificar: false
	};
	socket.emit('Salas');
}

function validarChorro(){
	var chorro = new Array();

	var payload={
		autor:document.getElementById('username').value,
		text:document.getElementById('texto').value,
		verificar: false
	};

	//arreglos de combinaciones posibles para chorro
	chorro[0] = [6,7,8,9];
	chorro[1] = [15,16,17,18];
	chorro[2] = [24,25,26,27];
	chorro[3] = [33,34,35,36];
	chorro[4] = [6,15,24,33];
	chorro[5] = [7,16,25,34];
	chorro[6] = [8,17,26,35];
	chorro[7] = [9,18,27,36];
	chorro[8] = [6,16,26,36];
	chorro[9] = [33,25,17,9];


	//cartas arrojadas por el servidor
	var cartasDestapadas = [1,2,3,4,5,6,7,8,9,10] ;
	socket.emit('verificarChorro',payload,chorro, cartasDestapadas);
}

function validarCentro(){
	//var chorro = new Array();

	var payload={
		autor:document.getElementById('username').value,
		text:document.getElementById('texto').value,
		verificar: false
	};

	//arreglos de combinaciones posibles para chorro
	var chorro = [11,12,20,21];

	//cartas arrojadas por el servidor
	var cartasDestapadas = [1,2,3,4,5,6,7,8,9,10] ;
	socket.emit('verificarCentro',payload,chorro, cartasDestapadas);
}


function validarEsquinas(){
	//var chorro = new Array();

	var payload={
		autor:document.getElementById('username').value,
		text:document.getElementById('texto').value,
		verificar: false
	};

	//arreglos de combinaciones posibles para chorro
	var chorro = [6,9,28,31];

	//cartas arrojadas por el servidor
	var cartasDestapadas = [1,2,3,4,5,6,7,8,9,10] ;
	socket.emit('verificarEsquinas',payload,chorro, cartasDestapadas);
}

function validarLlenas(){
	//var chorro = new Array();

	var payload={
		autor:document.getElementById('username').value,
		text:document.getElementById('texto').value,
		verificar: false
	};

	//arreglos de combinaciones posibles para chorro
	var chorro = [6,7,8,9,15,16,17,18,24,25,26,27,33,34,35,36];

	//cartas arrojadas por el servidor
	var cartasDestapadas = [1,2,3,4,5,6,7,8,9,10] ;
	socket.emit('verificarLlenas',payload,chorro, cartasDestapadas);
}

function render(data){
	document.getElementById('messages').innerHTML  = document.getElementById('messages').innerHTML + '<strong>'+data.autor + ':</strong> <em>' + data.text + '</em><br>'
}

function addMessage(e){
	var payload={
		autor:document.getElementById('username').value,
		text:document.getElementById('texto').value
	};
	socket.emit('new-message', payload);
	return false;
}

socket.on('connectToRoom',function(data) {
    console.log(data);
});

socket.on('SalasInf',function(data) {
    console.log(data);
});

socket.on('numerosBaraja',function(numeroBaraja) {
	console.log(numeroBaraja);
});

socket.on('EstadoPartida',function(numeroBaraja) {
	console.log(numeroBaraja);
});

socket.on('Conteo',function(numeroBaraja) {
	console.log(numeroBaraja);
});

socket.on('jugada',function(data) {
	console.log(data);
});

socket.on('GameOver',function(data) {
	console.log(data);
});