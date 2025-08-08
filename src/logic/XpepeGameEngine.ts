class DinoGame {
  gameContainer: HTMLElement;
  dino: HTMLElement;
  ground: HTMLElement;
  scoreElement: HTMLElement;
  gameOverElement: HTMLElement;
  isRunning: boolean;
  isJumping: boolean;
  isDucking: boolean;
  score: number;
  speed: number;
  obstacles: { element: HTMLElement; x: number; type: string; width: number }[];
  clouds: any[];
  gameLoop: number | null;
  obstacleSpawnTimer: number | null;
  lastObstacleTime: number;
  minSpawnDistance: number;
  baseSpawnInterval: number;

  constructor() {
    this.gameContainer = document.getElementById('gameContainer')!;
    this.dino = document.getElementById('dino')!;
    this.ground = document.getElementById('ground')!;
    this.scoreElement = document.getElementById('score')!;
    this.gameOverElement = document.getElementById('gameOver')!;

    this.isRunning = false;
    this.isJumping = false;
    this.isDucking = false;
    this.score = 0;
    this.speed = 4;
    this.obstacles = [];
    this.clouds = [];

    this.gameLoop = null;
    this.obstacleSpawnTimer = null;
    this.lastObstacleTime = 0;
    this.minSpawnDistance = 200; // Minimum distance between obstacles
    this.baseSpawnInterval = 1500; // Base spawn interval in ms

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.startGame();
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (!this.isRunning) {
          this.restartGame();
        } else if (!this.isJumping && !this.isDucking) {
          this.jump();
        }
      }

      if (e.code === 'ArrowDown') {
        e.preventDefault();
        if (this.isRunning && !this.isJumping) {
          this.duck();
        }
      }
    });

    document.addEventListener('keyup', (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown') {
        this.stopDuck();
      }
    });

    // Touch events for mobile
    this.gameContainer.addEventListener('touchstart', (e: TouchEvent) => {
      e.preventDefault();
      if (!this.isRunning) {
        this.restartGame();
      } else if (!this.isJumping && !this.isDucking) {
        this.jump();
      }
    });

    // Touch and hold for ducking
    let touchTimer: number | null = null;
    this.gameContainer.addEventListener('touchstart', (e: TouchEvent) => {
      touchTimer = window.setTimeout(() => {
        if (this.isRunning && !this.isJumping) {
          this.duck();
        }
      }, 200);
    });

    this.gameContainer.addEventListener('touchend', () => {
      if (touchTimer) {
        clearTimeout(touchTimer);
        touchTimer = null;
      }
      this.stopDuck();
    });
  }

  startGame() {
    this.isRunning = true;
    this.score = 0;
    this.speed = 4;
    this.obstacles = [];
    this.lastObstacleTime = Date.now();
    this.updateScore();

    this.gameLoop = window.setInterval(() => {
      this.update();
    }, 16); // ~60 FPS

    // Use dynamic spawning instead of fixed interval
    this.obstacleSpawnTimer = window.setInterval(() => {
      this.trySpawnObstacle();
    }, 100); // Check every 100ms if we should spawn
  }

  update() {
    this.updateScore();
    this.moveObstacles();
    this.checkCollisions();
    this.increaseSpeed();
  }

  updateScore() {
    this.score += 1;
    this.scoreElement.textContent = this.score.toString().padStart(5, '0');
  }

  jump() {
    if (this.isJumping || this.isDucking) return;

    this.isJumping = true;
    this.dino.classList.add('jump');

    const gravity = 0.8;
    const jumpStrength = 12;
    let velocity = jumpStrength;
    let position = parseFloat(this.dino.style.bottom) || 0;

    const jumpInterval = setInterval(() => {
      position += velocity;
      velocity -= gravity;

      if (position <= 0) {
        position = 0;
        this.dino.style.bottom = `${position}px`;
        this.dino.classList.remove('jump');
        clearInterval(jumpInterval);
        this.isJumping = false;
      } else {
        this.dino.style.bottom = `${position}px`;
      }
    }, 16);
  }

  duck() {
    if (this.isJumping) return;
    this.isDucking = true;
    this.dino.classList.add('duck');
  }

  stopDuck() {
    this.isDucking = false;
    this.dino.classList.remove('duck');
  }

  // Improved obstacle spawning with overlap prevention
  trySpawnObstacle() {
    if (!this.isRunning) return;

    const currentTime = Date.now();
    const timeSinceLastObstacle = currentTime - this.lastObstacleTime;
    
    // Dynamic spawn interval based on speed and randomness
    const dynamicInterval = this.baseSpawnInterval - (this.speed * 50) + (Math.random() * 800);
    
    // Check if enough time has passed and no obstacles are too close
    if (timeSinceLastObstacle < Math.max(dynamicInterval, 800)) return;
    
    // Check if the last obstacle is far enough away
    if (this.obstacles.length > 0) {
      const lastObstacle = this.obstacles[this.obstacles.length - 1];
      if (lastObstacle.x > this.getGameWidth() - this.minSpawnDistance) {
        return; // Too close to last obstacle
      }
    }

    this.spawnObstacle();
    this.lastObstacleTime = currentTime;
  }

  spawnObstacle() {
    const obstacleTypes = [
      { type: 'cactus-small', className: 'cactus', width: 20, height: 35, bottom: 12 },
      { type: 'cactus-large', className: 'cactus large', width: 25, height: 50, bottom: 12 },
      { type: 'pterodactyl-high', className: 'pterodactyl', width: 30, height: 25, bottom: 60 },
      { type: 'pterodactyl-mid', className: 'pterodactyl', width: 30, height: 25, bottom: 45 },
      { type: 'pterodactyl-low', className: 'pterodactyl', width: 30, height: 25, bottom: 30 }
    ];

    // Weighted selection - ground obstacles more common early game
    let selectedType;
    const rand = Math.random();
    if (this.score < 1000) {
      // Early game: mostly ground obstacles
      selectedType = rand < 0.8 ? obstacleTypes[Math.floor(Math.random() * 2)] : obstacleTypes[Math.floor(Math.random() * 3) + 2];
    } else {
      // Later game: more variety
      selectedType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    }

    const obstacle = document.createElement('div');
    obstacle.className = selectedType.className;
    obstacle.style.right = '0px';
    obstacle.style.bottom = `${selectedType.bottom}px`;
    obstacle.style.position = 'absolute';

    // Add animation classes for pterodactyls
    if (selectedType.type.startsWith('pterodactyl')) {
      obstacle.classList.add('flying');
    }

    this.gameContainer.appendChild(obstacle);
    
    this.obstacles.push({
      element: obstacle,
      x: this.getGameWidth(),
      type: selectedType.type,
      width: selectedType.width
    });
  }

  moveObstacles() {
    this.obstacles.forEach((obstacle, index) => {
      obstacle.x -= this.speed;
      obstacle.element.style.right = `${this.getGameWidth() - obstacle.x}px`;

      // Remove obstacles that are off-screen
      if (obstacle.x < -obstacle.width) {
        obstacle.element.remove();
        this.obstacles.splice(index, 1);
      }
    });
  }

  checkCollisions() {
    const dinoRect = this.dino.getBoundingClientRect();
    
    // Adjust hitbox based on dino state
    const hitboxAdjustment = {
      left: this.isDucking ? 8 : 5,
      right: this.isDucking ? 8 : 5,
      top: this.isDucking ? 15 : 5,
      bottom: this.isDucking ? 5 : 5
    };

    this.obstacles.forEach(obstacle => {
      const obstacleRect = obstacle.element.getBoundingClientRect();

      if (
        dinoRect.left + hitboxAdjustment.left < obstacleRect.right - 2 &&
        dinoRect.right - hitboxAdjustment.right > obstacleRect.left + 2 &&
        dinoRect.top + hitboxAdjustment.top < obstacleRect.bottom - 2 &&
        dinoRect.bottom - hitboxAdjustment.bottom > obstacleRect.top + 2
      ) {
        this.gameOver();
      }
    });
  }

  increaseSpeed() {
    // Smoother speed increase
    if (this.score > 0 && this.score % 300 === 0 && this.speed < 15) {
      this.speed += 0.3;
    }
  }

  gameOver() {
    this.isRunning = false;
    
    // Clear all intervals
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
    if (this.obstacleSpawnTimer) {
      clearInterval(this.obstacleSpawnTimer);
      this.obstacleSpawnTimer = null;
    }

    // Pause all animations
    this.ground.classList.add('pause');
    document.querySelectorAll('.cloud').forEach(cloud => cloud.classList.add('pause'));
    document.querySelectorAll('.pterodactyl').forEach(ptero => ptero.classList.add('pause'));

    this.gameOverElement.style.display = 'block';
    
    // Save high score to localStorage if available
    this.saveHighScore();
  }

  restartGame() {
    // Clean up obstacles
    this.obstacles.forEach(obstacle => {
      obstacle.element.remove();
    });
    this.obstacles = [];

    // Reset dino state
    this.dino.classList.remove('jump', 'duck');
    this.dino.style.bottom = '0px';
    this.isJumping = false;
    this.isDucking = false;

    // Resume animations
    this.ground.classList.remove('pause');
    document.querySelectorAll('.cloud').forEach(cloud => cloud.classList.remove('pause'));
    document.querySelectorAll('.pterodactyl').forEach(ptero => ptero.classList.remove('pause'));

    this.gameOverElement.style.display = 'none';
    this.startGame();
  }

  // Utility methods
  getGameWidth(): number {
    return this.gameContainer.offsetWidth || 600;
  }

  saveHighScore() {
    try {
      const currentHighScore = localStorage.getItem('dinoHighScore');
      if (!currentHighScore || this.score > parseInt(currentHighScore)) {
        localStorage.setItem('dinoHighScore', this.score.toString());
      }
    } catch (e) {
      // localStorage not available, ignore
    }
  }

  getHighScore(): number {
    try {
      const highScore = localStorage.getItem('dinoHighScore');
      return highScore ? parseInt(highScore) : 0;
    } catch (e) {
      return 0;
    }
  }

  // Method to pause/resume game
  pauseGame() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.gameLoop) clearInterval(this.gameLoop);
    if (this.obstacleSpawnTimer) clearInterval(this.obstacleSpawnTimer);
    
    this.ground.classList.add('pause');
    document.querySelectorAll('.cloud, .pterodactyl').forEach(el => el.classList.add('pause'));
  }

  resumeGame() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.gameLoop = window.setInterval(() => this.update(), 16);
    this.obstacleSpawnTimer = window.setInterval(() => this.trySpawnObstacle(), 100);
    
    this.ground.classList.remove('pause');
    document.querySelectorAll('.cloud, .pterodactyl').forEach(el => el.classList.remove('pause'));
  }
}

export default DinoGame;