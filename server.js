var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var core = require('./js/game.js');
var constant = core.constants;
var dir = {UP: 1, RIGHT: 2, DOWN: 3, LEFT: 4};

server.listen(8080, function(){
	console.log("Let's Go!");
});

app.get('/', function(req, res){
	res.status(200);
	res.sendFile(__dirname + '/index.html');
});

app.get('/css/style.css', function(req, res){
	res.status(200);
	res.sendFile(__dirname + '/css/style.css');
});

app.get('/images/:img', function(req, res){
	res.status(200);
	res.sendFile(__dirname + '/images/' + req.params.img); 
});

app.get('/js/:jsFile', function(req, res){
	res.status(200);
	res.sendFile(__dirname + '/js/' + req.params.jsFile);
});


//global vars
var games = [];
var inPlayGames = [];

function Player(socketID, gameID, index, name, color){
	this.socketID = socketID;
	this.gameID = gameID;
	this.index = index;
	this.name = name;
	this.color = color;
}

io.on('connection', function(socket){
	socket.on('host', function(name){
		var key = generateKey();
		var newGame = new core.Game(key);
		var color = newGame.getColor();
		
		var newPlayer = new Player(socket.id, key, 0, name, color);
		newGame.players.push(newPlayer);
		
		var newGoodGuy = core.GoodGuy(color);
		newGame.goodGuys.push(newGoodGuy);
		games.push(newGame);
		
		socket.join(key);
		io.to(socket.id).emit('joined', newPlayer, true);
		io.to(key).emit('playerList', key, newGame.players);
	});
	
	socket.on('join', function(name, key){
		var game = findGame(key);
		if(game){
			var game = games[i];
			var color = game.getColor();
			
			var newPlayer = new Player(socket.id, key, game.players.length, name, color);
			game.players.push(newPlayer);
			
			var newGoodGuy = core.GoodGuy(color);
			game.goodGuys.push(newGoodGuy);
			
			socket.join(key);
			io.to(socket.id).emit('joined', newPlayer, false);
			io.to(key).emit('playerList', key, game.players);
		}
		else{
			io.to(socket.id).emit('invalidKey');
		}
	});
	
	socket.on('startGame', function(key){
		var game = findGame(key);
		if(game){
			io.to(key).emit('countdown', 5);
			setTimeout(function(){
				inPlayGames.push(game);
			}, 5500);
			
			var len = game.goodGuys.length;
			var position = [0,-1,1,-2,2];
			var rowCount = 0;
			var columnCount = 0;
			
			for(var i = 0; i < len; i++){
				game.goodGuys[i].x = constant.width / 2 + position[columnCount++] * 100;
				game.goodGuys[i].y = constant.height / 2 + position[rowCount++] * 100;
				
				if(columnCount == position.length)
					columnCount = 0;
				if(rowCount == position.length)
					rowCount = 0;
			}
		}
	});
	
	socket.on('keyPress', function(dir, gameID, index){
		var game = findInPlayGame(gameID);
		if(game){
			game.goodGuys[index].dir = dir;
		}
	});
	
	socket.on('bullet', function(dir, gameID, index){
		var game = findInPlayGame(gameID);
		if(game && game.goodGuys[index].alive == true){
			var bullet = new core.Bullet(game.goodGuys[index].x, game.goodGuys[index].y, dir);
			game.bullets.push(bullet);
		}
	});
});

var gameLoop = setInterval(function(){
	var len = inPlayGames.length;
	for(var i = 0; i < len; i++){
		inPlayGames[i].update();
		io.to(inPlayGames[i].key).emit('frame');
	}
}, 1000/constant.frameRate);

function findGame(gameID){
	var len = games.length;
	for(var i = 0; i < len; i++){
		if(gameID == games[i].key);
			return games[i];
	}
	
	return false;
}

function findInPlayGame(gameID){
	var len = inPlayGames.length;
	for(var i = 0; i < len; i++){
		if(gameID == inPlayGames[i].key);
			return inPlayGames[i];
	}
	
	return false;
}

function generateKey(){
	var key = '';
	var alphaNum = ['0','1','2','3','4','5','6','7','8','9'];
	
	for(var i = 0 ; i < 5; i++)
	{
		var character = alphaNum[Math.floor(Math.random() * 10)];
		key += character;
	}
	
	return key;
}