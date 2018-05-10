'use strict'

var express = require('express');
var bodyParser= require('body-parser');

var app=express();

//Cargar rutas
/*var estadio_rutas = require('./rutas/estadio');
var usuario_rutas = require('./rutas/usuario');
var arbitro_rutas = require('./rutas/arbitro');
var dt_rutas = require('./rutas/dt');
var equipo_rutas = require('./rutas/equipo');
var liga_rutas = require('./rutas/liga');
var temporada_rutas = require('./rutas/temporada');
var jugador_rutas = require('./rutas/jugador');
var jornada_rutas = require('./rutas/jornada');
var gol_rutas = require('./rutas/gol');
var tarjeta_rutas = require('./rutas/tarjeta');
var noticia_rutas = require('./rutas/noticia');*/

//middlewares de body-parser
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Configurar cabeceras y cors
app.use((req,res,next)=>{
	res.header('Access-Control-Allow-Origin','*');
	res.header('Access-Control-Allow-Headers','Authorization,X-API-KEY,Origin,X-Requested-With,Content-Type,Accept, Access-Control-Allow-Request-Method');
	res.header('Access-Control-Allow-Methods','GET,POST,OPTIONS,PUT,DELETE');
	res.header('Allow','GET,POST,OPTIONS,PUT,DELETE');
	next();
});

//rutas base body-parser
//app.use('/api',usuario_rutas, estadio_rutas,arbitro_rutas,dt_rutas,equipo_rutas,liga_rutas,temporada_rutas,jugador_rutas,jornada_rutas,gol_rutas,tarjeta_rutas,noticia_rutas);

module.exports = app;