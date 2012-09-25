var upPressed = false;
var downPressed = false;
var leftPressed = false;
var rightPressed = false;
var debugSpeed = false;
var balloon = false;
var upPressedNow = false;
var isGrounded = false;

function pad(number, length) {
   
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
   
    return str;

}
function cache(event, b) {
	var triggered = false;
	
	switch(event.which) {
		case 37:
			leftPressed = b;
			triggered = true;
			 break;
		case 38:
			upPressed = b;
			triggered = true;
			
			break;
		case 39:
			rightPressed = b;
			triggered = true;
			break;
		case 40:
			downPressed = b;
			triggered = true;
			break;
		case 70:
			debugSpeed = b;
			triggered = true;
			break;
		case 32:
			balloon = b;
			triggered = true;
			break;
		
	}
	return !triggered;
};

function teleport(x,y)
{
	player.x = x;
	player.y = y;
	player.vx = 0;
	player.vy = 0;
}

document.onkeypress = function(event) {
	if(event.which == 106) {
		var s = prompt("Where do you wanna go?");

		var grp = (/(\d*)(n|s)(\d*)(w|e)/).exec(s);
		var x = 0;
		var y = 0;
		
		if(grp[4] == "w")
			x = -parseInt(grp[3]);
		else if(grp[4] == "e")
			x = parseInt(grp[3]);

		if(grp[2] == "n")
			y = -parseInt(grp[1]);
		else if(grp[2] == "s")
			y = parseInt(grp[1])-1;
			
		player.x = x*2048;
		player.y = y*2048;
	}
	
	if(event.which == 105) {
		var s = prompt("Teleport: Where do you want to go (0-9)?: "+player.x+" > "+player.y);
		
		switch(s)
		{
			case '0':
				teleport(8879,35460); // ufo
			break;
			case '1':
				teleport(26033,120); // ship under bridge
			break;
			case '2':
				teleport(53691,-11750); // huge tower
			break;
			case '3':
				teleport(3529,-17703); // flying rocket
			break;
			case '4':
				teleport(1065,-25550); // whale
			break;
			case '5':
				teleport(-45210,-2350); // rocket
			break;
			case '6':
				teleport(-18620,-298); // rocket
			break;
			case '7':
				teleport(-35141,1084); // cave1
			break;
			case '8':
				teleport(-34495,16207); // cave fighter
			break;
			case '9':
				teleport(-5835,28077); // cave place
			break;
			case '-1':
				teleport(97724,-490); // end of the world?
			break;
		}

	}
};

document.onkeydown = function(event) { return cache(event, true);  };
document.onkeyup = function(event) { return cache(event, false); };

function Player() {
	var $map = $(".map");
	$map.append('<img src="man.png" style="position: relative; z-index: 20" id="stickfigure">');
	this.player = $("#stickfigure", $map);
	
	this.x = 0;
	this.y = 0;
	
	this.vx = 0;
	this.vy = 0;
	
	this.climbing = false;
	
	var lastPressed = "right";
	
	var frame = 0;
	var animation = "fall";
	
	var cnt = 0;
	
	this.centerX = function() {
		return player.player.position().left+player.player.width()/2.0;
	}
	
	this.centerY = function() {
		return player.player.position().top + player.player.height()/2.0;
	}	
	this.update = function () {
		var factor = 1;
		if(debugSpeed) {
			factor = 10;
		}
		if(!isGrounded)
			factor = 0.5;
			
		if(leftPressed) {
			
			player.vx = -8*factor;
			lastPressed = "left";
		}
		else if(rightPressed) {
			player.vx = 8*factor;
			lastPressed = "right";
		}
		else
			player.vx = 0;
		var currentClimbable = climbableAtPixel(player.centerX(), player.centerY());
		if(upPressed) {
			if(isGrounded && !this.climbing)
				player.vy = -10;

			if(balloon)
			{
				if(player.vy>-6)
					player.vy += -2;
			}
			
			if(currentClimbable) {
					player.vy = -2;
					this.climbing = true;
			}
			
		}
		else {
			if(this.climbing) {
				if(!currentClimbable)
					this.climbing = false;
				else
					this.vy = 0;
			}
		}
		
		cnt=0;//(cnt+1)%2;
		if(cnt == 0)
			this.animate();
		
		if(lastPressed != "right") {
			this.player.addClass("flip-horizontal");
		}
		else {
			this.player.removeClass("flip-horizontal");
		}
	}
	
	this.animate = function() {
		if(player.vy > 5) {
			animation = "fall"
			frame = 0;
		}
		else if(player.vy < 0) {
			frame = 0;
			animation = "air"
		}
		else if(Math.abs(player.vx) > 1) {
			if(animation == "run") {
				frame = (frame+1)%8;
			}
			else {
				frame = 0;
			}
				
			animation = "run"
		}
		else {
			if(animation == "idle") {
				frame = (frame+1)%2;
			}
			else {
				frame = 0;
			}
				
			animation = "idle"
		}
		
		var ani = "player\\man_" + animation +  "_" + pad(1+frame, 2) + ".png";
		
		this.player.attr("src", ani);
	}
}
var camx = 0.0;
var camy = 0.0;
function update() {
	player.update();
	
	updatePhysics();
	
	oldPlayerX = player.x;
	
	
	
	camx += player.vx;
	camx-=camx/5.0;
	camy += player.vy;
	camy-=camy/5.0;
		
	player.x += player.vx;
	player.y += player.vy;
	
	var x = initMapPos[0] - player.x;
	var y = initMapPos[1] - player.y;
	
	
	
	map.position()[0] = x+camx;
	map.position()[1] = y+camy;
	
	map.update();

		
	
	//player.player.offset({left: 650, top: 400});
	player.player.offset({left: 650+camx, top: 400+camy});
}

