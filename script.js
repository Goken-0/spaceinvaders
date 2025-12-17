/**
 * ============================================
 * JEU SPACE INVADERS (FINAL - CYBERPUNK CYANTHEME)
 * ============================================
 */

// Configuration des couleurs
let colors = {
    player: '#00ffff',      // Cyan pur
    enemy: '#ff00eaff',     // Magenta néon
    miniboss: '#ffaa00',    // Orange néon
    boss: '#ff0000',        // Rouge néon
    border: '#00ffff'       // Cyan pur
};

// GESTION DU VOLUME GLOBAL
let globalVolume = 0.5;

const music = new Audio('assets/music/galacticknight.mp3');
music.loop = true;        
music.volume = globalVolume;

// Variable d'état
let shouldResumeMusic = false;
let isBigMode = false;

// UI: Panneau Personnalisation + VOLUME
const customPanel = document.createElement('div');
customPanel.id = 'customPanel';
// Style du panneau avec bordure cyan
customPanel.style.cssText = `
    position: fixed; top: 50%; right: -300px; transform: translateY(-50%); width: 300px;
    background: rgba(0, 10, 20, 0.98); border: 2px solid #00ffff; border-right: none;
    border-radius: 10px 0 0 10px; padding: 20px; z-index: 2000; transition: right 0.3s;
    box-shadow: -5px 0 30px rgba(0, 255, 255, 0.2);
`;

customPanel.innerHTML = `
    <h3 style="color: #00ffff; font-size: 14px; margin-bottom: 20px; text-align: center; text-shadow: 0 0 10px #00ffff;">REGLAGES</h3>
    
    <div style="margin-bottom: 20px;">
        <label style="color: #00ffff; font-size: 10px; display: block; margin-bottom: 5px;">VOLUME</label>
        <input type="range" id="volumeSlider" min="0" max="1" step="0.1" value="0.5">
    </div>

    <hr style="border: 1px solid #00ffff; margin-bottom: 20px; opacity: 0.3;">

    <div style="margin-bottom: 20px;">
        <label style="color: #00ffff; font-size: 10px; display: block; margin-bottom: 10px;">Vaisseau</label>
        <input type="color" id="playerColor" value="#00ffff" style="width: 100%; height: 40px; cursor: pointer; border: 2px solid #00ffff; background: transparent;">
    </div>
    <div style="margin-bottom: 20px;">
        <label style="color: #ff00eaff; font-size: 10px; display: block; margin-bottom: 10px;">Ennemis</label>
        <input type="color" id="enemyColor" value="#ff00ea" style="width: 100%; height: 40px; cursor: pointer; border: 2px solid #ff00eaff; background: transparent;">
    </div>
    <button id="resetColors" style="width: 100%; padding: 10px; background: rgba(255, 0, 0, 0.2); border: 2px solid #ff0000; color: #ff0000; font-size: 10px; cursor: pointer; border-radius: 5px; box-shadow: 0 0 10px rgba(255,0,0,0.3);">RESET COULEURS</button>
`;
document.body.appendChild(customPanel);

// LOGIQUE DU SLIDER VOLUME
const volumeSlider = document.getElementById('volumeSlider');
volumeSlider.addEventListener('input', (e) => {
    globalVolume = parseFloat(e.target.value);
    music.volume = globalVolume;
});

// BOUTON PALETTE
const togglePanelBtn = document.createElement('button');
togglePanelBtn.innerHTML = '<i class="fas fa-cog"></i>';
togglePanelBtn.className = 'game-btn cyan-style';
togglePanelBtn.style.top = '50%';
togglePanelBtn.style.right = '20px';
togglePanelBtn.style.transform = 'translateY(-50%)';
document.body.appendChild(togglePanelBtn);

let panelOpen = false;
togglePanelBtn.addEventListener('click', () => {
    panelOpen = !panelOpen;
    customPanel.style.right = panelOpen ? '0px' : '-300px';
    togglePanelBtn.style.right = panelOpen ? '320px' : '20px';
});

document.getElementById('playerColor').addEventListener('input', (e) => { colors.player = e.target.value; });
document.getElementById('enemyColor').addEventListener('input', (e) => { colors.enemy = e.target.value + 'ff'; });
document.getElementById('resetColors').addEventListener('click', () => {
    colors.player = '#00ffff';
    colors.enemy = '#ff00eaff';
    document.getElementById('playerColor').value = '#00ffff';
    document.getElementById('enemyColor').value = '#ff00ea';
});

