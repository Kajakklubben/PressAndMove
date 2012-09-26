var upPressed = false;
var downPressed = false;
var leftPressed = false;
var rightPressed = false;
var debugSpeed = false;
var balloon = false;
var upPressedNow = false;
var isGrounded = false;
var wasGrounded = false;

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
			if(!upPressed && b)
				upPressedNow = true;
				
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
			if(!gameStarted) {
				gameStarted = true;
				player.vy = -10;
				window.setInterval(update,33);
				window.setInterval(log,10000);
			}
		
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
	player.vy = -5;
	camx = 0;
	camy = 0;
}

gameStarted = false;
document.onkeypress = function(event) {
	if(event.which == 32) {
	}
	
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
			case '-2':
				teleport(-650,29850); // end of the world?
			break;
		}

	}
};

document.onkeydown = function(event) { return cache(event, true);  };
document.onkeyup = function(event) { return cache(event, false); };

function Player() {
	this.map = $(".map");
	this.map.append('<img src="player/man_air_01.png" style="position: relative; z-index: 20" id="stickfigure">');
	this.player = $("#stickfigure", this.map);
	
	this.x = -330;
	this.y = -112;
	
	this.vx = 0;
	this.vy = 0;
	
	this.climbing = false;
	this.inWater = false;
	
	var lastPressed = "right";
	
	var frame = 0;
	var animation = "air";
	var justJumped = true;
	
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
			factor = 0.7;
			
		if(leftPressed) {
			if(player.vx>-7)
				player.vx -=2*factor;
			
			lastPressed = "left";
		}
		else if(rightPressed) {
			if(player.vx<7)
				player.vx +=2*factor;
			lastPressed = "right";
		}
		else
			player.vx = 0;
			
		this.inWater = materialAtPixel(player.centerX(), player.centerY()+10) == col_water;
			
		var currentClimbable = materialAtPixel(player.centerX(), player.centerY()) == col_climbable;
		if(upPressed) {
			if(isGrounded && !this.climbing && headFree && upPressedNow) {
				justJumped = true;
				player.vy = -12;
				
				
			}

			if(currentClimbable) {
					player.vy = -2;
					this.climbing = true;
			}
			else
				this.climbing = false;
			
		}
		else {
			if(this.climbing) {
				if(!currentClimbable) {
					this.climbing = false;
					
				}
				else if(downPressed) {
					player.vy = 2;
				}
				else
					this.vy = 0;
			} else if(this.inWater && downPressed) {
				this.vy = 4;
			}
		}
		
		if(balloon)
		{
			if(player.vy>-6)
				player.vy += -1.2;
		}
		
		if(lastPressed != "right") {
			this.player.addClass("flip-horizontal");
		}
		else {
			this.player.removeClass("flip-horizontal");
		}
		
		upPressedNow = false;
	}
	
	this.animateFrame = function(ani, frms, loop, stp) {
		if(animation == ani) {
			if(stp != undefined) {
				cnt++;
				if(cnt%stp!=0)
					return;
			}
			if(!loop) {
				frame = (frame+1);
				frame = frame > frms-1 ? frms-1 : frame;
			}
			else
				frame = (frame+1)%frms;

		}
		else {
			cnt = 0;
			frame = 0;
		}
			
		animation = ani;
	}
	var landEnd = false;
	this.animate = function() {
		if(animation == "land" && frame < 5 && !landEnd) {
			if(frame==4)
				landEnd = true;
			this.animateFrame("land", 5, true, 3);
		}
		else if(balloon) {
			this.animateFrame("air", 1, true, 2);
		}
		else if(isGrounded && !wasGrounded && lastVY > 15) {
			landEnd = false;
			this.animateFrame("land", 5, true, 3);
		}
		else if(player.climbing) {
			this.animateFrame("run", 1, true, 2);
		}
		else if(player.vy < 0) {
			this.animateFrame("jump", 2, false, 2);
		}
		else if(player.vy > 8) {
			this.animateFrame("fall", 2, false, 2);
		}
		else if(leftPressed || rightPressed) {
			this.animateFrame("run", 8, true, 2);
		}
		else if(player.vy==0 && isGrounded) {
			this.animateFrame("idle", 2, true, 2);
		}
		
		var ani = "player\\man_" + animation +  "_" + pad(1+frame, 2) + ".png";
		
		this.player.attr("src", ani)
		
	}
}
var camx = 100.0;
var camy = 40.0;

var lastVY;

