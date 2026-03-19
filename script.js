/* =================================================
   ECO SORT ARCADE — Game Logic
   ================================================= */

// ---- Item Catalog ----
const ITEMS = [
    // Eco Friendly
    { emoji: '🍎', name: 'Apple', category: 'eco' },
    { emoji: '🥕', name: 'Carrot', category: 'eco' },
    { emoji: '🥬', name: 'Lettuce', category: 'eco' },
    { emoji: '🌻', name: 'Sunflower', category: 'eco' },
    { emoji: '🪵', name: 'Wood Log', category: 'eco' },
    { emoji: '🧺', name: 'Wicker Basket', category: 'eco' },
    { emoji: '🍂', name: 'Dried Leaves', category: 'eco' },
    { emoji: '🫖', name: 'Ceramic Teapot', category: 'eco' },
    { emoji: '🧵', name: 'Cotton Thread', category: 'eco' },
    { emoji: '📦', name: 'Cardboard Box', category: 'eco' },
    { emoji: '🍌', name: 'Banana Peel', category: 'eco' },
    { emoji: '🌽', name: 'Corn Cob', category: 'eco' },
    { emoji: '🥚', name: 'Egg Shell', category: 'eco' },
    { emoji: '🍞', name: 'Stale Bread', category: 'eco' },
    { emoji: '☕', name: 'Coffee Grounds', category: 'eco' },
    { emoji: '🧴', name: 'Paper Bag', category: 'eco' },
    { emoji: '🪴', name: 'Potted Plant', category: 'eco' },
    { emoji: '🫒', name: 'Olive Pit', category: 'eco' },

    // Harmful
    { emoji: '🔋', name: 'Battery', category: 'harmful' },
    { emoji: '🛢️', name: 'Oil Drum', category: 'harmful' },
    { emoji: '🚬', name: 'Cigarette', category: 'harmful' },
    { emoji: '💊', name: 'Chemical Pills', category: 'harmful' },
    { emoji: '🎨', name: 'Paint Can', category: 'harmful' },
    { emoji: '📱', name: 'Old Phone', category: 'harmful' },
    { emoji: '💡', name: 'CFL Bulb', category: 'harmful' },
    { emoji: '🧪', name: 'Toxic Chemical', category: 'harmful' },
    { emoji: '🥫', name: 'Aerosol Can', category: 'harmful' },
    { emoji: '🖨️', name: 'Ink Cartridge', category: 'harmful' },
    { emoji: '⛽', name: 'Fuel Can', category: 'harmful' },
    { emoji: '🧯', name: 'Fire Extinguisher', category: 'harmful' },
    { emoji: '🪥', name: 'Plastic Brush', category: 'harmful' },
    { emoji: '🧽', name: 'Synthetic Sponge', category: 'harmful' },
    { emoji: '🥤', name: 'Styrofoam Cup', category: 'harmful' },
    { emoji: '🛍️', name: 'Plastic Bag', category: 'harmful' },
    { emoji: '💻', name: 'Old Laptop', category: 'harmful' },
    { emoji: '🔌', name: 'E-Waste Cable', category: 'harmful' },
];

// ---- Audio Engine ----
class AudioEngine {
    constructor() {
        this.ctx = null;
        this.ready = false;
    }

    init() {
        if (this.ready) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.ready = true;
        } catch (e) { /* silent */ }
    }

    play(type) {
        if (!this.ready) this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        if (type === 'correct') {
            this._tone(523.25, 0.08, now, 'sine', 0.12);
            this._tone(659.25, 0.08, now + 0.06, 'sine', 0.12);
            this._tone(783.99, 0.1, now + 0.12, 'sine', 0.10);
        } else if (type === 'wrong') {
            this._tone(220, 0.15, now, 'sawtooth', 0.08);
            this._tone(180, 0.2, now + 0.08, 'sawtooth', 0.06);
        } else if (type === 'combo') {
            this._tone(880, 0.06, now, 'sine', 0.08);
            this._tone(1046.5, 0.08, now + 0.05, 'sine', 0.08);
        } else if (type === 'tick') {
            this._tone(1000, 0.03, now, 'sine', 0.05);
        } else if (type === 'gameover') {
            this._tone(523.25, 0.2, now, 'sine', 0.1);
            this._tone(392, 0.2, now + 0.15, 'sine', 0.1);
            this._tone(329.63, 0.3, now + 0.3, 'sine', 0.1);
            this._tone(261.63, 0.5, now + 0.5, 'sine', 0.08);
        }
    }

    _tone(freq, dur, time, type, vol) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + dur + 0.01);
    }
}

