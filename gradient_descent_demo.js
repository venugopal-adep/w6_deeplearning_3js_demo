// 3D Global Optimization Demo
// Developed by: Venugopal Adep

class GlobalOptimizationDemo {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = 1600;
        this.canvas.height = 800;
        
        // Colors
        this.colors = {
            white: '#ffffff',
            black: '#282828',
            red: '#ff0000',
            blue: '#0066ff',
            green: '#00ff00',
            yellow: '#ffd700'
        };
        
        // 3D projection parameters
        this.angle = 0;
        this.scale = 40;
        this.yOffset = 200;
        
        // Function bounds
        this.gridMin = -10;
        this.gridMax = 10;
        this.gridStep = 0.5;
        
        // Gradient descent parameters
        this.learningRate = 0.1;
        this.numIterations = 100;
        this.currentPos = [0.0, 0.0];
        this.positions = [[0.0, 0.0]];
        this.bestPos = [0.0, 0.0];
        this.bestValue = this.f(0.0, 0.0);
        
        // Animation state
        this.iteration = 0;
        this.autoRun = false;
        this.restarts = 0;
        this.lastAutoTime = Date.now();
        this.autoDelay = 50; // milliseconds between iterations
        
        // Mouse interaction
        this.isDragging = false;
        this.lastMouseX = 0;
        
