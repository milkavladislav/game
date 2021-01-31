const shuriken = [];
const countShuriken = 5;
const colorBadBall = 'black';

for(let i = 1; i <= countShuriken; i++){
  shuriken.push("image/shuriken" + i + ".png");
}

let canvas, ctx, w, h; 
let mousePos;

let goodBalls = []; 
let badBalls = [];

let countGoodBall = 10;
let countBadBall = 5;
let minradius = 5;
let maxradius = 30;
let speed = 5;
let sizePlayer = 20;
let playerHealth = 100;
let isTypeCustomer = true;
let levelInClassic = 0;

let continueAnimating = true;

const player = {
  name: "defaultPlayer",
  x: 10,
  y: 10,
  width: sizePlayer,
  height: sizePlayer,
  img: new Image(),
  health: playerHealth,
}

player.img.src = shuriken[0];

window.onload = function init() {
  canvas = document.querySelector("#myCanvas");
  addBlockWithShuriken();
  updateRatingTable();

  w = canvas.width; 
  h = canvas.height;  

  ctx = canvas.getContext('2d');
  
  goodBalls = createBalls(countGoodBall);
  badBalls = createBalls(countBadBall);
  
  canvas.addEventListener('mousemove', mouseMoved);

  mainLoop();
};

function addBlockWithShuriken() {
  changeShuriken = function(obj){
    player.img.src = obj.src;
  }
  shuriken.forEach(function(s, index) {
    $("#shurikenlist").append('<label><input type="radio" class="shuriken" name="fb"/><img onclick="changeShuriken(this)" src="'+ s +'"></label>');
  })
}

function mouseMoved(evt) {
  mousePos = getMousePos(canvas, evt);
}

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

function movePlayerWithMouse() {
  if(mousePos !== undefined) {
    player.x = mousePos.x - player.width / 2;
    player.y = mousePos.y - player.height / 2;
  }
}

function mainLoop() {
  ctx.clearRect(0, 0, w, h);

  drawPlayer(player);
  drawAllBalls(goodBalls);
  if(goodBalls.length == 0){
    winPlayer();
    return;
  }
  drawAllBalls(badBalls);
  drawNumberOfGoodBallsAlive(goodBalls);
  drawLifeOfPlayer();

  moveAllBalls(goodBalls);
  moveAllBalls(badBalls);
  
  movePlayerWithMouse();

  if(continueAnimating)
    if(player.health >= 0){
      requestAnimationFrame(mainLoop);
    } else {
      losePlayer();
      if(!isTypeCustomer)
        levelInClassic = 0;
    }
  else
   return;
}

function circRectsOverlap(x0, y0, w0, h0, cx, cy, r) {
  let testX = cx;
  let testY = cy;
  if (testX < x0) testX = x0;
  if (testX > (x0 + w0)) testX = (x0 + w0);
  if (testY < y0) testY = y0;
  if (testY > (y0+h0)) testY = (y0 + h0);
  return (((cx - testX) * (cx - testX) + (cy - testY) * (cy - testY)) <  r * r);
}

function createBalls(n) {       
  const ballArray = [];
  for(let i = 0; i < n; i++) {
    const b = {
      x: w/2,
      y: h/2,
      radius: minradius + maxradius * Math.random(),
      speedX: (0 - speed) + speed * 2 * Math.random(), 
      speedY: (0 - speed) + speed * 2 * Math.random(), 
      color: getARandomColor(),
    }
    if(n == countBadBall){
      b.color = colorBadBall;
    }
     ballArray.push(b);
  }
  return ballArray;
}

function getARandomColor() {  
  const colors = ['red', 'blue', 'cyan', 'purple', 'pink', 'green', 'yellow'];
  let colorIndex = Math.round((colors.length-1) * Math.random()); 
  return colors[colorIndex];
}

function losePlayer() {
  ctx.save();
  ctx.font="30px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = 'white';
  ctx.fillText(player.name.toUpperCase() + ", YOU LOSE!", w / 2 , h / 2);
  ctx.restore();
  writeInRating(false);
  updateRatingTable();
  PostInServer(false);
}

function winPlayer() {
  ctx.save();
  ctx.font="30px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = 'white';
  ctx.fillText(player.name.toUpperCase() + ", YOU WIN!", w / 2, h / 2);
  ctx.restore();
  writeInRating(true);
  updateRatingTable();
  PostInServer(true);
}

function drawNumberOfGoodBallsAlive(balls) {
  ctx.save();
  ctx.font="20px Arial";
  ctx.fillText(balls.length, 20, 30);
}

function drawLifeOfPlayer() {
  ctx.save();
  ctx.font="20px Arial";
  ctx.fillText("health: " + player.health, w - 100, 30);
  ctx.restore();          
}

function drawAllBalls(ballArray) { 
  ballArray.forEach(function(b) {
    drawFilledCircle(b);
  });
}

function moveAllBalls(ballArray) {  
  ballArray.forEach(function(b, index) {
    b.x += b.speedX;
    b.y += b.speedY;
    testCollisionBallWithWalls(b); 
    testCollisionWithPlayer(b, index);
  });
}

function testCollisionWithPlayer(b, index) {
  let isCollision = circRectsOverlap(player.x, player.y, player.width, player.height, b.x, b.y, b.radius);
  if(isCollision) {
    if(b.color == colorBadBall){
      player.health -= 1;
      $("#canvas").css('background', 'linear-gradient(to right,  rgb(253, 25, 75), rgb(245, 11, 81))');
      setTimeout(function() {
        $("#canvas").css('background', 'linear-gradient(to right,  rgb(106, 252, 203), rgb(174, 223, 238))');
      }, 100);
    } else {
      goodBalls.splice(index, 1);
    }
  } 
}

