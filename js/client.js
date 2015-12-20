var socket = io();
var myPlayer;

var canvasWidth;
var canvasHeight;
var scaleWidth;
var scaleHeight;
var canvas;
var ctx;

var constant = {
	frameRate : 30,
	goodGuySize: 30,
	badGuySize: 15,
	bulletSize: 10,
	badGuyColor: '#FF3B3B',
	bulletColor: '#F2F2F2',
	width: 1200,
	height: 700
};

var dir = {UP: 1, RIGHT: 2, DOWN: 3, LEFT: 4};

function Player(name){
	this.host;
	this.socketID = socketID;
	this.gameID = gameID;
	this.index = index;
	this.name = name;
}

function host(){
	var name = $('#name').val();
	socket.emit('host', name);
}

function join(){
	var name = $('#name').val();
	var key = $('#key').val();
	socket.emit('join', name, key);
}

socket.on('playerList', function(key, players){
	menu.width(window.innerWidth * .6).hide();
	menu.height(window.innerHeight - $('#header').height());
	var newHtml = '<div id="instructions" class="panel">';
	
	if(myPlayer.host)
		newHtml += 'You are the host of this game. This key will allow friends to join your game. Start the game when all players have joined.<br/> <p class="heading">Key:'+ key +'</p><button id="startGameButton" onclick="startGame()">Start Game</button><br/><br/><br/>';
	
	newHtml += 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</div>';
	newHtml += '<div id="playerList" class="panel"><p class="heading">Players</p><ul>';
	for(var i = 0; i < players.length; i++){
		newHtml += '<li class="bold" style="color:' + players[i].color + ';">' + players[i].name + '</li>';
	}	
	newHtml += '</ul></div>';
	menu.html(newHtml).fadeIn(600);
});

socket.on('joined', function(player, host){
	myPlayer = player;
	myPlayer.host = host;
});

socket.on('invalidKey', function(){
	var addedHtml = '<div class="error">This key is invalid. Please try again.</div>';
	menu.append(addedHtml);
});

function startGame(){
	if(myPlayer.host){
		socket.emit('startGame', myPlayer.gameID);
	}
}

function setupCanvas(){
	cavansWidth = window.innerWidth;
	canvasHeight = window.innerHeight;
	scaleWidth = canvasWidth / constant.width;
	scaleHeight = canvasHeight / constant.height;
	
	$('body').html('<canvas id="canvas" width="'+ canvasWidth +'" height="'+ canvasHeight+'"></canvas>');
	
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext("2d");
}

socket.on('countdown', function(timer){
	$('#header').animate({opacity: 0}, 500);
	menu.height(window.innerHeight);
	menu.html('<div class="huge">' + timer-- + '</div>');
	var clock = setInterval(function(){
		if(timer == 0){
			clearInterval(clock);
			setupCanvas();
		}
		else
			menu.html('<div class="huge">' + timer-- + '</div>').fadeIn(200);
	}, 1000);
});

socket.on('frame', function(goodGuys, badGuys, bullets, secs){
	var i = 0;
	
	context.fillStyle = constant.badGuyColor;
	context.fill();
	var badGuyLen = badGuys.length;
	for(i = 0; i < badGuyLen; i++){
		context.beginPath();
		context.arc(badGuys[i].x, badGuys[i].y, constant.badGuySize, 0, 2 * Math.PI);
		context.stroke();
	}
	
	var goodGuyLen = goodGuys.length;
	for(i = 0; i < goodGuyLen; i++){
		if(game.goodGuys[i].alive == true){
			context.fillStyle = goodGuys[i].color;
			context.fill();
			context.beginPath();
			context.arc(goodGuys[i].x, goodGuys[i].y, constant.goodGuySize, 0, 2 * Math.PI);
			context.stroke();
		}
	}
	
	context.fillStyle = constant.bulletColor;
	context.fill();
	var bulletLen = bullets.length;
	for(i = 0; i < bulletLen; i++){
		context.beginPath();
		context.arc(bullets[i].x, bullets[i].y, constant.bulletSize, 0, 2 * Math.PI);
		context.stroke();
	}
});

$(document).keydown(function(e){
	if(myPlayer){
		if(e.which == 87)
			socket.emit('bullet', dir.UP, myPlayer.gameID, myPlayer.index);
		else if(e.which == 65)
			socket.emit('bullet', dir.LEFT, myPlayer.gameID, myPlayer.index);
		else if(e.which == 83)
			socket.emit('bullet', dir.DOWN, myPlayer.gameID, myPlayer.index);
		else if(e.which == 68)
			socket.emit('bullet', dir.RIGHT, myPlayer.gameID, myPlayer.index);
		else if(e.which == 37)
			socket.emit('keyPress', dir.LEFT, myPlayer.gameID, myPlayer.index);
		else if(e.which == 38)
			socket.emit('keyPress', dir.UP, myPlayer.gameID, myPlayer.index);
		else if(e.which == 39)
			socket.emit('keyPress', dir.RIGHT, myPlayer.gameID, myPlayer.index);
		else if(e.which == 40)
			socket.emit('keyPress', dir.DOWN, myPlayer.gameID, myPlayer.index);
	}
});
