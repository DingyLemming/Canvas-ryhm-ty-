const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const ballRadius = 10;

let x = canvas.width / 2;
let y = canvas.height - 50;
let dx = 2;
let dy = -2;

const paddleHeight = 10;
const paddleWidth = 75;

let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;

const brickRowCount = 6;
const brickColumnCount = 5;
const brickWidth = 80;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

let score = 0;
let lives = 3;
let level = 1; // Track the current level
const maxLevel = 3; // Maximum number of levels

let bricks = [];

for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 };
  }
}

let audioContext;
let bounceSoundBuffer;

function loadSound(url) {
  return fetch(url)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer));
}

document.addEventListener("DOMContentLoaded", function() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  loadSound('bounce1.mp3').then(buffer => {
    bounceSoundBuffer = buffer;
  });
});

function playBounceSound() {
  if (!bounceSoundBuffer) return;
  
  const source = audioContext.createBufferSource();
  source.buffer = bounceSoundBuffer;
  source.playbackRate.value = 4.5; // Speed up the playback rate
  source.connect(audioContext.destination);
  source.start(0);
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);
document.addEventListener("keydown", spaceHandler, false);

function keyDownHandler(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = true;
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = false;
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = false;
  }
}

function mouseMoveHandler(e) {
  let relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddleX = relativeX - paddleWidth / 2;
    if (!ballLaunched) {
      x = paddleX + paddleWidth / 2;
    }
  }
}

let gameWon = false; // Flag to track if the game is won
let gameOver = false; // Flag to track if the game is over
let gamePaused = false; // Flag to track if the game is paused
let ballLaunched = false; // Flag to track if the ball has been launched

function spaceHandler(e) {
  if (e.code === "Space" && !ballLaunched) {
    ballLaunched = true;
  }
}

function collisionDetection() {
  let activeBricks = 0; // Track the number of active bricks

  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      let b = bricks[c][r];
      if (b.status == 1) {
        activeBricks++; // Increment activeBricks for each active brick

        // Check collision with the ball
        if (
          x + ballRadius > b.x &&
          x - ballRadius < b.x + brickWidth &&
          y + ballRadius > b.y &&
          y - ballRadius < b.y + brickHeight
        ) {
          dy = -dy;
          b.status = 0;
          score++;
          playBounceSound(); // Play sound on brick hit
          updateInfoBox();
        }
      }
    }
  }

  // Check if there are no active bricks left
  if (activeBricks === 0 && !gameWon) {
    if (level < maxLevel) {
      gamePaused = true;
      displayMessage(`Proceeding to level ${level + 1}`);
      setTimeout(() => {
        newLevel();
      }, 2000);
    } else {
      gameWon = true; // Set gameWon flag to true
      displayMessage("YOU WIN!");
      showRestartButton();
    }
  }
}

function newLevel() {
  level++;
  resetBallAndPaddle();
  updateInfoBox();

  // Reset the bricks for the new level
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r].status = 1;
    }
  }

  gamePaused = false;
  ballLaunched = false; // Reset the ballLaunched flag
  draw(); // Restart drawing loop
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#C827F3";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight - 10, paddleWidth, paddleHeight);
  ctx.fillStyle = "#C827F3";
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status == 1) {
        const brickX = r * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = c * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = "#F35F27";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}
// wall for level 2
function collisionWall() {
  let wallWidth = 242;
  let wallOver = 201;
  let wallUnder = 219;
  if (y + 9 == wallOver && x <= wallWidth) {//päältä
    dy = -dy;
    playBounceSound(); // Play sound on unbreakable wall hit
  } else if (y == wallUnder + 9 && x  <= wallWidth) {//alta
    dy = -dy;
    playBounceSound(); // Play sound on unbreakable wall hit
  } else if (x  == wallWidth  && y + 9 >= wallOver + 3  && y <= wallUnder + ballRadius + 3) {//sivusta
    dx = -dx;
    playBounceSound(); // Play sound on unbreakable wall hit
  }
}
function collisionWall2() {//vasen-290 ja oikea-299
  let wallHeight = 99;
  let wallLeft = 290;
  let wallRight = 299;
  if (x  == wallLeft - 9 + 3 && y <= wallHeight){//vasen
    dx = -dx;
  } else if(x   == wallRight  + 3 && y <= wallHeight){//oikea
    dx = -dx;
  } else if (y == wallHeight + 1 && x  >= 284  && x <= 302) {
    dy = -dy;
  }
}

//draw wall for lvl 2 and 3
function drawWall() {
  ctx.fillStyle = "#959595";
  ctx.fillRect(0, 201, 242, 19);
}
function drawWall2() {
  ctx.fillStyle = "#959595";
  ctx.fillRect(290, 0, 10, 100);
}

function updateInfoBox() {
  document.getElementById('lives').innerText = 'Lives: ' + lives;
  document.getElementById('score').innerText = 'Score: ' + score;
  document.getElementById('level').innerText = 'Level: ' + level;
}

function draw() {
  if (gameOver || gameWon || gamePaused) return; // Stop the game loop if game is over, won, or paused

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (level == 1) {
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();
  } else if (level == 2) {
    drawBricks();
    drawWall();
    drawBall();
    drawPaddle();
    collisionWall();
    collisionDetection();
  } else if (level == 3) {
    drawBricks();
    drawWall();
    drawWall2();
    drawBall();
    drawPaddle();
    collisionWall();
    collisionWall2();
    collisionDetection();
  }

  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    dx = -dx;
    playBounceSound(); // Play sound on wall hit
  } 
  if (y + dy < ballRadius) {
    dy = -dy;
    playBounceSound(); // Play sound on ceiling hit
  } else if (y + dy > canvas.height - ballRadius - paddleHeight && y + dy < canvas.height - ballRadius) {
    // Check if the ball is within the horizontal bounds of the paddle
    if (x > paddleX && x < paddleX + paddleWidth) {
      // Reverse vertical direction only if the ball hits the top part of the paddle
      dy = -dy;
      playBounceSound(); // Play sound on paddle hit
    } else {
      lives--;
      updateInfoBox();
      if (!lives) {
        gameOver = true;
        displayMessage("GAME OVER");
        showRestartButton();
      } else {
        resetBallAndPaddle();
      }
    }
  }

  // Move paddle
  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += 7;
    if (!ballLaunched) {
      x = paddleX + paddleWidth / 2;
    }
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 7;
    if (!ballLaunched) {
      x = paddleX + paddleWidth / 2;
    }
  }

  if (ballLaunched) {
    x += dx;
    y += dy;
  }

  requestAnimationFrame(draw);
}

document.getElementById("runButton").addEventListener("click", function () {
  draw();
  this.disabled = true;
});

function resetBallAndPaddle() {
  x = canvas.width / 2;
  y = canvas.height - 30;
  dx = 3;
  dy = -3;
  paddleX = (canvas.width - paddleWidth) / 2;
  ballLaunched = false;
}

function displayMessage(message) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "48px serif";
  ctx.fillStyle = "#C827F3";
  ctx.textAlign = "center";
  ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

function showRestartButton() {
  const restartButton = document.createElement('button');
  restartButton.id = 'restartButton';
  restartButton.innerText = 'Restart';
  restartButton.style.position = 'absolute';
  restartButton.style.top = '50%';
  restartButton.style.left = '50%';
  restartButton.style.transform = 'translate(-50%, -50%)';
  document.body.appendChild(restartButton);
  
  restartButton.addEventListener('click', () => {
    document.location.reload();
  });
}
