var socket = io();
var myPlayer;

var canvasWidth;
var canvasHeight;
var scaleWidth;
var scaleHeight;
var canvas;
var ctx;

var constant = {
	goodGuySize: 15,
	badGuySize: 8,
	bulletSize: 4,
	badGuyColor: '#FB4848',
	badGuyBorder: '#FF1414',
	bulletColor: '#F2F2F2',
	width: 1200,
	height: 700,
	frameLength: 12
};

var dir = {UP: 1, RIGHT: 2, DOWN: 3, LEFT: 4, NONE: 5};

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

socket.on('joined', function(player, host){
	myPlayer = player;
	myPlayer.host = host;
});

socket.on('invalidKey', function(){
	if($('.error').length)
		$('.error').html('This key is invalid. Please try again.');
	else
		$('#menu').append('<div class="error">This key is invalid. Please try again.</div>');
});

socket.on('inPlayError', function(){
	if($('.error').length)
		$('.error').html('This game is currently in play. Please wait until game is over and try again.');
	else
		$('#menu').append('<div class="error">This game is currently in play. Please wait until game is over and try again.</div>');
});

function startGame(){
	if(myPlayer.host){
		socket.emit('startGame', myPlayer.gameID);
	}
}

function hostAgain(){
	if(myPlayer.host){
		socket.emit('hostAgain', myPlayer.gameID);
	}
}

function joinAgain(){
	$('#hostStatus').fadeOut(100);
	socket.emit('joinAgain', myPlayer.gameID);
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
		if(badGuys[i].speed == 2.75)
			ctx.fillStyle = '#FF9696';
		else if(badGuys[i].speed == 3)
			ctx.fillStyle = constant.badGuyColor;
		else if (badGuys[i].speed == 3.25)
			ctx.fillStyle = '#FF1212';
		
		ctx.beginPath();
		ctx.arc(badGuys[i].x * scaleWidth, badGuys[i].y * scaleHeight, constant.badGuySize * scaleWidth, 0, 2 * Math.PI);
		ctx.fill();
	}
	
	var goodGuyLen = goodGuys.length;
	for(i = 0; i < goodGuyLen; i++){
		if(goodGuys[i].alive == true){
			ctx.fillStyle = goodGuys[i].color;
			ctx.beginPath();
			ctx.arc(goodGuys[i].x * scaleWidth, goodGuys[i].y * scaleHeight, constant.goodGuySize * scaleWidth, 0, 2 * Math.PI);
			
			if(myPlayer.index == i){
				ctx.lineWidth = 7;
				ctx.strokeStyle = '#FFFFFF';
			}
			else{
				ctx.lineWidth = 7;
				ctx.strokeStyle = goodGuys[i].color;
			}
			
			ctx.stroke();
			ctx.fill();
		}
	}
	
	ctx.fillStyle = constant.bulletColor;
	var bulletLen = bullets.length;
	for(i = 0; i < bulletLen; i++){
		ctx.beginPath();
		ctx.arc(bullets[i].x * scaleWidth, bullets[i].y * scaleHeight, constant.bulletSize * scaleWidth, 0, 2 * Math.PI);
		ctx.fill();
	}
	
	ctx.font = "20px Monospace";
	ctx.fillStyle = "white";
	ctx.textAlign = "right";
	ctx.fillText("Total Time: " + secs + " secs.", canvasWidth - 10, 20);
	ctx.fillText("Next Wave: " + (constant.frameLength - (secs % constant.frameLength)) + " secs.", canvasWidth - 10, 40);
});

socket.on('gameOver', function(game){
	$('body').append('<div id="overlay"></div><div class="modal"></div>');
	game.goodGuys.sort(function(a,b){return a.deathTime - b.deathTime});
	
	var modalHtml = '<div class="container" id="leftContainer">';
	modalHtml += '<div class="messageDiv"><table id="statsTable"><tr><td>Name</td><td>Time</td><td>Kills</td><td>Bullets</td></tr>';
	
	for(var i = 0; i < game.goodGuys.length; i++){
		modalHtml += '<tr><td style="color:'+game.goodGuys[i].color+';">' + game.goodGuys[i].name + '</td><td>' + game.goodGuys[i].deathTime + '</td><td>' + game.goodGuys[i].kills + '</td><td>' + game.goodGuys[i].numBullets + '</td></tr>';
	}
	
	modalHtml += '</table></div></div>';
	
	if(myPlayer.host){
		modalHtml += '<div class="container" id="rightContainer"><div class="messageDiv" id="hostStatus">Would you like to host another game?<br/><br/><button class="startGameButton hostButtonFocus" onclick="hostAgain()">Host</button></div>';
	}
	else{
		modalHtml += '<div class="container" id="rightContainer"><div class="messageDiv" id="hostStatus">Waiting for host to join again.</div>';
	}
	
	modalHtml += '<div class="messageDiv" id="newPlayerList"></div></div>';
	$('.modal').html(modalHtml);
	$('#newPlayerList').hide();
});

