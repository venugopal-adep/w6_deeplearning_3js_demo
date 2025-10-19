class NeuralNetworkDemo {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = 1600;
        this.canvas.height = 900;
        
        // Colors
        this.colors = {
            background: '#f0f0f5',
            black: '#282828',
            red: '#dc5050',
            green: '#50c864',
            blue: '#3c78d2',
            yellow: '#f0c83c',
            gray: '#b4b4be',
            purple: '#9664c8',
            teal: '#50c8b4'
        };
        
        // Network parameters
        this.numInputs = 3;
        this.weights = this.randomWeights();
        this.bias = this.randomValue();
        this.learningRate = 0.1;
        
        // Network state
        this.inputs = Array(this.numInputs).fill(0).map(() => Math.random());
        this.target = Math.random();
        this.output = 0;
        this.error = 0;
        this.epoch = 0;
        
        // Animation state
        this.forwardProp = false;
        this.backwardProp = false;
        this.flashTimer = 0;
        this.forwardCompleted = false;
        this.autoMode = false;
        this.lastAutoTime = Date.now();
        
        // Signal flow animation
        this.signalParticles = [];
        this.animationProgress = 0;
        this.animationSpeed = 0.02; // Slower for visibility
        
        // Weight update visualization
        this.updatingWeights = new Set();
        this.updatingBias = false;
        this.updateFlashTimer = 0;
        
        // Particles for visual effects
        this.particles = [];
        
        // Grid settings
        this.gridSize = 30;
        
        this.setupEventListeners();
        this.updateOutput();
        this.updateUI();
        this.animate();
    }
    
    randomValue() {
        return Math.random() * 2 - 1;
    }
    
    randomWeights() {
        return Array(this.numInputs).fill(0).map(() => this.randomValue());
    }
    
    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }
    
    sigmoidDerivative(x) {
        return x * (1 - x);
    }
    
    neuronOutput(inputs) {
        let weightedSum = 0;
        for (let i = 0; i < inputs.length; i++) {
            weightedSum += this.weights[i] * inputs[i];
        }
        weightedSum += this.bias;
        return this.sigmoid(weightedSum);
    }
    
    updateOutput() {
        this.output = this.neuronOutput(this.inputs);
        this.error = this.target - this.output;
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            switch(e.key.toLowerCase()) {
                case 'r':
                    this.reset();
                    break;
                case 'f':
                    if (!this.forwardProp && !this.backwardProp) {
                        this.forwardProp = true;
                        this.flashTimer = 0;
                        this.animationProgress = 0;
                        this.startForwardAnimation();
                    }
                    break;
                case 'b':
                    if (!this.forwardProp && !this.backwardProp) {
                        this.backwardProp = true;
                        this.flashTimer = 0;
                        this.animationProgress = 0;
                        this.startBackwardAnimation();
                    }
                    break;
                case 't':
                    this.target = Math.random();
                    this.updateOutput();
                    this.updateUI();
                    break;
            }
        });
        
        // Mouse click on inputs
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Check if clicking on input neurons
            for (let i = 0; i < this.numInputs; i++) {
                const inputX = this.canvas.width / 5;
                const inputY = this.canvas.height / 4 + i * (this.canvas.height / 4);
                const distance = Math.hypot(x - inputX, y - inputY);
                
                if (distance < 40) {
                    this.inputs[i] = Math.random();
                    this.updateOutput();
                    this.updateUI();
                    this.createParticles(inputX, inputY, this.colors.red);
                }
            }
        });
        
        // Auto mode button
        const autoBtn = document.getElementById('auto-btn');
        autoBtn.addEventListener('click', () => {
            this.autoMode = !this.autoMode;
            autoBtn.textContent = `Auto Mode: ${this.autoMode ? 'ON' : 'OFF'}`;
            autoBtn.classList.toggle('active', this.autoMode);
            this.lastAutoTime = Date.now();
        });
        
        // Learning rate slider
        const lrSlider = document.getElementById('lr-slider');
        lrSlider.addEventListener('input', (e) => {
            this.learningRate = parseFloat(e.target.value);
            document.getElementById('slider-value').textContent = this.learningRate.toFixed(3);
            document.getElementById('lr-value').textContent = this.learningRate.toFixed(3);
        });
    }
    
    reset() {
        this.weights = this.randomWeights();
        this.bias = this.randomValue();
        this.epoch = 0;
        this.forwardCompleted = false;
        this.forwardProp = false;
        this.backwardProp = false;
        this.signalParticles = [];
        this.animationProgress = 0;
        this.updatingWeights.clear();
        this.updatingBias = false;
        this.updateFlashTimer = 0;
        this.updateOutput();
        this.updateUI();
    }
    
    createParticles(x, y, color) {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                color: color,
                size: Math.random() * 3 + 2,
                life: 30
            });
        }
    }
    
    updateUI() {
        document.getElementById('error-value').textContent = this.error.toFixed(4);
        document.getElementById('target-value').textContent = this.target.toFixed(4);
        document.getElementById('epoch-value').textContent = this.epoch;
    }
    
    draw3DGrid() {
        const ctx = this.ctx;
        
        // Vertical lines
        for (let x = 0; x < this.canvas.width; x += this.gridSize) {
            const intensity = 255 - Math.floor(150 * (x / this.canvas.width));
            ctx.strokeStyle = `rgb(${intensity}, ${intensity}, ${intensity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < this.canvas.height; y += this.gridSize) {
            const intensity = 255 - Math.floor(150 * (y / this.canvas.height));
            ctx.strokeStyle = `rgb(${intensity}, ${intensity}, ${intensity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();
        }
    }
    
    draw3DNeuron(x, y, radius, color, glow = false, zOffset = 0) {
        const ctx = this.ctx;
        
        // Shadow
        const shadowOffset = radius / 3;
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x + shadowOffset + zOffset, y + shadowOffset, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Glow effect
        if (glow) {
            for (let i = 0; i < 3; i++) {
                const glowRadius = radius + (3 - i) * 5;
                const alpha = (100 - i * 30) / 255;
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }
        
        // Gradient neuron
        const gradient = ctx.createRadialGradient(x - radius/3, y - radius/3, 0, x, y, radius);
        gradient.addColorStop(0, this.lightenColor(color, 40));
        gradient.addColorStop(1, color);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Highlight
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x - radius/3, y - radius/3, radius/4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Border
        ctx.strokeStyle = this.colors.black;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    lightenColor(color, amount) {
        const rgb = this.hexToRgb(color);
        return `rgb(${Math.min(255, rgb.r + amount)}, ${Math.min(255, rgb.g + amount)}, ${Math.min(255, rgb.b + amount)})`;
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : {r: 0, g: 0, b: 0};
    }
    
    draw3DLine(x1, y1, x2, y2, color, thickness = 3, highlight = false) {
        const ctx = this.ctx;
        
        // Shadow
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = thickness;
        ctx.beginPath();
        ctx.moveTo(x1 + 5, y1 + 5);
        ctx.lineTo(x2 + 5, y2 + 5);
        ctx.stroke();
        ctx.restore();
        
        // Highlight glow if updating
        if (highlight) {
            ctx.save();
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ffd700';
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = thickness + 4;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.restore();
        }
        
        // Line
        ctx.strokeStyle = highlight ? '#ffd700' : color;
        ctx.lineWidth = thickness;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    
    draw3DArrow(x1, y1, x2, y2, color, text, active = false) {
        const ctx = this.ctx;
        
        if (active) {
            // Animated arrow with segments
            const segments = 20;
            for (let i = 0; i < segments; i++) {
                const progress = (i + 1) / segments;
                const segX1 = x1 + (x2 - x1) * (i / segments);
                const segY1 = y1 + (y2 - y1) * (i / segments);
                const segX2 = x1 + (x2 - x1) * ((i + 1) / segments);
                const segY2 = y1 + (y2 - y1) * ((i + 1) / segments);
                
                ctx.save();
                ctx.globalAlpha = progress;
                ctx.strokeStyle = color;
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(segX1, segY1);
                ctx.lineTo(segX2, segY2);
                ctx.stroke();
                ctx.restore();
                
                // Particles
                if (Math.random() < 0.3) {
                    const particleX = segX1 + (Math.random() - 0.5) * 20;
                    const particleY = segY1 + (Math.random() - 0.5) * 20;
                    const particleSize = Math.random() * 3 + 2;
                    
                    ctx.save();
                    ctx.globalAlpha = 0.6;
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }
        } else {
            this.draw3DLine(x1, y1, x2, y2, color, 3);
        }
        
        // Arrowhead
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const arrowSize = 20;
        
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.moveTo(x2 + 5, y2 + 5);
        ctx.lineTo(x2 + 5 - arrowSize * Math.cos(angle - Math.PI/6), y2 + 5 - arrowSize * Math.sin(angle - Math.PI/6));
        ctx.lineTo(x2 + 5 - arrowSize * Math.cos(angle + Math.PI/6), y2 + 5 - arrowSize * Math.sin(angle + Math.PI/6));
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - arrowSize * Math.cos(angle - Math.PI/6), y2 - arrowSize * Math.sin(angle - Math.PI/6));
        ctx.lineTo(x2 - arrowSize * Math.cos(angle + Math.PI/6), y2 - arrowSize * Math.sin(angle + Math.PI/6));
        ctx.closePath();
        ctx.fill();
        
        // Text
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2 - 20;
        
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 24px Arial';
        const textWidth = ctx.measureText(text).width;
        ctx.fillRect(midX - textWidth/2 - 10, midY - 20, textWidth + 20, 40);
        ctx.restore();
        
        ctx.fillStyle = color;
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, midX, midY);
    }
    
    drawInputs() {
        const ctx = this.ctx;
        
        for (let i = 0; i < this.numInputs; i++) {
            const x = this.canvas.width / 5;
            const y = this.canvas.height / 4 + i * (this.canvas.height / 4);
            
            this.draw3DNeuron(x, y, 40, this.colors.red, false, 10);
            
            // Label
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 3;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.fillStyle = this.colors.black;
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`Input ${i+1}: ${this.inputs[i].toFixed(2)}`, x + 50, y);
            ctx.restore();
        }
    }
    
    drawWeights() {
        const ctx = this.ctx;
        
        for (let i = 0; i < this.weights.length; i++) {
            const x1 = this.canvas.width / 5;
            const y1 = this.canvas.height / 4 + i * (this.canvas.height / 4);
            const x2 = this.canvas.width / 2;
            const y2 = this.canvas.height / 2;
            
            const weight = this.weights[i];
            let lineColor;
            if (weight > 0) {
                const intensity = Math.min(255, Math.floor(200 * weight));
                lineColor = `rgb(0, ${intensity}, 0)`;
            } else {
                const intensity = Math.min(255, Math.floor(-200 * weight));
                lineColor = `rgb(${intensity}, 0, 0)`;
            }
            
            const thickness = Math.max(1, Math.min(8, Math.abs(weight) * 5));
            const isUpdating = this.updatingWeights.has(i);
            this.draw3DLine(x1, y1, x2, y2, lineColor, thickness, isUpdating);
            
            // Weight label
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            
            ctx.save();
            ctx.globalAlpha = 0.9;
            ctx.fillStyle = isUpdating ? 'rgba(255, 215, 0, 0.95)' : 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(midX - 5, midY - 3, 100, 30);
            ctx.restore();
            
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
            ctx.shadowBlur = 2;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.fillStyle = isUpdating ? '#ff6600' : this.colors.black;
            ctx.font = isUpdating ? 'bold 18px Arial' : 'bold 16px Arial';
            ctx.fillText(`W${i+1}: ${weight.toFixed(2)}`, midX, midY);
            ctx.restore();
        }
        
        // Draw connection from central to output neuron
        const x1 = this.canvas.width / 2;
        const y1 = this.canvas.height / 2;
        const x2 = this.canvas.width * 4 / 5;
        const y2 = this.canvas.height / 2;
        
        // Output weight (for visualization, using a dummy weight)
        const outputWeight = 1.0; // Could make this a real weight
        const lineColor = this.colors.blue;
        const thickness = 5;
        
        this.draw3DLine(x1, y1, x2, y2, lineColor, thickness, false);
    }
    
    drawCentralNeuron() {
        const x = this.canvas.width / 2;
        const y = this.canvas.height / 2;
        
        this.draw3DNeuron(x, y, 50, this.colors.blue, true);
        
        // Bias connection
        const biasX = x - 80;
        const biasY = y - 80;
        this.draw3DLine(biasX, biasY, x, y, this.colors.purple, 3, this.updatingBias);
        
        // Bias neuron with highlight if updating
        const biasGlow = this.updatingBias;
        this.draw3DNeuron(biasX, biasY, 25, this.updatingBias ? '#ffd700' : this.colors.purple, biasGlow);
        
        // Bias label
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = this.updatingBias ? 'rgba(255, 215, 0, 0.95)' : 'rgba(255, 255, 255, 0.9)';
        const biasText = `Bias: ${this.bias.toFixed(4)}`;
        const textWidth = ctx.measureText(biasText).width;
        ctx.fillRect(biasX - textWidth/2 - 5, biasY - 45, textWidth + 10, 25);
        ctx.restore();
        
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 2;
        ctx.fillStyle = this.updatingBias ? '#ff6600' : this.colors.black;
        ctx.font = this.updatingBias ? 'bold 18px Arial' : 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(biasText, biasX, biasY - 35);
        ctx.restore();
    }
    
    drawOutput() {
        const x = this.canvas.width * 4 / 5;
        const y = this.canvas.height / 2;
        
        this.draw3DNeuron(x, y, 40, this.colors.green, true);
        
        // Label
        const ctx = this.ctx;
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = this.colors.black;
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Output: ${this.output.toFixed(4)}`, x + 50, y);
        ctx.restore();
    }
    
    drawParticles() {
        const ctx = this.ctx;
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            
            ctx.save();
            ctx.globalAlpha = Math.min(1, p.life / 10);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
    
    drawSignalParticles() {
        const ctx = this.ctx;
        
        for (let i = this.signalParticles.length - 1; i >= 0; i--) {
            const p = this.signalParticles[i];
            
            // Update position along path
            p.progress += this.animationSpeed;
            
            if (p.progress >= 1) {
                this.signalParticles.splice(i, 1);
                continue;
            }
            
            // Calculate current position
            const x = p.startX + (p.endX - p.startX) * p.progress;
            const y = p.startY + (p.endY - p.startY) * p.progress;
            
            // Draw glow
            ctx.save();
            ctx.shadowBlur = 15;
            ctx.shadowColor = p.color;
            ctx.fillStyle = p.color;
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(x, y, p.size + 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            
            // Draw particle
            ctx.save();
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(x, y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            
            // Draw trail
            if (p.progress > 0.1) {
                const trailX = p.startX + (p.endX - p.startX) * (p.progress - 0.1);
                const trailY = p.startY + (p.endY - p.startY) * (p.progress - 0.1);
                
                ctx.save();
                ctx.globalAlpha = 0.3;
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(trailX, trailY);
                ctx.lineTo(x, y);
                ctx.stroke();
                ctx.restore();
            }
        }
    }
    
    createSignalParticle(startX, startY, endX, endY, color, size = 8) {
        this.signalParticles.push({
            startX, startY, endX, endY,
            progress: 0,
            color: color,
            size: size
        });
    }
    
    update() {
        // Update flash timer for weight updates
        if (this.updateFlashTimer > 0) {
            this.updateFlashTimer--;
            if (this.updateFlashTimer === 0) {
                this.updatingWeights.clear();
                this.updatingBias = false;
            }
        }
        
        // Auto mode logic
        if (this.autoMode) {
            const now = Date.now();
            if (!this.forwardProp && !this.backwardProp && now - this.lastAutoTime >= 1500) {
                if (!this.forwardCompleted) {
                    this.forwardProp = true;
                    this.flashTimer = 0;
                    this.animationProgress = 0;
                    this.startForwardAnimation();
                } else {
                    this.backwardProp = true;
                    this.flashTimer = 0;
                    this.animationProgress = 0;
                    this.startBackwardAnimation();
                }
                this.lastAutoTime = now;
            }
        }
        
        // Forward propagation
        if (this.forwardProp) {
            this.animationProgress += this.animationSpeed;
            
            if (this.animationProgress >= 1.0) {
                this.output = this.neuronOutput(this.inputs);
                this.error = this.target - this.output;
                this.forwardProp = false;
                this.flashTimer = 0;
                this.forwardCompleted = true;
                this.animationProgress = 0;
                this.signalParticles = [];
                this.updateUI();
            }
        }
        
        // Backward propagation
        if (this.backwardProp) {
            this.animationProgress += this.animationSpeed;
            
            if (this.animationProgress >= 1.0) {
                const outputDelta = this.error * this.sigmoidDerivative(this.output);
                
                // Highlight updating weights
                this.updatingWeights.clear();
                for (let i = 0; i < this.numInputs; i++) {
                    const weightDelta = outputDelta * this.inputs[i];
                    this.weights[i] += this.learningRate * weightDelta;
                    this.updatingWeights.add(i);
                }
                this.bias += this.learningRate * outputDelta;
                this.updatingBias = true;
                this.updateFlashTimer = 60; // Flash for 1 second
                
                this.backwardProp = false;
                this.flashTimer = 0;
                this.animationProgress = 0;
                this.signalParticles = [];
                
                if (this.forwardCompleted) {
                    this.epoch++;
                    this.forwardCompleted = false;
                    this.updateUI();
                }
            }
        }
    }
    
    startForwardAnimation() {
        // Create signal particles from inputs to central neuron
        for (let i = 0; i < this.numInputs; i++) {
            const startX = this.canvas.width / 5;
            const startY = this.canvas.height / 4 + i * (this.canvas.height / 4);
            const endX = this.canvas.width / 2;
            const endY = this.canvas.height / 2;
            
            // Create multiple particles with slight delay
            setTimeout(() => {
                this.createSignalParticle(startX, startY, endX, endY, '#00ffff', 10);
            }, i * 100);
        }
        
        // Create signal from central to output (delayed)
        setTimeout(() => {
            const startX = this.canvas.width / 2;
            const startY = this.canvas.height / 2;
            const endX = this.canvas.width * 4 / 5;
            const endY = this.canvas.height / 2;
            this.createSignalParticle(startX, startY, endX, endY, '#00ff00', 12);
        }, 300);
    }
    
    startBackwardAnimation() {
        // Create signal particles from output backward
        const startX = this.canvas.width * 4 / 5;
        const startY = this.canvas.height / 2;
        const endX = this.canvas.width / 2;
        const endY = this.canvas.height / 2;
        
        this.createSignalParticle(startX, startY, endX, endY, '#ff0000', 12);
        
        // Create signals from central to inputs (delayed)
        setTimeout(() => {
            for (let i = 0; i < this.numInputs; i++) {
                const startX = this.canvas.width / 2;
                const startY = this.canvas.height / 2;
                const endX = this.canvas.width / 5;
                const endY = this.canvas.height / 4 + i * (this.canvas.height / 4);
                
                setTimeout(() => {
                    this.createSignalParticle(startX, startY, endX, endY, '#ff6600', 10);
                }, i * 100);
            }
        }, 300);
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.draw3DGrid();
        
        // Draw network components
        this.drawCentralNeuron();
        this.drawInputs();
        this.drawWeights();
        this.drawOutput();
        
        // Draw signal particles (animated flow)
        this.drawSignalParticles();
        
        // Draw propagation arrows (less prominent now)
        if (this.forwardProp) {
            const ctx = this.ctx;
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.font = 'bold 32px Arial';
            ctx.fillStyle = this.colors.blue;
            ctx.textAlign = 'center';
            ctx.fillText('→ FORWARD PROPAGATION', this.canvas.width / 2, 120);
            ctx.restore();
        }
        
        if (this.backwardProp) {
            const ctx = this.ctx;
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.font = 'bold 32px Arial';
            ctx.fillStyle = this.colors.red;
            ctx.textAlign = 'center';
            ctx.fillText('← BACKWARD PROPAGATION', this.canvas.width / 2, 120);
            ctx.restore();
        }
        
        // Draw particles
        this.drawParticles();
    }
    
    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when page loads
window.addEventListener('load', () => {
    new NeuralNetworkDemo();
});