        this.setupEventListeners();
        this.updateUI();
        this.animate();
    }
    
    // Function with multiple local minima
    f(x, y) {
        return 2 * Math.sin(0.5 * x) * Math.cos(0.5 * y) + (x * x + y * y) / 20;
    }
    
    // Gradient of the function
    gradient(x, y) {
        const dx = Math.cos(0.5 * x) * Math.cos(0.5 * y) + x / 10;
        const dy = -Math.sin(0.5 * x) * Math.sin(0.5 * y) + y / 10;
        return [dx, dy];
    }
    
    // Convert 3D coordinates to 2D screen coordinates
    project(x, y, z) {
        const xRot = x * Math.cos(this.angle) - y * Math.sin(this.angle);
        const yRot = x * Math.sin(this.angle) + y * Math.cos(this.angle);
        const zRot = z;
        
        const xProj = xRot * this.scale + this.canvas.width / 2;
        const yProj = -zRot * this.scale + this.canvas.height / 2 - yRot * this.scale * 0.3 + this.yOffset;
        
        return [Math.floor(xProj), Math.floor(yProj)];
    }
    
    // Get color based on z-value
    getColor(z) {
        const r = Math.max(0, Math.min(255, Math.floor(128 + z * 50)));
        const g = Math.max(0, Math.min(255, Math.floor(128 - Math.abs(z) * 50)));
        const b = Math.max(0, Math.min(255, Math.floor(128 - z * 50)));
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    // Draw the 3D function surface
    drawSurface() {
        const ctx = this.ctx;
        
        // Draw surface with mesh
        for (let x = this.gridMin; x < this.gridMax; x += this.gridStep) {
            for (let y = this.gridMin; y < this.gridMax; y += this.gridStep) {
                const z = this.f(x, y);
                const color = this.getColor(z);
                
                const [x1, y1] = this.project(x, y, z);
                const [x2, y2] = this.project(x + this.gridStep, y, this.f(x + this.gridStep, y));
                const [x3, y3] = this.project(x, y + this.gridStep, this.f(x, y + this.gridStep));
                
                ctx.strokeStyle = color;
                ctx.lineWidth = 1;
                ctx.globalAlpha = 0.6;
                
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x3, y3);
                ctx.stroke();
            }
        }
        
        ctx.globalAlpha = 1.0;
    }
    
    // Draw gradient descent path
    drawPath() {
        if (this.positions.length < 2) return;
        
        const ctx = this.ctx;
        
        for (let i = 1; i < this.positions.length; i++) {
            const [x1, y1] = this.positions[i - 1];
            const [x2, y2] = this.positions[i];
            
            const z1 = this.f(x1, y1);
            const z2 = this.f(x2, y2);
            
            const [sx1, sy1] = this.project(x1, y1, z1);
            const [sx2, sy2] = this.project(x2, y2, z2);
            
            // Draw path with gradient effect
            const gradient = ctx.createLinearGradient(sx1, sy1, sx2, sy2);
            gradient.addColorStop(0, `rgba(255, 0, 0, ${0.5 + 0.5 * i / this.positions.length})`);
            gradient.addColorStop(1, `rgba(255, 100, 100, ${0.5 + 0.5 * i / this.positions.length})`);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            // Add glow effect
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.colors.red;
            
            ctx.beginPath();
            ctx.moveTo(sx1, sy1);
            ctx.lineTo(sx2, sy2);
            ctx.stroke();
            
            ctx.shadowBlur = 0;
        }
    }
    
    // Draw current position marker
    drawCurrentPosition() {
        const [x, y] = this.currentPos;
        const z = this.f(x, y);
        const [sx, sy] = this.project(x, y, z);
        
        const ctx = this.ctx;
        
        // Outer glow
        for (let i = 3; i > 0; i--) {
            ctx.beginPath();
            ctx.arc(sx, sy, 8 + i * 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 102, 255, ${0.3 / i})`;
            ctx.fill();
        }
        
        // Main circle
        ctx.beginPath();
        ctx.arc(sx, sy, 8, 0, Math.PI * 2);
        ctx.fillStyle = this.colors.blue;
        ctx.fill();
        ctx.strokeStyle = this.colors.white;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Inner highlight
        ctx.beginPath();
        ctx.arc(sx - 2, sy - 2, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();
    }
    
    // Draw best position marker
    drawBestPosition() {
        const [x, y] = this.bestPos;
        const z = this.bestValue;
        const [sx, sy] = this.project(x, y, z);
        
        const ctx = this.ctx;
        
        // Animated pulsing glow
        const pulseScale = 1 + 0.3 * Math.sin(Date.now() / 300);
        
        for (let i = 3; i > 0; i--) {
            ctx.beginPath();
            ctx.arc(sx, sy, (10 + i * 4) * pulseScale, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 215, 0, ${0.4 / i})`;
            ctx.fill();
        }
        
        // Star shape
        this.drawStar(ctx, sx, sy, 5, 10, 5);
        ctx.fillStyle = this.colors.yellow;
        ctx.fill();
        ctx.strokeStyle = this.colors.white;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // Draw a star shape
    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
    }
    
    // Gradient descent step
    gradientDescentStep() {
        const [x, y] = this.currentPos;
        const [dx, dy] = this.gradient(x, y);
        
        this.currentPos = [
            x - this.learningRate * dx,
            y - this.learningRate * dy
        ];
        
        this.positions.push([...this.currentPos]);
        
        const currentValue = this.f(this.currentPos[0], this.currentPos[1]);
        if (currentValue < this.bestValue) {
            this.bestPos = [...this.currentPos];
            this.bestValue = currentValue;
            this.showStatus('🎯 New Best Found!');
        }
        
        this.updateUI();
    }
    
    // Random restart
    randomRestart() {
        this.currentPos = [
            Math.random() * 20 - 10,
            Math.random() * 20 - 10
        ];
        this.positions = [[...this.currentPos]];
        this.iteration = 0;
        this.restarts++;
        this.showStatus('🔄 Random Restart!');
        this.updateUI();
    }
    
    // Show status banner
    showStatus(message) {
        const banner = document.getElementById('status-banner');
        banner.textContent = message;
        banner.classList.remove('show');
        void banner.offsetWidth; // Trigger reflow
        banner.classList.add('show');
        
        setTimeout(() => {
            banner.classList.remove('show');
        }, 2000);
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            switch(e.key.toLowerCase()) {
                case 'arrowleft':
                    this.angle -= 0.1;
                    break;
                case 'arrowright':
                    this.angle += 0.1;
                    break;
                case ' ':
                    e.preventDefault();
                    this.autoRun = !this.autoRun;
                    this.updateAutoButton();
                    if (this.autoRun) {
                        this.showStatus('▶️ Auto Mode Started');
                    } else {
                        this.showStatus('⏸️ Auto Mode Paused');
                    }
                    break;
                case 'r':
                    this.randomRestart();
                    break;
            }
        });
        
        // Mouse events for clicking on surface
        this.canvas.addEventListener('click', (e) => {
            if (this.isDragging) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // Simple approximation to map screen coordinates back to 3D
            const x = (mouseX - this.canvas.width / 2) / this.scale;
            const y = (this.canvas.height / 2 + this.yOffset - mouseY) / this.scale;
            
            // Rotate back
            const xWorld = x * Math.cos(-this.angle) - y * Math.sin(-this.angle);
            const yWorld = x * Math.sin(-this.angle) + y * Math.cos(-this.angle);
            
            // Clamp to bounds
            if (xWorld >= this.gridMin && xWorld <= this.gridMax &&
                yWorld >= this.gridMin && yWorld <= this.gridMax) {
                this.currentPos = [xWorld, yWorld];
                this.positions = [[...this.currentPos]];
                this.iteration = 0;
                this.showStatus('📍 Position Set!');
                this.updateUI();
            }
        });
        
        // Mouse drag for rotation
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastMouseX = e.clientX;
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const deltaX = e.clientX - this.lastMouseX;
                this.angle += deltaX * 0.005;
                this.lastMouseX = e.clientX;
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
        });
        
        // Button events
        document.getElementById('auto-btn').addEventListener('click', () => {
            this.autoRun = !this.autoRun;
            this.updateAutoButton();
            if (this.autoRun) {
                this.showStatus('▶️ Auto Mode Started');
            } else {
                this.showStatus('⏸️ Auto Mode Paused');
            }
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.randomRestart();
        });
    }
    
    // Update auto button appearance
    updateAutoButton() {
        const btn = document.getElementById('auto-btn');
        if (this.autoRun) {
            btn.textContent = '⏸️ Auto Mode: ON';
            btn.classList.add('active');
        } else {
            btn.textContent = '▶️ Auto Mode: OFF';
            btn.classList.remove('active');
        }
    }
    
    // Update UI values
    updateUI() {
        document.getElementById('iteration-value').textContent = this.iteration;
        document.getElementById('current-pos').textContent = 
            `${this.currentPos[0].toFixed(2)}, ${this.currentPos[1].toFixed(2)}`;
        document.getElementById('current-value').textContent = 
            this.f(this.currentPos[0], this.currentPos[1]).toFixed(4);
        document.getElementById('best-pos').textContent = 
            `${this.bestPos[0].toFixed(2)}, ${this.bestPos[1].toFixed(2)}`;
        document.getElementById('best-value').textContent = this.bestValue.toFixed(4);
        document.getElementById('restarts').textContent = this.restarts;
    }
    
    // Update logic
    update() {
        if (this.autoRun) {
            const now = Date.now();
            if (now - this.lastAutoTime >= this.autoDelay) {
                if (this.iteration < this.numIterations) {
                    this.gradientDescentStep();
                    this.iteration++;
                } else {
                    this.randomRestart();
                }
                this.lastAutoTime = now;
            }
        }
    }
    
    // Draw everything
    draw() {
        const ctx = this.ctx;
        
        // Clear canvas
        ctx.fillStyle = '#f0f0f5';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw 3D surface
        this.drawSurface();
        
        // Draw gradient descent path
        this.drawPath();
        
        // Draw markers
        this.drawBestPosition();
        this.drawCurrentPosition();
    }
    
    // Animation loop
    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when page loads
window.addEventListener('load', () => {
    new GlobalOptimizationDemo();
});
