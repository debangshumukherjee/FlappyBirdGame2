const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startMessage = document.getElementById("startMessage");
const gameOverDialog = document.getElementById("gameOverDialog");
const retryButton = document.getElementById("retryButton");
const quitButton = document.getElementById("quitButton");
const scoreDisplay = document.getElementById("score");

// Load images
const loadImage = src => {
    const img = new Image();
    img.src = src;
    return img;
};

const images = {
    bird: loadImage('./FB pictures/flappy-bird.png'),
    topPipe: loadImage('./FB pictures/toppipe.png'),
    bottomPipe: loadImage('./FB pictures/bottompipe.png'),
    goldenTopPipe: loadImage('./FB pictures/golden-toppipe.png'),
    goldenBottomPipe: loadImage('./FB pictures/golden-bottompipe.png')
};

// Load sounds
const loadSound = src => {
    const audio = new Audio(src);
    return audio;
};

const sounds = {
    jump: loadSound('./sounds/jump.mp3'),
    gameOver: loadSound('./sounds/game-over.mp3'),
    passPipe: loadSound('./sounds/pass-pipe.mp3') // Load pass pipe sound
};

// Game constants and variables
const PIPE_WIDTH = 50;
const GAP = 200;
const GOLDEN_PIPE_PROBABILITY = 0.05;
const PIPE_SPEED = 4;
const BIRD_GRAVITY = 0.4;
const BIRD_LIFT = -7;

let bird, pipes, score, gameOver, gameStarted;

// Initialize the game
const init = () => {
    bird = { x: 50, y: 150, width: 20, height: 20, velocity: 0 };
    pipes = [];
    score = 0;
    gameOver = false;
    gameStarted = false;
    scoreDisplay.textContent = "Score: 0";
    startMessage.style.display = "block";
    gameOverDialog.classList.add("hidden");
    draw();
};

// Handle bird jump
const handleJump = () => {
    if (!gameStarted) {
        startMessage.style.display = "none";
        gameStarted = true;
        requestAnimationFrame(update);
    } else if (!gameOver) {
        bird.velocity = BIRD_LIFT;
        sounds.jump.play(); // Play jump sound
    }
};

// Generate random pipe height
const generateRandomHeight = () => Math.floor(Math.random() * (canvas.height / 2));

// Determine if pipe is golden
const isGoldenPipe = () => Math.random() < GOLDEN_PIPE_PROBABILITY;

// Create new pipes
const createPipe = () => {
    const topPipeHeight = generateRandomHeight();
    const bottomPipeHeight = canvas.height - topPipeHeight - GAP;
    const color = isGoldenPipe() ? "golden" : "green";

    pipes.push(
        { x: canvas.width, y: 0, width: PIPE_WIDTH, height: topPipeHeight, type: 'top', color },
        { x: canvas.width, y: canvas.height - bottomPipeHeight, width: PIPE_WIDTH, height: bottomPipeHeight, type: 'bottom', color }
    );
};

// Update game state
const update = () => {
    if (gameOver) return;

    // Update bird position
    bird.velocity += BIRD_GRAVITY;
    bird.y += bird.velocity;

    // Move pipes and update score
    let passedPipe = false;

    pipes = pipes.filter(pipe => {
        pipe.x -= PIPE_SPEED;
        if (pipe.x + pipe.width < 0) {
            score += (pipe.color === "golden" ? 10 : 5);
            scoreDisplay.textContent = "Score: " + score;
            return false; // Remove pipe from array
        }
        // Check if the bird has passed the pipe and if the pipe is golden
        if (!passedPipe && pipe.x + pipe.width < bird.x) {
            if (pipe.color === "golden") {
                sounds.passPipe.play(); // Play pass pipe sound only for golden pipes
            }
            passedPipe = true;
        }
        return true;
    });

    // Create new pipes if needed
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width / 2) {
        createPipe();
    }

    // Check for collisions
    const hitPipe = pipes.some(pipe =>
        bird.x < pipe.x + pipe.width &&
        bird.x + bird.width > pipe.x &&
        bird.y < pipe.y + pipe.height &&
        bird.y + bird.height > pipe.y
    );

    if (hitPipe || bird.y + bird.height > canvas.height || bird.y < 0) {
        gameOver = true;
        sounds.gameOver.play(); // Play game over sound
        gameOverDialog.classList.remove("hidden");
    }

    draw();
    if (!gameOver) requestAnimationFrame(update);
};

// Draw game elements
const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(images.bird, bird.x, bird.y, bird.width, bird.height);
    pipes.forEach(pipe => {
        const img = pipe.type === 'top' ? (pipe.color === "golden" ? images.goldenTopPipe : images.topPipe) : (pipe.color === "golden" ? images.goldenBottomPipe : images.bottomPipe);
        ctx.drawImage(img, pipe.x, pipe.type === 'top' ? pipe.y : canvas.height - pipe.height, pipe.width, pipe.height);
    });
};

// Event listeners
document.addEventListener("keydown", e => { if (["Space", "ArrowUp", "KeyW"].includes(e.code)) handleJump(); });
canvas.addEventListener("click", handleJump);
retryButton.addEventListener("click", () => { init(); gameStarted = false; startMessage.style.display = "block"; });
quitButton.addEventListener("click", () => window.close());

// Start the game
init();