function update() {
	player.update();
	
	updatePhysics();
	player.animate();

	camy += (player.y-camy)/4.0;
	camx += (player.x-camx)/4.0;
	
	camy = Math.floor(camy);
	camx = Math.floor(camx);
	
	oldPlayerX = player.x;
	
	player.x += player.vx;
	player.y += player.vy;
	
	
	var x = initMapPos[0] - camx;
	var y = initMapPos[1] - camy;

	
	map.position()[0] = x;
	map.position()[1] = y;
	
	map.update();
	
	//player.player.offset({left: 650, top: 400});
	player.player.offset({left: 650+(player.x-camx), top: 400+(player.y-camy)});

	lastVY = player.vy;
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
var headFree;
function updatePhysics()
{
	wasGrounded = isGrounded;
	if(groundedFrames==0) {
		isGrounded = false;
	}
	else
		groundedFrames--;
	
	headFree = PlayerRaytrace(0,-20,0,-1,1);
if(headFree != -1 && player.vy<0)
	player.vy = 0;
	
	var playerWidth = 20;
	var playerHeight = 60;
	
	
	if(player.inWater) {
		player.vy -= 0.5;
		if(player.vy < -4)
			player.vy = -4;
	}
	else if(!player.climbing)
		player.vy += 1;
	
	if(player.vy > 20) { //max fall speed
		player.vy = 20;
	}

	var dirX = player.vx>0?1:-1;
	var dirY = player.vy>0?1:-1;
	var centerHorDist = PlayerRaytrace(dirX*playerWidth/2,playerHeight/5,dirX,0,Math.abs(player.vx));
	var stopHorizontal = false;
	if(centerHorDist!=-1)
	{
	
		player.x = player.x+dirX*(centerHorDist+playerWidth/2)-dirX*playerWidth/2;
		
		player.vx = 0;
		stopHorizontal = true;
		
	}
	
	var centerVerDistLeft = PlayerRaytrace(-2,dirY*playerHeight/2,0,dirY,Math.abs(player.vy));
	var centerVerDistRight = PlayerRaytrace(2,dirY*playerHeight/2,0,dirY,Math.abs(player.vy));
	
	if(centerVerDistLeft != -1 && centerVerDistRight == -1)
		player.vx +=2;
	if(centerVerDistLeft == -1 && centerVerDistRight != -1)
		player.vx -=2;
		
	if(centerVerDistLeft != -1 || centerVerDistRight != -1) {
		
		if(player.vy>0) // only when falling down
		{
			groundedFrames = 3; // we are grounded for the next 3 frames
			isGrounded = true; 
		}
		if(centerVerDistLeft != -1 && centerVerDistRight != -1) 
		{
			player.vy = 0;
			
	
		}
		
		var dist = PlayerRaytrace(player.vx,dirY*playerHeight/2+player.vy,0,-dirY,playerHeight,true);
		if(dist != -1)
			player.y = player.y - (dist-1);
		else
			player.vy = dirY*Math.min(centerVerDistRight,centerVerDistLeft);

	}

}
function PlayerRaytrace(xoffset,yoffset,dx,dy,dist,flip) {
	if(flip == undefined)
		flip = false;
		
	var x = player.centerX()+xoffset;
	var y = player.centerY()+yoffset;
	
	var maxraytrace = 40.0; //lower this to gain performance. 10 might be too small
	
	var step = Math.ceil(dist/maxraytrace);
	
	var ground = false;
	for(i = 0;i<dist;)
	{
		ground = materialAtPixel(x+i*dx, y+i*dy) == col_ground;
		if((!flip && ground) || (flip && !ground))
			return i;
		//we always want to trace the first  pixels due to better walking
		if(i<2)
			i++;
		else
			i+=step;
	}
	return -1;

}
var  col_air = 0;
var  col_climbable = 1;
var  col_water = 2;
var  col_ground = 3;

function materialAtPixel(x, y) {
	var img = getImageForPixel(x, y);
	

	if(img != undefined)  {

		var localX = x - img.left;
		var localY = y - img.top;
		
		return materialAtImagePixel(img.id, localX, localY);
	}
	return col_air;
}
	
function materialAtImagePixel(name, x, y) {
	if(document.getElementById(name) == null)
		return col_air; 
		
	var context = document.getElementById(name).getContext('2d');
	data = context.getImageData(x, y, 1, 1).data;
	
	if(data[0] <  50 && data[1] < 50 && data[2] < 50)
		return col_ground;
	if(data[0] < 50 && data[1] > 50 && data[2] <  50 )
		return col_climbable;
	if(data[0] < 50 && data[1] <  50 && data[2] > 50)
		return col_water;
	return col_air;
}

var lastMap;
var activeMaps;
function getImageForPixel(x, y) {
	
	if(lastMap != undefined)
	{
		var map = lastMap;
		var lowerX = map.left;
		var upperX = map.left +  map.width;

		var lowerY = map.top;
		var upperY = map.top +  map.height;
		
		if(lowerX < x && x < upperX && lowerY < y && y < upperY)
		{
			
			return lastMap;
		}
		
	}
	lastMap = $(activeMaps).filter(function(index) {
		
		var lowerX = this.left;
		var upperX = this.left +  this.width;

		var lowerY = this.top;
		var upperY = this.top +  this.height;
		
		if(lowerX < x && x < upperX && lowerY < y && y < upperY)
			return true;
		return false;
	})[0];
	return lastMap;
	

}

var player;
var map;
var initMapPos ;
$(function() {
	map=new Map($('#comic'));
	initMapPos = [Math.floor(map.position()[0]), Math.floor(map.position()[1])];
	player = new Player();
	update();
	//camera position in comic
	camx = 100.0;
	camy = 40.0;
	
	$("#canvascontainer").hide();
	
});