// ---- Particles ----
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    burst(x, y, color, count = 12) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.5;
            const speed = 2 + Math.random() * 4;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 4,
                color,
                life: 1,
                decay: 0.015 + Math.random() * 0.02,
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.96;
            p.vy *= 0.96;
            p.life -= p.decay;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.globalAlpha = 1;
        requestAnimationFrame(() => this.animate());
    }
}

// ---- Main Game ----
class EcoSortGame {
    constructor() {
        // DOM
        this.container = document.getElementById('gameContainer');
        this.startScreen = document.getElementById('startScreen');
        this.gameScreen = document.getElementById('gameScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.btnStart = document.getElementById('btnStart');
        this.btnRestart = document.getElementById('btnRestart');

        this.timerBar = document.getElementById('timerBar');
        this.timerText = document.getElementById('timerText');
        this.scoreEl = document.getElementById('scoreValue');
        this.streakEl = document.getElementById('streakValue');
        this.comboEl = document.getElementById('comboValue');
        this.itemCard = document.getElementById('itemCard');
        this.itemEmoji = document.getElementById('itemEmoji');
        this.itemName = document.getElementById('itemName');
        this.ringFill = document.getElementById('ringFill');
        this.floatingScores = document.getElementById('floatingScores');
        this.binEco = document.getElementById('binEco');
        this.binHarmful = document.getElementById('binHarmful');

        // State
        this.state = 'start'; // start | playing | over
        this.score = 0;
        this.streak = 0;
        this.bestStreak = 0;
        this.correct = 0;
        this.wrong = 0;
        this.totalAttempts = 0;
        this.timeRemaining = 60;
        this.totalTime = 60;
        this.currentItem = null;
        this.itemTimeLimit = 3000; // ms to sort each item
        this.itemSpawnTime = 0;
        this.locked = false; // prevent input during animations
        this.highScore = parseInt(localStorage.getItem('ecosort_hs') || '0', 10);

        // Systems
        this.audio = new AudioEngine();
        this.particles = new ParticleSystem(document.getElementById('particlesCanvas'));

        // Timers
        this.gameTickId = null;
        this.itemTickId = null;

        this.init();
    }

    init() {
        // Show high score on start screen
        if (this.highScore > 0) {
            document.getElementById('startHighscore').innerHTML =
                `🏆 High Score: <span class="hs-val">${this.highScore}</span>`;
        }

        // Event Listeners
        this.btnStart.addEventListener('click', () => this.startGame());
        this.btnRestart.addEventListener('click', () => this.startGame());

        document.addEventListener('keydown', (e) => {
            if (e.repeat) return;

            if (this.state === 'start') {
                if (e.code === 'Space' || e.code === 'Enter') {
                    e.preventDefault();
                    this.startGame();
                }
                return;
            }

            if (this.state === 'over') {
                if (e.code === 'Space' || e.code === 'Enter') {
                    e.preventDefault();
                    this.startGame();
                }
                return;
            }

            if (this.state === 'playing') {
                if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                    e.preventDefault();
                    this.sort('eco');
                } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                    e.preventDefault();
                    this.sort('harmful');
                }
            }
        });
    }

    showScreen(name) {
        this.startScreen.classList.remove('active');
        this.gameScreen.classList.remove('active');
        this.gameOverScreen.classList.remove('active');

        if (name === 'start') this.startScreen.classList.add('active');
        if (name === 'game') this.gameScreen.classList.add('active');
        if (name === 'over') this.gameOverScreen.classList.add('active');
    }

    // ---- Game Flow ----
    startGame() {
        this.audio.init();
        this.state = 'playing';
        this.score = 0;
        this.streak = 0;
        this.bestStreak = 0;
        this.correct = 0;
        this.wrong = 0;
        this.totalAttempts = 0;
        this.timeRemaining = this.totalTime;
        this.itemTimeLimit = 3000;
        this.locked = false;
        this.currentItem = null;

        this.scoreEl.textContent = '0';
        this.streakEl.textContent = '0';
        this.comboEl.classList.remove('visible');
        this.timerBar.style.width = '100%';
        this.timerBar.classList.remove('warning', 'critical');
        this.timerText.textContent = '60';
        this.floatingScores.innerHTML = '';

        this.showScreen('game');

        // Start ticking
        this.lastTick = performance.now();
        if (this.gameTickId) cancelAnimationFrame(this.gameTickId);
        this.gameTick();

        this.spawnItem();
    }

    gameTick() {
        if (this.state !== 'playing') return;

        const now = performance.now();
        const dt = (now - this.lastTick) / 1000;
        this.lastTick = now;

        // Update game timer
        this.timeRemaining -= dt;
        if (this.timeRemaining <= 0) {
            this.timeRemaining = 0;
            this.endGame();
            return;
        }

        const pct = (this.timeRemaining / this.totalTime) * 100;
        this.timerBar.style.width = pct + '%';
        this.timerText.textContent = Math.ceil(this.timeRemaining);

        if (pct <= 16) {
            this.timerBar.classList.add('critical');
            this.timerBar.classList.remove('warning');
        } else if (pct <= 33) {
            this.timerBar.classList.add('warning');
            this.timerBar.classList.remove('critical');
        } else {
            this.timerBar.classList.remove('warning', 'critical');
        }

        // Play tick sound at 10, 5, 4, 3, 2, 1
        const sec = Math.ceil(this.timeRemaining);
        const prevSec = Math.ceil(this.timeRemaining + dt);
        if (sec !== prevSec && sec <= 5 && sec >= 1) {
            this.audio.play('tick');
        }

        // Update item timer ring
        if (this.currentItem && !this.locked) {
            const elapsed = now - this.itemSpawnTime;
            const ringPct = Math.min(elapsed / this.itemTimeLimit, 1);
            const circumference = 339.292;
            this.ringFill.style.strokeDashoffset = circumference * ringPct;

            if (ringPct >= 0.85) {
                this.ringFill.classList.add('critical');
                this.ringFill.classList.remove('warning');
            } else if (ringPct >= 0.6) {
                this.ringFill.classList.add('warning');
                this.ringFill.classList.remove('critical');
            } else {
                this.ringFill.classList.remove('warning', 'critical');
            }

            // Time expired for this item
            if (elapsed >= this.itemTimeLimit) {
                this.missItem();
            }
        }

        this.gameTickId = requestAnimationFrame(() => this.gameTick());
    }

    spawnItem() {
        if (this.state !== 'playing') return;

        // Pick random item, avoid repeating same item twice in a row
        let item;
        do {
            item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
        } while (this.currentItem && item.name === this.currentItem.name);

        this.currentItem = item;
        this.itemSpawnTime = performance.now();

        this.itemEmoji.textContent = item.emoji;
        this.itemName.textContent = item.name;

        // Reset ring
        this.ringFill.style.strokeDashoffset = '0';
        this.ringFill.classList.remove('warning', 'critical');

        // Spawn animation
        this.itemCard.classList.remove('spawn', 'correct-left', 'correct-right', 'wrong');
        void this.itemCard.offsetWidth; // force reflow
        this.itemCard.classList.add('spawn');

        this.locked = false;
    }

    sort(choice) {
        if (this.locked || !this.currentItem || this.state !== 'playing') return;
        this.locked = true;
        this.totalAttempts++;

        const isCorrect = this.currentItem.category === choice;

        if (isCorrect) {
            this.correct++;
            this.streak++;
            if (this.streak > this.bestStreak) this.bestStreak = this.streak;

            // Score: base 10 + streak bonus
            let points = 10;
            if (this.streak >= 10) points = 20;
            else if (this.streak >= 5) points = 15;

            // Speed bonus
            const elapsed = performance.now() - this.itemSpawnTime;
            const speedRatio = 1 - (elapsed / this.itemTimeLimit);
            if (speedRatio > 0.7) points += 5;

            this.score += points;
            this.scoreEl.textContent = this.score;
            this.streakEl.textContent = this.streak;

            // Combo display
            if (this.streak >= 3) {
                this.comboEl.textContent = `🔥 ${this.streak}x Streak!`;
                this.comboEl.classList.remove('visible');
                void this.comboEl.offsetWidth;
                this.comboEl.classList.add('visible');
                if (this.streak % 5 === 0) this.audio.play('combo');
            }

            // Slide animation
            const slideClass = choice === 'eco' ? 'correct-left' : 'correct-right';
            this.itemCard.classList.remove('spawn', 'correct-left', 'correct-right', 'wrong');
            void this.itemCard.offsetWidth;
            this.itemCard.classList.add(slideClass);

            // Bin pulse
            const bin = choice === 'eco' ? this.binEco : this.binHarmful;
            bin.classList.add('pulse');
            setTimeout(() => bin.classList.remove('pulse'), 300);

            // Particles
            const binRect = bin.getBoundingClientRect();
            const contRect = this.container.getBoundingClientRect();
            const px = binRect.left - contRect.left + binRect.width / 2;
            const py = binRect.top - contRect.top + binRect.height / 2;
            const color = choice === 'eco' ? '#22c55e' : '#ef4444';
            this.particles.burst(px, py, color, 16);

            // Floating score
            this.showFloatingScore(`+${points}`, true);

            this.audio.play('correct');

            // Increase difficulty
            this.itemTimeLimit = Math.max(1200, 3000 - (this.correct * 30));

            setTimeout(() => this.spawnItem(), 380);

        } else {
            this.wrong++;
            this.streak = 0;
            this.score = Math.max(0, this.score - 5);

            this.scoreEl.textContent = this.score;
            this.streakEl.textContent = '0';
            this.comboEl.classList.remove('visible');

            // Shake
            this.itemCard.classList.remove('spawn', 'correct-left', 'correct-right', 'wrong');
            void this.itemCard.offsetWidth;
            this.itemCard.classList.add('wrong');

            this.showFloatingScore('-5', false);
            this.audio.play('wrong');

            // Red flash on container
            this.container.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.5), 0 24px 80px rgba(0,0,0,0.5)';
            setTimeout(() => {
                this.container.style.boxShadow = '';
            }, 300);

            setTimeout(() => {
                this.locked = false;
                this.itemCard.classList.remove('wrong');
            }, 480);
        }
    }

    missItem() {
        if (this.locked || !this.currentItem || this.state !== 'playing') return;
        this.locked = true;
        this.totalAttempts++;
        this.wrong++;
        this.streak = 0;
        this.score = Math.max(0, this.score - 5);

        this.scoreEl.textContent = this.score;
        this.streakEl.textContent = '0';
        this.comboEl.classList.remove('visible');

        this.itemCard.classList.remove('spawn', 'correct-left', 'correct-right', 'wrong');
        void this.itemCard.offsetWidth;
        this.itemCard.classList.add('wrong');

        this.showFloatingScore('⏰ -5', false);
        this.audio.play('wrong');

        setTimeout(() => this.spawnItem(), 500);
    }

    showFloatingScore(text, positive) {
        const el = document.createElement('div');
        el.className = `float-score ${positive ? 'positive' : 'negative'}`;
        el.textContent = text;

        // Position near center
        const contRect = this.container.getBoundingClientRect();
        el.style.left = (contRect.width / 2 - 20) + 'px';
        el.style.top = (contRect.height / 2 - 80) + 'px';

        this.floatingScores.appendChild(el);
        setTimeout(() => el.remove(), 850);
    }

    endGame() {
        this.state = 'over';
        if (this.gameTickId) cancelAnimationFrame(this.gameTickId);

        this.audio.play('gameover');

        const isNewRecord = this.score > this.highScore;
        if (isNewRecord) {
            this.highScore = this.score;
            localStorage.setItem('ecosort_hs', this.highScore.toString());
        }

        const accuracy = this.totalAttempts > 0
            ? Math.round((this.correct / this.totalAttempts) * 100)
            : 0;

        // Determine message
        let emoji = '🌍';
        let title = "Time's Up!";
        let subtitle = 'Great effort, eco warrior!';

        if (accuracy >= 90 && this.correct >= 15) {
            emoji = '🌟'; title = 'Amazing!'; subtitle = 'You\'re a true eco champion!';
        } else if (accuracy >= 75) {
            emoji = '💚'; title = 'Well Done!'; subtitle = 'The planet thanks you!';
        } else if (accuracy < 50) {
            emoji = '🤔'; title = 'Keep Trying!'; subtitle = 'Practice makes perfect!';
        }

        document.getElementById('goEmoji').textContent = emoji;
        document.getElementById('goTitle').textContent = title;
        document.getElementById('goSubtitle').textContent = subtitle;
        document.getElementById('goScore').textContent = this.score;
        document.getElementById('goCorrect').textContent = this.correct;
        document.getElementById('goWrong').textContent = this.wrong;
        document.getElementById('goAccuracy').textContent = accuracy + '%';
        document.getElementById('goBestStreak').textContent = this.bestStreak;
        document.getElementById('goHighscoreValue').textContent = this.highScore;

        const newRecordEl = document.getElementById('goNewRecord');
        if (isNewRecord && this.score > 0) {
            newRecordEl.classList.remove('hidden');
        } else {
            newRecordEl.classList.add('hidden');
        }

        // Show start high score next time
        document.getElementById('startHighscore').innerHTML =
            `🏆 High Score: <span class="hs-val">${this.highScore}</span>`;

        this.showScreen('over');

        // Celebration particles for new record
        if (isNewRecord && this.score > 0) {
            const cx = this.container.offsetWidth / 2;
            const cy = this.container.offsetHeight / 2;
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    this.particles.burst(
                        cx + (Math.random() - 0.5) * 200,
                        cy + (Math.random() - 0.5) * 100,
                        ['#fbbf24', '#22c55e', '#38bdf8', '#a78bfa'][Math.floor(Math.random() * 4)],
                        20
                    );
                }, i * 150);
            }
        }
    }
}

// ---- Boot ----
const game = new EcoSortGame();
