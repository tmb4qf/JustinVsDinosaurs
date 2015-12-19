var socket = io();
var myPlayer;

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

socket.on('countdown', function(timer){
	$('#header').animate({opacity: 0}, 500);
	menu.height(window.innerHeight);
	menu.html('<div class="huge">' + timer-- + '</div>');
	var clock = setInterval(function(){
		if(timer == 0){
			clearInterval(clock);
			menu.html('<div class="huge">Go!</div>').fadeIn(200, function(){
				menu.remove();
				$('#header').remove();
			}).remove();
		}
		else
			menu.html('<div class="huge">' + timer-- + '</div>').fadeIn(200);
	}, 1000);
});

socket.on('frame', function(){
	console.log("Frame");
})