// BOUTON MUSIQUE
const musicButton = document.createElement('button');
musicButton.id = 'musicButton';
musicButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
musicButton.className = 'game-btn red-style';
musicButton.style.top = '100px';
musicButton.style.right = '20px';
document.body.appendChild(musicButton);

let musicPlaying = false;
musicButton.addEventListener('click', () => {
    if (musicPlaying) {
        music.pause();
        musicButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
        musicButton.className = 'game-btn red-style';
    } else {
        music.volume = globalVolume;
        music.play();
        musicButton.innerHTML = '<i class="fas fa-volume-up"></i>';
        musicButton.className = 'game-btn cyan-style';
    }
    musicPlaying = !musicPlaying;
});

// GESTION CHANGEMENT D'ONGLET
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (musicPlaying) {
            music.pause();
            shouldResumeMusic = true; 
        } else {
            shouldResumeMusic = false;
        }
    } else {
        if (shouldResumeMusic) {
            music.play();
        }
    }
});

// ============================================
// LOGIQUE DE DÉMARRAGE
// ============================================

function startGameLogic() {
    initAudioContext();
    document.getElementById('startScreen').style.display = 'none';
    gameActive = true;
    gamePaused = false;
    updateLivesDisplay();
    resizeCanvas();
    spawnEnemies();
}

document.getElementById('btnYes').addEventListener('click', function () {
    const gameContainer = document.getElementById('gameContainer');
    gameContainer.requestFullscreen().then(() => {
        setTimeout(() => {
            isBigMode = true; 
            startGameLogic(); 
        }, 100);
    }).catch(err => {
        console.log("Erreur Fullscreen:", err);
        isBigMode = false;
        startGameLogic();
    });
});

document.getElementById('btnNo').addEventListener('click', function () {
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.log(err));
    }
    isBigMode = false;
    startGameLogic();
});

document.getElementById('resumeButton').addEventListener('click', function () {
    document.getElementById('pauseScreen').style.display = 'none';
    gamePaused = false;
});

document.getElementById('restartButton').addEventListener('click', function () {
    document.getElementById('pauseScreen').style.display = 'none';
    resetGame();
});

document.addEventListener('keydown', function (e) {
    if (e.code === 'Escape') {
        if (gameActive && !gamePaused) {
            gamePaused = true;
            document.getElementById('pauseScreen').style.display = 'flex';
        } else if (gameActive && gamePaused) {
            gamePaused = false;
            document.getElementById('pauseScreen').style.display = 'none';
        }
    }
});

// INITIALISATION CANVAS
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const gameOverEl = document.getElementById('gameOver');
const finalScoreEl = document.getElementById('finalScore');

// SYSTÈME AUDIO
let audioCtx = null;
let noiseBuffer = null; 

function initAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const bufferSize = audioCtx.sampleRate * 0.3;
        noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
    }
}

function playLaserSound() {
    if (!audioCtx) return;
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.3 * globalVolume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.1);
}

function playExplosionSound() {
    if (!audioCtx) return;
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.3);
    gainNode.gain.setValueAtTime(0.4 * globalVolume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.3);
}

function playHitSound() {
    if (!audioCtx || !noiseBuffer) return;
    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    const noiseGain = audioCtx.createGain();
    noiseSource.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noiseGain.gain.setValueAtTime(0.3 * globalVolume, audioCtx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    noiseSource.start(audioCtx.currentTime);
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.4);
    gainNode.gain.setValueAtTime(0.6 * globalVolume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.4);
}

function playBossHitSound() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(100, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3 * globalVolume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.start(); osc.stop(audioCtx.currentTime + 0.1);
}

function playGameOverSound() {
    if (!audioCtx) return;
    const notes = [440, 392, 349, 294, 262]; 
    const duration = 0.3;
    notes.forEach((freq, index) => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime + index * duration);
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime + index * duration);
        const vol = 0.3 * globalVolume;
        gainNode.gain.linearRampToValueAtTime(vol, audioCtx.currentTime + index * duration + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + index * duration + duration);
        oscillator.start(audioCtx.currentTime + index * duration);
        oscillator.stop(audioCtx.currentTime + index * duration + duration);
    });
}