socket.on('newJoinee', function(players){
	if($('#newPlayerList').length){
		$('#newPlayerList').show();
		
		if(myPlayer.host){
			$('#hostStatus').html('Start the game when all paleontologists have joined. <br/><br/><p class="heading">Key: '+ myPlayer.gameID +'</p><button class="startGameButton startButtonFocus" onclick="startGame()" id="startButton">Start Game</button>');
		}
		else{
			$('#hostStatus').html('Host wants to play another game. Would you like to join? <br/><br/><button class="startGameButton joinButtonFocus" onclick="joinAgain()" id="joinButton">Join</button>');
		}
		
		var newHtml = '<p class="heading">Paleontologists</p><ul>';
		for(var i = 0; i < players.length; i++){
			newHtml += '<li class="bold" style="color:' + players[i].color + ';">' + players[i].name + '</li>';
		}	
		newHtml += '</ul>';
		$('#newPlayerList').html(newHtml);
	}else{
		$('#menu').width(window.innerWidth * .6).hide();
		$('#menu').height(window.innerHeight - $('#header').height());
		var newHtml = '<div id="instructions" class="panel">';
		
		if(myPlayer.host){
			newHtml += 'You are the host of this game. This key will allow friends to join your game. Start the game when all paleontologists have joined.<br/><br/> <p class="heading">Key:'+ myPlayer.gameID +'</p><button class="startGameButton startButtonFocus" onclick="startGame()">Start Game</button></div>';
		}
		else{
			newHtml += 'Waiting for paleontologists to join...</div>';
		}
		
		newHtml += '<div id="playerList" class="panel"><p class="heading">Paleontologists</p><ul>';
		for(var i = 0; i < players.length; i++){
			newHtml += '<li class="bold" style="color:' + players[i].color + ';">' + players[i].name + '</li>';
		}	
		newHtml += '</ul></div>';
		$('#menu').html(newHtml).fadeIn(200);		
	}
});

socket.on('hostDisconnect', function(){
	$('#hostStatus').html('Host has left the game.');
});

$(document).keydown(function(e){
	if(e.which == 13){
		if($('.hostButtonFocus').length){
			if($('.modal').length)
				hostAgain();
			else
				host();
		}
		else if($('.joinButtonFocus').length){
			if($('.modal').length)
				joinAgain();
			else
				join();
		}
		else if($('.startButtonFocus').length){
			startGame();
		}
	}
	else if(myPlayer){
		switch (e.which){
			case 87:
				socket.emit('bullet', dir.UP, myPlayer.gameID, myPlayer.index);
				break;
			case 65:
				socket.emit('bullet', dir.LEFT, myPlayer.gameID, myPlayer.index);
				break;
			case 83:
				socket.emit('bullet', dir.DOWN, myPlayer.gameID, myPlayer.index);
				break;
			case 68:
				socket.emit('bullet', dir.RIGHT, myPlayer.gameID, myPlayer.index);
				break;
			case 37:
				socket.emit('keyPress', dir.LEFT, myPlayer.gameID, myPlayer.index);
				break;
			case 38:
				socket.emit('keyPress', dir.UP, myPlayer.gameID, myPlayer.index);
				break;
			case 39:
				socket.emit('keyPress', dir.RIGHT, myPlayer.gameID, myPlayer.index);
				break;
			case 40:
				socket.emit('keyPress', dir.DOWN, myPlayer.gameID, myPlayer.index);
				break;
			case 32:
				socket.emit('keyPress', dir.NONE, myPlayer.gameID, myPlayer.index);
				break;
		}
	}
});
