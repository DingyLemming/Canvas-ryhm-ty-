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

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

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
  }
}

let gameWon = false; // Flag to track if the game is won

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
          updateInfoBox();
        }
      }
    }
  }

  // Check if there are no active bricks left
  if (activeBricks === 0 && !gameWon) {
    if (level < maxLevel) {
      newLevel();
    } else {
      gameWon = true; // Set gameWon flag to true
      alert("YOU WIN!");
      document.location.reload();
    }
  }
}

function newLevel() {
  alert(`Congratulations! Proceeding to level ${level + 1}`);
  level++;
  resetBallAndPaddle();
  updateInfoBox();

  // Reset the bricks for the new level
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r].status = 1;
    }
  }
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
  ctx.rect(paddleX, canvas.height - 30, paddleWidth, paddleHeight);
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

function updateInfoBox() {
  document.getElementById('lives').innerText = 'Lives: ' + lives;
  document.getElementById('score').innerText = 'Score: ' + score;
  document.getElementById('level').innerText = 'Level: ' + level;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  collisionDetection();

  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    dx = -dx;
  } 
  if (y + dy > canvas.height || y + dy < 0) {
    dy = -dy;
  }

  if (y + dy > canvas.height - paddleHeight - ballRadius) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
      lives--;
      updateInfoBox();
      if (!lives) {
        alert("DEFEAT!");
        document.location.reload();
      } else {
        resetBallAndPaddle();
      }
    }
  }

  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += 7;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 7;
  }

  x += dx;
  y += dy;
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
}