// CLASSES
class Player {
    constructor() {
        this.width = 40;
        this.height = 40;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - 80;
        this.speed = 5;
        this.dx = 0;
        this.dy = 0;
    }
    draw() {
        if (invulnerable && Math.floor(invulnerabilityTime / 10) % 2 === 0) ctx.globalAlpha = 0.3;
        ctx.fillStyle = colors.player;
        ctx.fillRect(this.x + 18, this.y, 4, 10);
        ctx.fillRect(this.x + 16, this.y + 10, 8, 5);
        ctx.fillRect(this.x + 14, this.y + 15, 12, 5);
        ctx.fillRect(this.x + 12, this.y + 20, 16, 5);
        ctx.fillRect(this.x + 4, this.y + 25, 32, 5);
        ctx.fillRect(this.x, this.y + 30, 40, 10);
        ctx.fillStyle = '#ff6600'; 
        if (Math.random() > 0.5) { 
            ctx.fillRect(this.x + 10, this.y + 40, 6, 8);
            ctx.fillRect(this.x + 24, this.y + 40, 6, 8);
        } else {
            ctx.fillRect(this.x + 11, this.y + 40, 4, 6);
            ctx.fillRect(this.x + 25, this.y + 40, 4, 6);
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 18, this.y + 20, 4, 4);
        ctx.globalAlpha = 1.0;
    }
    update() {
        this.x += this.dx;
        this.y += this.dy;
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > canvas.height) this.y = canvas.height - this.height;
    }
    moveLeft() { this.dx = -this.speed; }
    moveRight() { this.dx = this.speed; }
    moveUp() { this.dy = -this.speed; }
    moveDown() { this.dy = this.speed; }
    stopHorizontal() { this.dx = 0; }
    stopVertical() { this.dy = 0; }
    stop() { this.dx = 0; this.dy = 0; }
}

