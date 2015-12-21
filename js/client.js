var socket = io();
var myPlayer;

var canvasWidth;
var canvasHeight;
var scaleWidth;
var scaleHeight;
var canvas;
var ctx;

var constant = {
	goodGuySize: 20,
	badGuySize: 10,
	bulletSize: 5,
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
	
	var windowRatio = window.innerWidth / window.innerHeight;
	var gameRatio = constant.width / constant.height;
	
	if(windowRatio < gameRatio){ //use full width
		canvasWidth = window.innerWidth;
		canvasHeight = canvasWidth / gameRatio;
		
		$('body').html('<canvas id="canvas" width="'+ canvasWidth +'" height="'+ canvasHeight+'"></canvas>').css({'overflow':'hidden', 'background-color': '#FFFFFF'});
		
		var extraHeight = window.innerHeight - canvasHeight;
		
		$('#canvas').css({'background-color': '#5A1D0E', 'margin-top': extraHeight/2});
	}
	else{ //use full height
		canvasHeight = window.innerHeight;
		canvasWidth = canvasHeight * gameRatio;
		
		$('body').html('<canvas id="canvas" width="'+ canvasWidth +'" height="'+ canvasHeight+'"></canvas>').css({'overflow':'hidden', 'background-color': '#FFFFFF'});
		
		var extraWidth = window.innerWidth - canvasWidth;
		
		$('#canvas').css({'background-color': '#5A1D0E', 'margin-left': extraWidth/2});
	}
	
	scaleWidth = canvasWidth / constant.width;
	scaleHeight = canvasHeight / constant.height;
	
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext("2d");
}

socket.on('countdown', function(timer){
	$('#header').animate({opacity: 0}, 500);
	setupCanvas();
	
	ctx.font = "100px Monospace";
	ctx.fillStyle = "white";
	ctx.textAlign = "center";
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	ctx.fillText(timer--, canvasWidth/2, canvasHeight/2);
	
	var clock = setInterval(function(){
		if(timer == 0){
			clearInterval(clock);
			ctx.clearRect(0, 0, canvasWidth, canvasHeight);
			ctx.fillText("Go!", canvasWidth/2, canvasHeight/2);
		}
		else{
			ctx.clearRect(0, 0, canvasWidth, canvasHeight);
			ctx.fillText(timer--, canvasWidth/2, canvasHeight/2);
		}
	}, 1000);
});

socket.on('frame', function(goodGuys, badGuys, bullets, secs){
	var i = 0;
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	ctx.fillStyle = constant.badGuyColor;
	var badGuyLen = badGuys.length;
	for(i = 0; i < badGuyLen; i++){
		ctx.beginPath();
		ctx.arc(badGuys[i].x * scaleWidth, badGuys[i].y * scaleHeight, constant.badGuySize, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.fill();
	}
	
	var goodGuyLen = goodGuys.length;
	for(i = 0; i < goodGuyLen; i++){
		if(goodGuys[i].alive == true){
			ctx.fillStyle = goodGuys[i].color;
			ctx.beginPath();
			ctx.arc(goodGuys[i].x * scaleWidth, goodGuys[i].y * scaleHeight, constant.goodGuySize, 0, 2 * Math.PI);
			ctx.stroke();
			ctx.fill();
		}
	}
	
	ctx.fillStyle = constant.bulletColor;
	var bulletLen = bullets.length;
	for(i = 0; i < bulletLen; i++){
		ctx.beginPath();
		ctx.arc(bullets[i].x * scaleWidth, bullets[i].y * scaleHeight, constant.bulletSize, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.fill();
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