function log(){
	$.ajax({
		url:"http://halfdanj.dk/pressnmove.php",
		data: {
			a: "log",
			xpos: player.x,
			ypos: player.y
		}
	});
	
}

var groundedFrames;
function updatePhysics()
{
	if(groundedFrames==0)
		isGrounded = false;
	else
		groundedFrames--;
		
	var playerWidth = 20;
	var playerHeight = 60;
	
	if(!player.climbing)
		player.vy += 1;
	
	if(player.vy > 20) { //max fall speed
		player.vy = 20;
	}

	var dirX =player.vx>0?1:-1;
	var dirY =player.vy>0?1:-1;
	var centerHorDist = PlayerRaytrace(dirX*playerWidth/2,playerHeight/5,dirX,0,Math.abs(player.vx));
	var stopHorizontal = false;
	if(centerHorDist!=-1)
	{
	
		player.x = player.x+dirX*(centerHorDist+playerWidth/2)-dirX*playerWidth/2;
		
		player.vx = 0;
		stopHorizontal = true;
		
	}
	
	var centerVerDist = PlayerRaytrace(0,dirY*playerHeight/2,0,dirY,Math.abs(player.vy));
	if(centerVerDist != -1) {
		
		groundedFrames = 3; // we are grounded for the next 3 frames
		isGrounded = true; 
		player.vy = 0;
		
		var dist = PlayerRaytrace(-1,dirY*playerHeight/2+Math.abs(player.vy),0,-dirY,playerHeight,true);
		if(dist != -1)
		{
			player.y = player.y - (dirY*dist)+1 +dirY*centerVerDist;
			//player.vx *=0.9;
			
		}
		else
		player.y = player.y+dirY*(centerVerDist);

	}

}
function PlayerRaytrace(xoffset,yoffset,dx,dy,dist,flip) {
	if(flip == undefined)
		flip = false;
		
	var x = player.centerX()+xoffset;
	var y = player.centerY()+yoffset;
	
	var maxraytrace = 6.0; //lower this to gain performance. 10 might be too small
	
	var step = Math.ceil(dist/maxraytrace);
	
	var ground = false;
	for(i = 0;i<dist;)
	{
		ground = groundAtPixel(x+i*dx, y+i*dy);
		if((!flip && ground) || (flip && !ground))
			return i;
		//we always want to trace the first 3 pixels due to better walking
		if(i<3)
			i++;
		else
			i+=step;
	}
	return -1;

}

function PlayerFeetCollision(dx,dy) {
	var leftX = player.player.position().left+dx;
	var rightX = player.player.position().left + player.player.width()+dx;
	var y = player.player.position().top + player.player.height()+dy;
	
	if(groundAtPixel(leftX, y) || groundAtPixel(rightX, y))
		return true;
	
	return false;
}

function PlayerBodyCollision(dx,dy) {
	var leftX = player.player.position().left+dx;
	var rightX = player.player.position().left + player.player.width()+dx;
	var y = player.player.position().top + player.player.height()/2+dy;
	
	if(groundAtPixel(leftX, y) || groundAtPixel(rightX, y))
		return true;
	
	return false;
}

function climbableAtPixel(x, y) {
	return materialAtPixel(x, y) == "climbable";
}

function waterAtPixel(x, y) {
	return materialAtPixel(x, y) == "water";
}

function groundAtPixel(x, y) {
	return materialAtPixel(x, y) == "ground";
}

function materialAtPixel(x, y) {
	var img = getImageForPixel(x, y)[0];

	if(img != undefined)  {
		var splitted = img.src.substring(0, img.src.length - 4).split("/");
		
		var name = splitted[splitted.length-1];

		var localX = x - $(img).position().left;
		var localY = y - $(img).position().top;
		
		return materialAtImagePixel(name, localX, localY);
	}
	return "air";
}
	
function materialAtImagePixel(name, x, y) {
	if(document.getElementById(name) == null)
		return false; 
	var context = document.getElementById(name).getContext('2d');
	data = context.getImageData(x, y, 1, 1).data;
	if(data[0] <  50 && data[1] < 50 && data[2] < 50)
		return "ground";
	if(data[0] < 50 && data[1] > 50 && data[2] <  50 )
		return "climbable";
	if(data[0] < 50 && data[1] <  50 && data[2] > 50)
		return "water";
	return "air"
}
	
	
function getImageForPixel(x, y) {
	return $(".map img").not("#stickfigure").filter(function(index) {
		var $this = $(this);
		var lowerX = $this.position().left;
		var upperX = $this.position().left +  $this.width();

		var lowerY = $this.position().top;
		var upperY = $this.position().top +  $this.height();
		
		if(lowerX < x && x < upperX && lowerY < y && y < upperY)
			return true;
		return false;
	});
}

var player;
var map;
var initMapPos ;
$(function() {
	map=new Map($('#comic'));
	initMapPos = [Math.floor(map.position()[0]), Math.floor(map.position()[1])];
	player = new Player();
	window.setInterval(update,30);
	
	window.setInterval(log,10000);
	
});