class Bullet {
    constructor(x, y, velocityY, color, isEnemy = false) {
        this.x = x;
        this.y = y;
        this.width = isEnemy ? 6 : 4;
        this.height = 15;
        this.velocityY = velocityY;
        this.color = color;
        this.active = true;
        this.isEnemy = isEnemy;
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    update() {
        this.y += this.velocityY;
    }
}

class Enemy {
    constructor(x, y, type = 'normal') {
        this.type = type; 
        this.x = x;
        this.y = y;
        this.active = true;
        this.animFrame = 0;
        if (this.type === 'boss') {
            this.width = 120;
            this.height = 100;
            this.hp = 20 + (wave * 5); 
            this.maxHp = this.hp;
            this.scoreValue = 1000;
            this.speed = 2;
            this.dir = 1; 
        } else if (this.type === 'miniboss') {
            this.width = 40;
            this.height = 40;
            this.hp = 3; 
            this.scoreValue = 50;
            this.speed = 1.2 + (wave * 0.2);
            this.angle = Math.random() * Math.PI * 2;
        } else {
            this.width = 30;
            this.height = 30;
            this.hp = 1;
            this.scoreValue = 10;
            this.speed = 1 + (wave * 0.1);
            this.angle = Math.random() * Math.PI * 2;
        }
        this.changeDirectionTimer = 0;
    }
    draw() {
        this.animFrame += 0.1;
        if (this.type === 'boss') {
            ctx.fillStyle = colors.boss;
            ctx.fillRect(this.x + 30, this.y, 60, 20);
            ctx.fillRect(this.x + 20, this.y + 20, 80, 20);
            ctx.fillRect(this.x + 20, this.y + 40, 20, 20);
            ctx.fillStyle = '#000'; 
            ctx.fillRect(this.x + 25, this.y + 45, 10, 10);
            ctx.fillStyle = colors.boss;
            ctx.fillRect(this.x + 40, this.y + 40, 40, 20); 
            ctx.fillStyle = '#000'; 
            ctx.fillRect(this.x + 55, this.y + 50, 10, 10);
            ctx.fillStyle = colors.boss;
            ctx.fillRect(this.x + 80, this.y + 40, 20, 20); 
            ctx.fillStyle = '#000'; 
            ctx.fillRect(this.x + 85, this.y + 45, 10, 10);
            ctx.fillStyle = colors.boss;
            ctx.fillRect(this.x + 30, this.y + 60, 60, 10);
            ctx.fillRect(this.x + 35, this.y + 70, 10, 15);
            ctx.fillRect(this.x + 55, this.y + 70, 10, 15);
            ctx.fillRect(this.x + 75, this.y + 70, 10, 15);
            const hpPercent = this.hp / this.maxHp;
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(this.x, this.y - 15, this.width * hpPercent, 5);
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(this.x, this.y - 15, this.width, 5);
        } else if (this.type === 'miniboss') {
            ctx.fillStyle = colors.miniboss;
            ctx.fillRect(this.x + 10, this.y + 10, 20, 20);
            ctx.fillRect(this.x, this.y, 10, 15);
            ctx.fillRect(this.x + 30, this.y, 10, 15);
            ctx.fillRect(this.x + 5, this.y + 30, 5, 10);
            ctx.fillRect(this.x + 30, this.y + 30, 5, 10);
            ctx.fillStyle = '#fff';
            ctx.fillRect(this.x + 12, this.y + 15, 6, 6);
            ctx.fillRect(this.x + 22, this.y + 15, 6, 6);
        } else {
            ctx.fillStyle = colors.enemy;
            ctx.fillRect(this.x + 6, this.y + 6, 18, 12);
            if (Math.floor(this.animFrame) % 2 === 0) {
                ctx.fillRect(this.x + 6, this.y, 3, 6);
                ctx.fillRect(this.x + 21, this.y, 3, 6);
            } else {
                ctx.fillRect(this.x + 3, this.y, 3, 6);
                ctx.fillRect(this.x + 24, this.y, 3, 6);
            }
            ctx.fillRect(this.x, this.y + 9, 3, 12);
            ctx.fillRect(this.x + 27, this.y + 9, 3, 12);
            ctx.fillRect(this.x + 6, this.y + 21, 6, 3);
            ctx.fillRect(this.x + 18, this.y + 21, 6, 3);
            ctx.fillStyle = '#000';
            ctx.fillRect(this.x + 9, this.y + 9, 3, 3);
            ctx.fillRect(this.x + 18, this.y + 9, 3, 3);
        }
    }
    update() {
        if (this.type === 'boss') {
            this.x += this.speed * this.dir;
            if (this.x <= 0 || this.x + this.width >= canvas.width) {
                this.dir *= -1;
            }
            if (Math.random() < 0.02) { 
                 enemyBullets.push(new Bullet(this.x + this.width / 2, this.y + this.height, 6, '#00ff00', true));
            }
        } else {
            this.changeDirectionTimer++;
            if (this.changeDirectionTimer >= 60 + Math.random() * 120) {
                this.angle = Math.random() * Math.PI * 2;
                this.changeDirectionTimer = 0;
            }
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            if (this.x <= 0 || this.x + this.width >= canvas.width) this.angle = Math.PI - this.angle;
            if (this.y <= 0 || this.y + this.height >= canvas.height - 50) this.angle = -this.angle;
            this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
            this.y = Math.max(0, Math.min(canvas.height - 50 - this.height, this.y));
        }
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 2;
        this.speedX = (Math.random() - 0.5) * 4;
        this.speedY = (Math.random() - 0.5) * 4;
        this.life = 30;
        this.maxLife = 30;
        this.color = color || '#fff';
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;
    }
}

class Star {
    constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = 0;
        this.size = Math.random() * 2;
        this.speed = Math.random() * 2 + 0.5;
    }
    draw() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
    update() {
        this.y += this.speed;
        if (this.y > canvas.height) this.reset();
    }
}

// GLOBALES
let player = new Player();
let bullets = [];       
let enemyBullets = [];  
let enemies = [];
let particles = [];
let stars = [];
let score = 0;
let lives = 3;
let wave = 1; 
let gameActive = false;
let gamePaused = false;
let keys = {};
let canShoot = true;
let shootCooldown = 150;
let invulnerable = false;
let invulnerabilityTime = 0;

function resizeCanvas() {
    if (document.fullscreenElement || window.innerWidth <= 768) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    } else {
        canvas.width = 800;
        canvas.height = 600;
    }
    if (player) {
        player.x = Math.min(player.x, canvas.width - player.width);
        player.y = Math.min(player.y, canvas.height - player.height);
        if (player.y > canvas.height - 80) player.y = canvas.height - 80;
    }
}

