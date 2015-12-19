var consts = {
	frameRate : 30,
	goodGuySpeed : 5 * (1 / this.frameRate),
	badGuySpeed : 3 * (1 / this.frameRate),
	bulletSpeed : 15 * (1 / this.frameRate),
	badGuyColor : '#FF3B3B',
	bulletColor : '#F2F2F2',
	width: 1200,
	height: 700
};

var dir = {UP: 1, RIGHT: 2, DOWN: 3, LEFT: 4};

function Game(key)
{
	this.key = key;
	this.players = [];
	this.badGuys = [];
	this.goodGuys = [];
	this.bullets = [];
	this.numAlive;
	
	this.colorID = 0;
	this.colors = ['#0000CC', '#FF0000', '#FFFF00', '#00CC00', '#FF9900', '#FFFFFF', '#CC00FF', '#00FFFF', '#FF6699', '#6200FF'];
	
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
	var len1 = this.goodGuys.length;
	for(var i=0; i<len1; i++)
	{
		if(this.goodGuys[i].alive)
		{
			var len2 = this.badGuys.length;
			for(var j = 0; j < len2; j++)
			{
				if(Math.abs(this.badGuys[j].x - this.goodGuys[i].x) < 15 && Math.abs(this.badGuys[j].y - this.goodGuys[i].y) < 15)
				{
					this.goodGuys[j].alive = false;
					this.numAlive--;
					break;
				}
			}
		}
	}
	
	if(this.numAlive == 0)
	{
		socket.emit('gameOver');
	}
}

Game.prototype.createBadGuys = function(num)
{
	for(var i=0; i<num; i++)
	{
		var rand = Math.floor(Math.random() * 4);
		var x, y;
		
		switch (rand)
		{
			case 0:
				x = 0;
				y = Math.random() * consts.height;
				break;
			case 1:
				x = consts.width;
				y = Math.random() * consts.height;
				break;
			case 2:
				x = Math.random() * consts.width;
				y = 0;
				break;
			case 3:
				x = Math.random() * consts.width;
				y = consts.height;
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
	this.checkDeath();
}

Game.prototype.updateGoodGuys = function()
{
	var len = this.goodGuys.length;
	for(var i = 0; i < len; i++)
	{
		if(this.dir == dir.LEFT && validMove(this, dir.LEFT))
			this.x -= consts.goodGuySpeed;
		else if(this.dir == dir.RIGHT && validMove(this, dir.RIGHT))
			this.x += consts.goodGuySpeed;
		else if(this.dir == dir.UP && validMove(this, dir.UP))
			this.y -= consts.goodGuySpeed;
		else if(this.dir == dir.DOWN && validMove(this, dir.DOWN))
			this.y += consts.goodGuySpeed;
	}
}

Game.prototype.updateBadGuys = function()
{
	var len = this.badGuys.length;
	for(var i = 0; i < len; i++)
	{
		if(Math.random() > .5)
		{
			var min;
			var index = -1;
			for(var j = 0; j < this.goodGuys.length; j++)
			{
				var goodGuy = this.goodGuys[j];
				if(goodGuy.alive == true)
				{
					var dist = Math.sqrt(Math.pow(goodGuy.x - this.x, 2) + Math.pow(goodGuy.y - this.y, 2));
					if(dist < min || index == -1)
					{
						index = j;
						min = dist;
					}
				}
			}
			
			var goodX = this.goodGuys[index].x;
			var goodY = this.goodGuys[index].y;
			var rand = Math.random();
			
			if(rand > .5 && this.x < goodX)
				this.x += consts.badGuySpeed;
			else if(rand > .5)
				this.x -= consts.badGuySpeed;
			else if(this.y < goodY)
				this.y += consts.badGuySpeed;
			else
				this.y -= consts.badGuySpeed;
		}
	}
}

Game.prototype.updateBullets = function()
{
	var len = this.bullets.length;
	for(var i = 0; i < len; i++)
	{
		this.bullets[i].move();
		if(this.bullets[i].x < 0 || this.bullets[i].x > consts.width || this.bullets[i].y < 0 || this.bullets[i].y > consts.height)
		{
			this.bullets.splice(i,1);
			len--;
			i--;
		}
		
		var len2 = this.badGuys.length;
		for(var j=0; j<len2; j++)
		{
			var badGuy = this.badGuys[j];
			if(Math.abs(x - badGuy.x) < 10 && Math.abs(y - badGuy.y) < 10)
			{
				this.badGuys.splice(j,1);
				len2--;
				j--;
			}
		}
	}
}

function GoodGuy(color)
{
	this.x;
	this.y;
	this.speed = consts.goodGuySpeed;
	this.dir;
	this.color = color;
	this.alive = true;
}

function BadGuy(x,y)
{
	this.x = x;
	this.y = y;
	this.speed = consts.badGuySpeed;
}

function Bullet()
{
	this.x = x;
	this.y = y;
	this.speed = consts.bulletSpeed;
}

function validMove(person, dir)
{
	if(dir == dir.LEFT && person.x > 25)
		return true;
	
	if(dir == dir.RIGHT && person.x < (consts.width - 25))
		return true;
	
	if(dir == dir.UP && person.y > 25)
		return true;
	
	if(dir == dir.DOWN && person.y < (consts.height - 25))
		return true;
	
	return false;
}

module.exports.Game = Game;
module.exports.GoodGuy = GoodGuy;
module.exports.BadGuy = BadGuy;
module.exports.Bullet = Bullet;
module.exports.constants = consts;