let tileSize;
let rows = 16;
let columns = 9;

let board;
let boardWidth;
let boardHeight;
let context;

let shipWidth, shipHeight, shipX, shipY, shipVelocityX;
let ship = { x: 0, y: 0, width: 0, height: 0 };

let shipImg;
let alienArray = [];
let alienWidth, alienHeight, alienX, alienY;
let alienImg;

let alienRows = 2, alienColumns = 3, alienCount = 0, alienVelocityX = 1;
let bulletArray = [];
let bulletVelocityY;

let score = 0, gameOver = false;
let shootingInterval;
let currentRound = 1, totalRounds = 8;

let backgroundMusic;

let targetX = 0;  // Target x position of the ship
let smoothSpeed = 0.1;  // Control the speed of the movement

window.onload = function () {
    const screenWidth = window.innerWidth;
    tileSize = Math.floor(screenWidth / columns);
    boardWidth = tileSize * columns;
    boardHeight = tileSize * rows;

    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    shipWidth = tileSize * 2;
    shipHeight = tileSize;
    shipX = tileSize * columns / 2 - tileSize;
    shipY = tileSize * rows - tileSize * 2;
    ship.x = shipX;
    ship.y = shipY;
    ship.width = shipWidth;
    ship.height = shipHeight;
    shipVelocityX = tileSize;

    bulletVelocityY = -tileSize / 2;

    alienWidth = tileSize * 2;
    alienHeight = tileSize;
    alienX = tileSize;
    alienY = tileSize;

    shipImg = new Image();
    shipImg.src = "./ship.png";
    alienImg = new Image();
    alienImg.src = "./alien.png";

    backgroundMusic = document.getElementById("background-music");

    // Start the music after a slight delay to ensure it starts properly
    setTimeout(() => {
        backgroundMusic.play();
    }, 1000);

    createAliens();

    requestAnimationFrame(update);
    board.addEventListener("mousemove", moveShipWithMouse);
    board.addEventListener("mouseenter", startShooting);
    board.addEventListener("mouseleave", stopShooting);

    document.getElementById("retry").onclick = restartGame;
};

function update() {
    if (gameOver) return;
    requestAnimationFrame(update);
    context.clearRect(0, 0, board.width, board.height);

    // Smoothly move the ship toward the target position
    ship.x += (targetX - ship.x) * smoothSpeed;

    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

    for (let alien of alienArray) {
        if (alien.alive) {
            alien.x += alienVelocityX;

            if (alien.x + alien.width >= board.width || alien.x <= 0) {
                alienVelocityX *= -1;
                alien.x += alienVelocityX * 2;
                alienArray.forEach(a => a.y += alienHeight);
            }

            context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);

            if (alien.y >= ship.y) gameOver = true;
        }
    }

    for (let bullet of bulletArray) {
        bullet.y += bulletVelocityY;
        context.fillStyle = "white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        for (let alien of alienArray) {
            if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                bullet.used = true;
                alien.alive = false;
                alienCount--;
                score += 100;
            }
        }
    }

    bulletArray = bulletArray.filter(b => !b.used && b.y > 0);

    if (alienCount == 0) {
        if (currentRound >= totalRounds) {
            endGame();
        } else {
            alienColumns = Math.min(alienColumns + 1, columns / 2 - 2);
            alienRows = Math.min(alienRows + 1, rows - 4);
            alienVelocityX += alienVelocityX > 0 ? 0.2 : -0.2;
            alienArray = [];
            bulletArray = [];
            createAliens();
            currentRound++;
        }
    }

    context.fillStyle = "white";
    context.font = "16px courier";
    context.fillText(`Score: ${score}`, 5, 20);
    context.fillText(`Round: ${currentRound}/${totalRounds}`, boardWidth - 100, 20);
}

function moveShipWithMouse(e) {
    const rect = board.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    // Set the target position of the ship
    targetX = Math.max(Math.min(mouseX - ship.width / 2, board.width - ship.width), 0);
}

function startShooting() {
    if (!shootingInterval) {
        shootingInterval = setInterval(() => {
            bulletArray.push({ x: ship.x + shipWidth * 15 / 32, y: ship.y, width: tileSize / 8, height: tileSize / 2, used: false });
        }, 200);
    }
}

function stopShooting() {
    clearInterval(shootingInterval);
    shootingInterval = null;
}

function createAliens() {
    for (let c = 0; c < alienColumns; c++) {
        for (let r = 0; r < alienRows; r++) {
            alienArray.push({ img: alienImg, x: alienX + c * alienWidth, y: alienY + r * alienHeight, width: alienWidth, height: alienHeight, alive: true });
        }
    }
    alienCount = alienArray.length;
}

function detectCollision(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function endGame() {
    gameOver = true;
    document.getElementById("game-over").style.display = "block";
    document.getElementById("final-score").textContent = `Your Score: ${score}`;
    board.style.display = "none";
}

function restartGame() {
    currentRound = 1;
    score = 0;
    gameOver = false;
    document.getElementById("game-over").style.display = "none";
    board.style.display = "block";
    alienArray = [];
    bulletArray = [];
    createAliens();
    requestAnimationFrame(update);
}