window.addEventListener('resize', () => {
    resizeCanvas();
    createStars(); 
});

function createStars() {
    stars = [];
    for (let i = 0; i < 100; i++) stars.push(new Star());
}
createStars();

function spawnEnemies() {
    enemies = [];
    
    if (wave % 5 === 0) {
        enemies.push(new Enemy(canvas.width / 2 - 50, 50, 'boss'));
        
        const bossText = document.createElement('div');
        bossText.textContent = "BOSS BATTLE";
        bossText.style.cssText = `
            position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%);
            color: red; font-family: 'Press Start 2P'; font-size: 30px; text-shadow: 0 0 20px red;
            animation: fadeOut 3s forwards; pointer-events: none; z-index: 50; text-align: center;
        `;
        document.body.appendChild(bossText);
        setTimeout(() => bossText.remove(), 3000);
    } else {
        let cols, rows;
        let startX, enemyGap = 30, enemyWidth = 30, padding = 60;

        if (isBigMode) {
            const availableWidth = canvas.width - (padding * 2);
            cols = Math.floor(availableWidth / (enemyWidth + enemyGap));
            if (cols < 4) cols = 4;
            rows = 4;
        } else {
            cols = 8;
            rows = 3;
        }

        const totalBlockWidth = (cols * enemyWidth) + ((cols - 1) * enemyGap);
        startX = (canvas.width - totalBlockWidth) / 2;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const isMiniBoss = Math.random() < 0.15; 
                const posX = startX + (col * (enemyWidth + enemyGap));
                const posY = row * 60 + 30;
                enemies.push(new Enemy(posX, posY, isMiniBoss ? 'miniboss' : 'normal'));
            }
        }
    }
}

// APPEL INITIAL
resizeCanvas();

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ' && gameActive && canShoot && !gamePaused) {
        e.preventDefault();
        bullets.push(new Bullet(player.x + player.width / 2 - 2, player.y, -7, '#ffff00'));
        playLaserSound();
        canShoot = false;
        setTimeout(() => { canShoot = true; }, shootCooldown);
    }
    if (e.key === ' ' && !gameActive && document.getElementById('gameOver').style.display === 'flex') {
        e.preventDefault();
        resetGame();
    }
});
document.addEventListener('keyup', (e) => { keys[e.key] = false; });

if (window.innerWidth <= 768) {
    document.getElementById('mobileControls').style.display = 'block';
    document.getElementById('shootBtn').addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameActive && canShoot && !gamePaused) {
            bullets.push(new Bullet(player.x + player.width / 2 - 2, player.y, -7, '#ffff00'));
            playLaserSound();
            canShoot = false;
            setTimeout(() => { canShoot = true; }, shootCooldown);
        }
    });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (gameActive && !gamePaused) {
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            player.x = touch.clientX - rect.left - player.width / 2;
            player.y = touch.clientY - rect.top - player.height / 2;
        }
    });
}

function resetGame() {
    player = new Player();
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - 80;
    bullets = [];
    enemyBullets = [];
    particles = [];
    score = 0;
    lives = 3;
    wave = 1;
    
    gameActive = false; 
    gamePaused = false;
    canShoot = true;
    invulnerable = false;
    
    gameOverEl.style.display = 'none';
    document.getElementById('pauseScreen').style.display = 'none';
    document.getElementById('startScreen').style.display = 'flex'; 
    
    scoreEl.textContent = score;
    updateLivesDisplay();
}

function checkCollision(rect1, rect2) {
    const margin = 2;
    return rect1.x + margin < rect2.x + rect2.width - margin &&
        rect1.x + rect1.width - margin > rect2.x + margin &&
        rect1.y + margin < rect2.y + rect2.height - margin &&
        rect1.y + rect1.height - margin > rect2.y + margin;
}

function createExplosion(x, y, color) {
    for (let i = 0; i < 15; i++) particles.push(new Particle(x, y, color));
}

