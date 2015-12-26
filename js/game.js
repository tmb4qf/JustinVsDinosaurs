var constant = {
	frameRate : 30,
	goodGuySize: 20,
	badGuySize: 10,
	bulletSize: 5,
	goodGuySpeed : 5,
	badGuySpeed : 4,
	bulletSpeed : 15,
	width: 1200,
	height: 700,
	reestablishTargetFrequency: 30
};

var dir = {UP: 1, RIGHT: 2, DOWN: 3, LEFT: 4, NONE: 5};

function Game(key)
{
	this.secs = 0;
	this.framesThisWave = 0;
	this.key = key;
	this.players = [];
	this.badGuys = [];
	this.goodGuys = [];
	this.bullets = [];
	this.numAlive;
	
	this.colorID = 0;
	this.colors = ['#0008FF', '#FF1919', '#FFFF1F', '#00D100', '#FF9900', '#00FFFF', '#007504', '#E100FF', '#FF8FB4', '#828174'];
	
	this.createBadGuys(5);
}

Game.prototype.getColor = function(){
	var color = this.colors[this.colorID++];
	
	if(this.colorID >= this.colors.length)
		this.colorID = 0;
	
	return color;
}

Game.prototype.checkDeath = function()
{
	var goodGuyLen = this.goodGuys.length;
	for(var i=0; i<goodGuyLen; i++){
		if(this.goodGuys[i].alive){
			var badGuyLen = this.badGuys.length;
			for(var j = 0; j < badGuyLen; j++){
				if(Math.abs(this.badGuys[j].x - this.goodGuys[i].x) < constant.goodGuySize && Math.abs(this.badGuys[j].y - this.goodGuys[i].y) < constant.goodGuySize)
				{
					this.goodGuys[i].alive = false;
					this.goodGuys[i].deathTime = this.secs;
					this.numAlive--;
					return true;
				}
			}
		}
	}
	
	if(this.numAlive == 0){
		return false;
	}
	else{
		return true;
	}
}

Game.prototype.createBadGuys = function(num)
{
	for(var i=0; i<num; i++){
		var rand = Math.floor(Math.random() * 4);
		var x, y;
		
		switch (rand){
			case 0:
				x = 0;
				y = Math.random() * constant.height;
				break;
			case 1:
				x = constant.width;
				y = Math.random() * constant.height;
				break;
			case 2:
				x = Math.random() * constant.width;
				y = 0;
				break;
			case 3:
				x = Math.random() * constant.width;
				y = constant.height;
				break;
		}
		
		this.badGuys.push(new BadGuy(x,y));
	}
}

Game.prototype.update = function()
{
	this.updateGoodGuys();
	this.updateBadGuys();
	this.updateBullets();
}

Game.prototype.updateGoodGuys = function()
{
	var len = this.goodGuys.length;
	for(var i = 0; i < len; i++)
	{
		var goodGuy = this.goodGuys[i];
		if(goodGuy.dir == dir.LEFT && validMove(goodGuy, dir.LEFT))
			goodGuy.x -= constant.goodGuySpeed;
		else if(goodGuy.dir == dir.RIGHT && validMove(goodGuy, dir.RIGHT))
			goodGuy.x += constant.goodGuySpeed;
		else if(goodGuy.dir == dir.UP && validMove(goodGuy, dir.UP))
			goodGuy.y -= constant.goodGuySpeed;
		else if(goodGuy.dir == dir.DOWN && validMove(goodGuy, dir.DOWN))
			goodGuy.y += constant.goodGuySpeed;
	}
}