function testCollisionBallWithWalls(b) {
  
  if((b.x + b.radius) > w) {
    b.speedX = -b.speedX;
    b.x = w - b.radius;
  } else 
    if((b.x -b.radius) < 0) {
      b.speedX = -b.speedX;
      b.x = b.radius;
    }
 
  if((b.y + b.radius) > h) {
    b.speedY = -b.speedY;
    b.y = h - b.radius;
  } else if((b.y -b.radius) < 0) {
    b.speedY = -b.speedY;
    
    b.Y = b.radius;
  }  
}

function drawPlayer(r) {
  ctx.save();
  ctx.translate(r.x, r.y);
  ctx.drawImage(player.img, 0, 0, sizePlayer, sizePlayer);
  ctx.restore();
}

function drawFilledCircle(c) {
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.fillStyle = c.color;
  ctx.beginPath();
  ctx.arc(0, 0, c.radius, 0, 2*Math.PI);
  ctx.fill();
  ctx.restore();
}

function magicKey(e){
  switch(e.key){
    case " ":
      if(levelInClassic == 0)
        player.name = prompt("Enter your name:", "defaultPlayer");
      if(isTypeCustomer){
        speed = parseInt($('#speed').val()) ? parseInt($('#speed').val()) : speed;
        countGoodBall = parseInt($('#countGoodBall').val()) ? parseInt($('#countGoodBall').val()) : countGoodBall;
        countBadBall = parseInt($('#countBadBall').val()) ? parseInt($('#countBadBall').val()) : countBadBall;
        minradius = parseInt($('#minRadius').val()) ? parseInt($('#minRadius').val()) : minradius;
        maxradius = parseInt($('#maxRadius').val()) ? parseInt($('#maxRadius').val()) : maxradius;
        sizePlayer = parseInt($('#sizePlayer').val()) ? parseInt($('#sizePlayer').val()) : sizePlayer;
        player.health = parseInt($('#playerHealth').val()) ? parseInt($('#playerHealth').val()) : playerHealth;
        player.width = sizePlayer;
        player.height = sizePlayer;
        goodBalls = createBalls(countGoodBall);
        badBalls = createBalls(countBadBall);
        requestAnimationFrame(mainLoop);
      }
      if(!continueAnimating && isTypeCustomer){
        continueAnimating = true;
        player.health = playerHealth;
        goodBalls = createBalls(countGoodBall);
        badBalls = createBalls(countBadBall);
        requestAnimationFrame(mainLoop);
      }
      if(!isTypeCustomer){
        classicGame();
        requestAnimationFrame(mainLoop);
      }
      break;

    case "p": 
    case "P": 
    case "З": 
    case "з":
      if(continueAnimating)
        continueAnimating = false;
      else{
        continueAnimating = true;
        requestAnimationFrame(mainLoop);
      }
      break;
  }
}

window.addEventListener('keypress', magicKey)

function changeToClassicMode() {
  $.getJSON("http://localhost:3000/classic", function(val) {
          player.speed = val.speed;
          speed = val.speed;
          player.height = val.sizePlayer;
          player.width = val.sizePlayer;
          player.health = val.playerHealth;
          playerHealth = val.playerHealth;
          countGoodBall = val.countGoodBall;
          countBadBall = val.countBadBall;
          minradius = val.minRadius;
          maxradius = val.maxRadius;
          goodBalls = createBalls(countGoodBall);
          badBalls = createBalls(countBadBall);
      }).done(function() {
        console.log("done");
      }).fail(function() {
        console.log("Error");
      });
}

function classicGame() {
  levelInClassic += 1;
  player.speed = speed + (2 * levelInClassic);
  player.height -= 1;
  player.width -= 1;
  player.health = playerHealth - (3 * levelInClassic);
  countGoodBall += 2;
  countBadBall += 1;
  goodBalls = createBalls(countGoodBall);
  badBalls = createBalls(countBadBall);
  $("#classic").html("<tr><td>Level:</td><td>" + levelInClassic + "</td></tr>");
}

function PostInServer(isWin) {
  $.post("http://localhost:3000/gameCheckTable", { UserName: player.name,
          CountKillBall: countGoodBall, CountBadBall: countBadBall,
          Speed: player.speed, IsWin: isWin})
  .done(function(data) {
    console.log("Game post in server");
  });
}

function changeModeGame() { 
  if(isTypeCustomer){ //turn on classic mode
    isTypeCustomer = false;
    levelInClassic = 0;
    $("#customer").attr('hidden', 'hidden');
    $("#classic").removeAttr('hidden');
    $("#modebutton").attr('value', 'Chage to Customer mode')
    $("#modeGame").text('Classic');
    $("#setting").css('background', 'linear-gradient(3deg, #e4f1b7, #e9ac07)');
    changeToClassicMode();
  } else {  //turn on customer mode
    isTypeCustomer = true;
    $("#customer").removeAttr('hidden');
    $("#classic").attr('hidden', 'hidden');
    $("#modebutton").attr('value', 'Chage to Classic mode')
    $("#modeGame").text('Customer');
    $("#setting").css('background', 'linear-gradient(3deg, #b7dcf1, #b29fe2)');
  }
  $("#modebutton").blur(); //turn off focus on button
}


$(document).ready(function() {
  updateTextInput = function(obj) {
    $("." + obj.name).val(obj.value);
  }
  $('head').append('<link rel="stylesheet" href="css/style.css">');
  $("input").attr("onchange", "updateTextInput(this);");
})