function update() {
    if (!gameActive || gamePaused) return;
    
    if ((keys['ArrowLeft'] || keys['q']) && (keys['ArrowUp'] || keys['z'])) { player.moveLeft(); player.moveUp(); }
    else if ((keys['ArrowRight'] || keys['d']) && (keys['ArrowUp'] || keys['z'])) { player.moveRight(); player.moveUp(); }
    else if ((keys['ArrowLeft'] || keys['q']) && (keys['ArrowDown'] || keys['s'])) { player.moveLeft(); player.moveDown(); }
    else if ((keys['ArrowRight'] || keys['d']) && (keys['ArrowDown'] || keys['s'])) { player.moveRight(); player.moveDown(); }
    else if (keys['ArrowLeft'] || keys['q']) { player.moveLeft(); player.stopVertical(); }
    else if (keys['ArrowRight'] || keys['d']) { player.moveRight(); player.stopVertical(); }
    else if (keys['ArrowUp'] || keys['z']) { player.moveUp(); player.stopHorizontal(); }
    else if (keys['ArrowDown'] || keys['s']) { player.moveDown(); player.stopHorizontal(); }
    else { player.stop(); }
    player.update();
    
    stars.forEach(star => star.update());
    
    bullets.forEach(bullet => { if (bullet.active) bullet.update(); });
    bullets = bullets.filter(bullet => bullet.y > 0 && bullet.active);
    
    enemyBullets.forEach(bullet => { if (bullet.active) bullet.update(); });
    enemyBullets = enemyBullets.filter(bullet => bullet.y < canvas.height && bullet.active);

    enemies.forEach(enemy => { if (enemy.active) enemy.update(); });
    
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        if (!bullet.active) continue;
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (!enemy.active) continue;
            
            if (checkCollision(bullet, enemy)) {
                bullet.active = false;
                enemy.hp--; 
                
                createExplosion(bullet.x, bullet.y, '#fff');

                if (enemy.hp <= 0) {
                    enemy.active = false;
                    score += enemy.scoreValue;
                    scoreEl.textContent = score;
                    createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.type === 'boss' ? '#ff0000' : '#ff00ea');
                    playExplosionSound();
                } else {
                    playBossHitSound();
                }
                bullets.splice(i, 1);
                break;
            }
        }
    }
    
    enemies = enemies.filter(enemy => enemy.active);
    
    enemies.forEach(enemy => {
        if (enemy.active && !invulnerable && checkCollision(player, enemy)) {
            playerHit();
            if (enemy.type !== 'boss') enemy.active = false; 
        }
    });
    
    enemyBullets.forEach(bullet => {
        if (bullet.active && !invulnerable && checkCollision(player, bullet)) {
            playerHit();
            bullet.active = false;
        }
    });
    
    particles = particles.filter(p => p.life > 0);
    particles.forEach(particle => particle.update());
    
    if (invulnerable) {
        invulnerabilityTime--;
        if (invulnerabilityTime <= 0) invulnerable = false;
    }
    
    if (enemies.length === 0) {
        wave++;
        score += 100 * wave;
        scoreEl.textContent = score;
        spawnEnemies();
    }
}

function playerHit() {
    lives--;
    updateLivesDisplay();
    // Explosion CYAN quand le joueur est touché
    createExplosion(player.x + player.width / 2, player.y + player.height / 2, '#00ffff');
    playHitSound(); 
    invulnerable = true;
    invulnerabilityTime = 120;
    
    if (lives <= 0) {
        gameActive = false;
        gameOverEl.style.display = 'flex';
        finalScoreEl.textContent = score;
        playGameOverSound();
    } else {
        player.x = canvas.width / 2 - player.width / 2;
        player.y = canvas.height - 80;
        enemyBullets = [];
    }
}

function draw() {
    ctx.fillStyle = 'rgba(0, 8, 20, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    stars.forEach(star => star.draw());
    particles.forEach(particle => particle.draw());
    player.draw();
    bullets.forEach(bullet => { if (bullet.active) bullet.draw(); });
    enemyBullets.forEach(bullet => { if (bullet.active) bullet.draw(); });
    enemies.forEach(enemy => { if (enemy.active) enemy.draw(); });
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function updateLivesDisplay() {
    const livesEl = document.getElementById('lives');
    livesEl.innerHTML = '';
    for (let i = 0; i < lives; i++) {
        const heart = document.createElement('span');
        heart.textContent = '❤';
        heart.className = 'heart-icon'; 
        livesEl.appendChild(heart);
    }
}

function initGame() {
    lives = 3;
    score = 0;
    scoreEl.textContent = score;
    updateLivesDisplay();
    createStars();
    // On n'appelle pas spawnEnemies ici car on attend le choix de l'utilisateur
    gameLoop();
}

initGame();