Game.prototype.updateBadGuys = function()
{
	var len = this.badGuys.length;
	for(var i = 0; i < len; i++)
	{
		var badGuy = this.badGuys[i];
		var goodGuy = this.goodGuys[badGuy.target];
		
		var deltaX = Math.abs(goodGuy.x - badGuy.x);
		var deltaY = Math.abs(goodGuy.y - badGuy.y);
		var rand = Math.random();
			
		if(deltaX < 3 || (rand > .5 && deltaY > 3)){
			if(badGuy.y < goodGuy.y)
				badGuy.y += badGuy.speed;//constant.badGuySpeed;
			else
				badGuy.y -= badGuy.speed;//constant.badGuySpeed;
		}
		else{
			if(badGuy.x < goodGuy.x)
				badGuy.x += badGuy.speed;//constant.badGuySpeed;
			else
				badGuy.x -= badGuy.speed;//constant.badGuySpeed;
		}
		
	}
}

Game.prototype.reestablishTargets = function(){
	var len = this.badGuys.length;
	for(var i = 0; i < len; i++){
		var badGuy = this.badGuys[i];
		var min;
		var index = -1;
		
		for(var j = 0; j < this.goodGuys.length; j++)
		{
			var goodGuy = this.goodGuys[j];
			if(goodGuy.alive == true)
			{
				var dist = Math.sqrt(Math.pow(goodGuy.x - badGuy.x, 2) + Math.pow(goodGuy.y - badGuy.y, 2));
				if(dist < min || index == -1)
				{
					index = j;
					min = dist;
				}
			}
		}
		if(index != -1){
			badGuy.target = index;
		}
	}
}

Game.prototype.updateBullets = function()
{
	for(var i = 0; i < this.bullets.length; i++)
	{
		var bullet = this.bullets[i];
		bullet.move();
		var bulletKill = false;
		
		for(var j=0; j<this.badGuys.length; j++)
		{
			var badGuy = this.badGuys[j];
			if(Math.abs(bullet.x - badGuy.x) < constant.badGuySize && Math.abs(bullet.y - badGuy.y) < constant.badGuySize)
			{
				this.bullets.splice(i,1);

				this.goodGuys[bullet.source].kills++;
				i--;
				bulletKill = true;
				this.badGuys.splice(j,1);
				j--;
				break;
			}
		}
		
		if(!bulletKill && (bullet.x < 0 || bullet.x > constant.width || bullet.y < 0 || bullet.y > constant.height))
		{
			this.bullets.splice(i,1);
			i--;
		}
	}
}

function GoodGuy(color, name)
{
	this.x;
	this.y;
	this.dir = dir.NONE;
	this.color = color;
	this.name = name;
	this.alive = true;
	this.kills = 0;
	this.deathTime;
	this.numBullets = 0;
}

function BadGuy(x,y)
{
	this.x = x;
	this.y = y;
	this.target;
	var rand = Math.floor(Math.random() * 3);
	if(rand == 0)
		this.speed = 2.75;
	else if(rand == 1)
		this.speed = 3;
	else if(rand ==2)
		this.speed = 3.25;
}

function Bullet(x,y,dir, source)
{
	this.x = x;
	this.y = y;
	this.dir = dir;
	this.source = source;
}

Bullet.prototype.move = function(){
	switch(this.dir){
		case dir.LEFT:
			this.x -= constant.bulletSpeed;
			break;
		case dir.RIGHT:
			this.x += constant.bulletSpeed;
			break;
		case dir.UP:
			this.y -= constant.bulletSpeed;
			break;
		case dir.DOWN:
			this.y += constant.bulletSpeed;
			break;
	}
}

function validMove(person, direction)
{
	if(direction == dir.LEFT && person.x > 25)
		return true;
	
	if(direction == dir.RIGHT && person.x < (constant.width - 25))
		return true;
	
	if(direction == dir.UP && person.y > 25)
		return true;
	
	if(direction == dir.DOWN && person.y < (constant.height - 25))
		return true;
	
	return false;
}

module.exports.Game = Game;
module.exports.GoodGuy = GoodGuy;
module.exports.BadGuy = BadGuy;
module.exports.Bullet = Bullet;
module.exports.constants = constant;