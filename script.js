// Fetch the canvas element from the HTML
const canvas = document.getElementById("gameCanvas");
// Get the 2D rendering context for the canvas
const ctx = canvas.getContext("2d");

// Define the gun object and its properties
let gun = {
    x: canvas.width / 2 - 25, // Horizontal position (center of canvas, offset by half of the gun's width)
    y: canvas.height - 100,    // Vertical position (bottom of the canvas)
    width: 50,                // Width of the gun
    height: 80,               // Height of the gun
    dx: 20                    // Change in x-direction for movement
};

// An array to store the bullets
let bullets = [];

// Define the target object and its properties
let target = {
    x: 100,                   // Initial horizontal position
    y: 50,                    // Vertical position
    radius: 20,               // Radius of the target
    dx: 6                     // Change in x-direction for movement
};

// Load the bullet sound effect
let bulletSound = new Audio('bulletFire.mp3');
let gameOverSound= new Audio('gameOver.wav')
// Game variables
let score = 0; // Player's current score
// Fetch high score from local storage or set it to 0 if not available
let highScore = parseInt(localStorage.getItem("highScore")) || 0;
let spacePressed = false;    // Track if the spacebar is pressed
let gameState = "notStarted"; // Current game state (notStarted, ongoing, ended)
let consecutiveMisses = 0;   // Track consecutive missed shots

let monsterImg = new Image();
monsterImg.src = "monsterimage.png"; // path to your monster image

let bulletImg = new Image();
bulletImg.src = "bulletimage.png"; // path to your bullet image

let gunImg = new Image();
gunImg.src = "gunimage.png"; // path to your gun image






const bulletSpeed = 50
const monsterSpeedUp = 2
let animationId = null
let shootEvent = null
document.querySelector("#highestScore span").innerHTML = highScore
document.querySelector("#currentScore span").innerHTML = score

function startgame() {
    if (gameState !== 'ongoing') {
        gameState = 'ongoing';
        score = 0;
        document.querySelector("#currentScore span").innerHTML = score
        consecutiveMisses = 0;
        bullets = [];

        shootEvent = function(event){
            if(event.key === " ") {
                spacePressed = true
                bulletSound.currentTime = 0;
                bulletSound.play()
                bullets.push({x:gun_x+gun.width/2, y:gun.y})
            } else if(event.key === "ArrowLeft") {
                if(gun_x - gun.dx >= 0 )
                    gun_x = (gun_x - gun.dx)
            } else if(event.key === "ArrowRight") {
                if(gun_x + gun.dx + gun.width <= canvas.width )
                    gun_x = (gun_x + gun.dx)
            }
        }
        document.addEventListener("keydown", shootEvent)

        updateMotion();
    }
}

let gun_x = gun.x
function drawGun() {
    if (gunImg.complete) {
        ctx.drawImage(gunImg, gun_x, gun.y, gun.width, gun.height);
    } else {
        gunImg.onload = function() {
            ctx.drawImage(gunImg, gun_x, gun.y, gun.width, gun.height);
        };
    }
}

function drawMonster(obj = target) {
    let centerX = obj.x + obj.radius;
    let centerY = obj.y + obj.radius;
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, obj.radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(monsterImg, obj.x, obj.y, obj.radius*2, obj.radius*2);

    ctx.restore();
}

let monster_x = target.x
let monster_dx = target.dx
function updateMonster() {
    if(monster_x + monster_dx + target.radius*2 > canvas.width || monster_x + target.dx < 0){
        monster_dx *= -1 
    }
    monster_x += monster_dx;
    drawMonster({x:monster_x, y:target.y, radius:target.radius});
}

let multiplesOf50 = 0
function checkCollision(x, y) {
    console.log(x,y, monster_x, monster_x+2*target.radius)
    if(x >= monster_x && x <= monster_x+2*target.radius) {
        consecutiveMisses = 0
        score += 5
        if(score >= (multiplesOf50+1)*50) {
            multiplesOf50++
            monster_dx = target.dx + multiplesOf50*monsterSpeedUp
        }
        monster_x = target.x
    } else {
        if(consecutiveMisses < 2) {
            consecutiveMisses += 1
            score -= 2
        } else {
            document.removeEventListener("keydown", shootEvent);
            gameState = "ended"
            cancelAnimationFrame(animationId)

            if(score > highScore) {
                localStorage.setItem("highScore", score.toString())
            }

            gameOverSound.currentTime = 0
            gameOverSound.play()
        }
    }

    document.querySelector("#currentScore span").innerHTML = score
    if(score > highScore) {
        document.querySelector("#highestScore span").innerHTML = score
    }
}

function drawBullet() {
    for(let i = 0; i < bullets.length; i++) {
        ctx.drawImage(bulletImg, bullets[i].x, bullets[i].y, 5, 25)
        if(bullets[i].y >= target.y && bullets[i].y <= target.y+2*target.radius) checkCollision(bullets[i].x, bullets[i].y)
        bullets[i] = {x: bullets[i].x, y: bullets[i].y-bulletSpeed}
    }
    bullets = bullets.filter(bullet => bullet.y > 0);
}

function updateMotion() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (gameState === 'ongoing') {
        drawBullet()
        animationId = requestAnimationFrame(updateMotion);
    } else if(gameState === 'ended') {
        ctx.fillStyle = "#FF0000"; // Red background
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    drawGun()
    updateMonster()
}
