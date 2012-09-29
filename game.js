/*

 _   __      _       _    _    _       _     _                
| | / /     (_)     | |  | |  | |     | |   | |               
| |/ /  __ _ _  __ _| | _| | _| |_   _| |__ | |__   ___ _ __  
|    \ / _` | |/ _` | |/ / |/ / | | | | '_ \| '_ \ / _ \ '_ \ 
| |\  \ (_| | | (_| |   <|   <| | |_| | |_) | |_) |  __/ | | |
\_| \_/\__,_| |\__,_|_|\_\_|\_\_|\__,_|_.__/|_.__/ \___|_| |_|
           _/ |                                               
          |__/

*/
/*
Thanks to XKCD and the people who wrote the original javascript.
*/


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
				player.vy = -7;
				player.vx = 7;
				rightPressed = true;
				window.setInterval(update,33);
				window.setInterval(log,10000);
				break;
				
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
		alert(getImageForPixel(player.centerX(), player.centerY()).id + "\n" + player.centerX() + "," + player.centerY());
	}
	
	if(event.which == 105) {
		var s = prompt("Teleport: Where do you want to go (0-9)?: ");
		
		switch(s)
		{
			case '0':
				teleport(8879,35460); // ufo
			break;
			case '1':
				teleport(26033,1050); // ship under bridge
			break;
			case '2':
				teleport(53671,-11750); // huge tower
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
	
	this.x = 0;
	this.y = 0;
	
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
			
		this.inWater = materialAtPixel(player.centerX(), player.centerY()+5) == col_water;
			
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
		
		if(lastPressed != "right" && !this.climbing) {
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
			if(upPressed || downPressed || rightPressed || leftPressed) {
				this.animateFrame("climb", 9, true, 2);
			}
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
			this.animateFrame("idle", 15, true, 2);
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
	
	
	updateMap();
	lastVY = player.vy;
}

function updateMap()
{
	var x = initMapPos[0] - camx;
	var y = initMapPos[1] - camy;

	
	map.position()[0] = x;
	map.position()[1] = y;
	
	map.update();
	
	offset = player.player.offsetParent().offsetParent().offset();
	offset.left += player.player.offsetParent().offsetParent().width()/2-20;
	offset.top +=player.player.offsetParent().offsetParent().height()/2+130;
	console.log(offset);
	//player.player.offset({left: 650, top: 400});
	player.player.offset({left: offset.left+(player.x-camx), top: offset.top+(player.y-camy)});

}

function log(){
	$.ajax({
		url:"http://halfdanj.dk/pressnmove.php",
		crossDomain: true,
		type: "POST",
		dataType: 'jsonp', // Notice! JSONP <-- P (lowercase)
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
		
		player.vy -= 1.5;
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
	{
		player.vx *0.7;
		player.vx +=2;
		
	}
	if(centerVerDistLeft == -1 && centerVerDistRight != -1)
	{
		player.vx *0.7;
		player.vx -=2;
		
	}
		
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
		//player.vy = dirY*Math.min(centerVerDistRight,centerVerDistLeft);
		var dist = PlayerRaytrace(player.vx,playerHeight/2+player.vy,0,-1,playerHeight,true);
		if(dist != -1)
		{
			player.y = player.y - (dist-1);
			//player.vx *0.7;
		}
		else
		{
			var dist = PlayerRaytrace(player.vx,-playerHeight/2+player.vy,0,1,playerHeight,true);
			if(dist != -1)
			{
				player.y = player.y + (dist-1);
				//player.vx *0.7;
			}
		}
	
		if( centerVerDistLeft == 0 && centerVerDistRight == 0 && centerHorDist == 0 && !headFree)
		{
			//we might be stuck
			player.y = player.y - 10;
			
		}
	
			

	}

}
function PlayerRaytrace(xoffset,yoffset,dx,dy,dist,flip) {
	
	dist = Math.max(1,dist);
	if(flip == undefined)
		flip = false;
		
	var x = player.centerX()+xoffset;
	var y = player.centerY()+yoffset;
	
	var maxraytrace = 20.0; //lower this to gain performance. 10 might be too small
	
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
	if(collisionMap[name] == undefined)
		return col_air; 
		
	var data = collisionMap[name];
	var i = (Math.floor(y/2) * 4) * 1024 + (Math.floor(x/2) * 4);	

	if(data[i+0] <  50 && data[i+1] < 50 && data[i+2] < 50)
		return col_ground;
	if(data[i+0] < 50 && data[i+1] > 50 && data[i+2] <  50 )
		return col_climbable;
	if(data[i+0] < 50 && data[i+1] <  50 && data[i+2] > 50)
		return col_water;
	return col_air;
}

var lastMap;
var activeMaps;
var collisionMap = [];
function getImageForPixel(x, y) {
	
	if(lastMap != undefined)
	{
		if(lastMap.left <= x && x < lastMap.left +  lastMap.width && lastMap.top <= y && y < lastMap.top +  lastMap.height)
		{	
			return lastMap;
		}
	}
	lastMap = $(activeMaps).filter(function(index) {
		
		return (this.left <= x && x < this.left +  this.width && this.top <= y && y < this.top +  this.height)
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
	//player position in original comic
	player.x = -305+20;
	player.y =-56-130;
	camx = 0.0;
	camy = 0.0;
	updateMap();

	
	$("#canvascontainer").hide();
	
});
