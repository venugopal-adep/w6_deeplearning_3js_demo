// Gradient Descent Variations Interactive Demo
// Developed by: Venugopal Adep

class GradientDescentDemo {
    constructor() {
        // Canvas setup
        this.batchCanvas = document.getElementById('batch-canvas');
        this.stochasticCanvas = document.getElementById('stochastic-canvas');
        this.minibatchCanvas = document.getElementById('minibatch-canvas');
        
        this.batchCtx = this.batchCanvas.getContext('2d');
        this.stochasticCtx = this.stochasticCanvas.getContext('2d');
        this.minibatchCtx = this.minibatchCanvas.getContext('2d');
        
        // Dataset configuration
        this.numDataPoints = 20;
        this.dataPoints = this.generateData();
        
        // Model parameters (y = mx + b)
        this.batchParams = { m: 0, b: 0 };
        this.stochasticParams = { m: 0, b: 0 };
        this.minibatchParams = { m: 0, b: 0 };
        
        // True line parameters (target)
        this.trueM = 2;
        this.trueB = 10;
        
        // Training state
        this.batchIterations = 0;
        this.stochasticIterations = 0;
        this.minibatchIterations = 0;
        
        this.currentDataIndex = 0;
        this.learningRate = 0.01;
        this.miniBatchSize = 8;
        
        // Animation state
        this.isPlaying = false;
        this.speed = 5;
        this.frameCounter = 0;
        
        // History for visualization
        this.batchHistory = [];
        this.stochasticHistory = [];
        this.minibatchHistory = [];
        
        this.maxHistoryLength = 50;
        
        // Active data points visualization
        this.activeDataPoints = {
            batch: [],
            stochastic: [],
            minibatch: []
        };
        
        this.setupEventListeners();
        this.initializeDataPointVisuals();
        this.reset();
        this.animate();
    }
    
    // Generate synthetic dataset
    generateData() {
        const points = [];
        for (let i = 0; i < this.numDataPoints; i++) {
            const x = Math.random() * 10;
            const y = this.trueM * x + this.trueB + (Math.random() - 0.5) * 5;
            points.push({ x, y });
        }
        return points;
    }
    
    // Initialize visual data point indicators
    initializeDataPointVisuals() {
        const containers = {
            'batch-points': this.numDataPoints,
            'stochastic-points': this.numDataPoints,
            'minibatch-points': this.numDataPoints
        };
        
        for (const [id, count] of Object.entries(containers)) {
            const container = document.getElementById(id);
            container.innerHTML = '';
            for (let i = 0; i < count; i++) {
                const point = document.createElement('div');
                point.className = 'data-point';
                point.id = `${id}-${i}`;
                container.appendChild(point);
            }
        }
    }
    
    // Highlight active data points
    highlightDataPoints(type, indices) {
        // Clear previous highlights
        const container = document.getElementById(`${type}-points`);
        const points = container.querySelectorAll('.data-point');
        points.forEach(p => p.classList.remove('active'));
        
        // Add new highlights
        indices.forEach(i => {
            const point = document.getElementById(`${type}-points-${i}`);
            if (point) point.classList.add('active');
        });
        
        this.activeDataPoints[type] = indices;
    }
    
    // Calculate loss (MSE)
    calculateLoss(params) {
        let sum = 0;
        for (const point of this.dataPoints) {
            const pred = params.m * point.x + params.b;
            sum += Math.pow(point.y - pred, 2);
        }
        return sum / this.dataPoints.length;
    }
    
    // Batch Gradient Descent step
    batchGradientStep() {
        let gradM = 0;
        let gradB = 0;
        
        // Use ALL data points
        const indices = [];
        for (let i = 0; i < this.dataPoints.length; i++) {
            indices.push(i);
            const point = this.dataPoints[i];
            const pred = this.batchParams.m * point.x + this.batchParams.b;
            const error = pred - point.y;
            
            gradM += error * point.x;
            gradB += error;
        }
        
        gradM /= this.dataPoints.length;
        gradB /= this.dataPoints.length;
        
        this.batchParams.m -= this.learningRate * gradM;
        this.batchParams.b -= this.learningRate * gradB;
        
        this.batchIterations++;
        this.batchHistory.push({ ...this.batchParams });
        if (this.batchHistory.length > this.maxHistoryLength) {
            this.batchHistory.shift();
        }
        
        this.highlightDataPoints('batch', indices);
    }
    
    // Stochastic Gradient Descent step
    stochasticGradientStep() {
        // Use only ONE random data point
        const index = Math.floor(Math.random() * this.dataPoints.length);
        const point = this.dataPoints[index];
        
        const pred = this.stochasticParams.m * point.x + this.stochasticParams.b;
        const error = pred - point.y;
        
        const gradM = error * point.x;
        const gradB = error;
        
        this.stochasticParams.m -= this.learningRate * gradM;
        this.stochasticParams.b -= this.learningRate * gradB;
        
        this.stochasticIterations++;
        this.stochasticHistory.push({ ...this.stochasticParams });
        if (this.stochasticHistory.length > this.maxHistoryLength) {
            this.stochasticHistory.shift();
        }
        
        this.highlightDataPoints('stochastic', [index]);
    }
    
    // Mini-Batch Gradient Descent step
    minibatchGradientStep() {
        let gradM = 0;
        let gradB = 0;
        
        // Use a random mini-batch
        const indices = [];
        for (let i = 0; i < this.miniBatchSize; i++) {
            const index = Math.floor(Math.random() * this.dataPoints.length);
            indices.push(index);
            const point = this.dataPoints[index];
            
            const pred = this.minibatchParams.m * point.x + this.minibatchParams.b;
            const error = pred - point.y;
            
            gradM += error * point.x;
            gradB += error;
        }
        
        gradM /= this.miniBatchSize;
        gradB /= this.miniBatchSize;
        
        this.minibatchParams.m -= this.learningRate * gradM;
        this.minibatchParams.b -= this.learningRate * gradB;
        
        this.minibatchIterations++;
        this.minibatchHistory.push({ ...this.minibatchParams });
        if (this.minibatchHistory.length > this.maxHistoryLength) {
            this.minibatchHistory.shift();
        }
        
        this.highlightDataPoints('minibatch', indices);
    }
    
    // Draw scatter plot and regression line
    drawCanvas(ctx, params, history, color, type) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const padding = 40;
        
        // Clear canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        
        // Find data range
        const xMin = 0;
        const xMax = 10;
        const yMin = Math.min(...this.dataPoints.map(p => p.y)) - 5;
        const yMax = Math.max(...this.dataPoints.map(p => p.y)) + 5;
        
        // Scale functions
        const scaleX = (x) => padding + (x - xMin) / (xMax - xMin) * (width - 2 * padding);
        const scaleY = (y) => height - padding - (y - yMin) / (yMax - yMin) * (height - 2 * padding);
        
        // Draw grid
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const x = padding + i * (width - 2 * padding) / 5;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding);
            ctx.stroke();
            
            const y = padding + i * (height - 2 * padding) / 5;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
        
        // Draw true line (target)
        ctx.strokeStyle = '#bdc3c7';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(scaleX(xMin), scaleY(this.trueM * xMin + this.trueB));
        ctx.lineTo(scaleX(xMax), scaleY(this.trueM * xMax + this.trueB));
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw previous lines (history) with fading effect
        if (history.length > 1) {
            for (let i = 0; i < history.length - 1; i++) {
                const alpha = (i + 1) / history.length * 0.3;
                ctx.strokeStyle = this.hexToRgba(color, alpha);
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(scaleX(xMin), scaleY(history[i].m * xMin + history[i].b));
                ctx.lineTo(scaleX(xMax), scaleY(history[i].m * xMax + history[i].b));
                ctx.stroke();
            }
        }
        
        // Draw current regression line
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(scaleX(xMin), scaleY(params.m * xMin + params.b));
        ctx.lineTo(scaleX(xMax), scaleY(params.m * xMax + params.b));
        ctx.stroke();
        
        // Draw data points
        this.dataPoints.forEach((point, idx) => {
            const isActive = this.activeDataPoints[type].includes(idx);
            
            // Point shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.beginPath();
            ctx.arc(scaleX(point.x) + 2, scaleY(point.y) + 2, isActive ? 8 : 6, 0, Math.PI * 2);
            ctx.fill();
            
            // Point
            ctx.fillStyle = isActive ? '#ffd700' : color;
            ctx.beginPath();
            ctx.arc(scaleX(point.x), scaleY(point.y), isActive ? 8 : 6, 0, Math.PI * 2);
            ctx.fill();
            
            // Point border
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Glow for active points
            if (isActive) {
                ctx.strokeStyle = '#ffd700';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(scaleX(point.x), scaleY(point.y), 12, 0, Math.PI * 2);
                ctx.stroke();
            }
        });
        
        // Draw axis labels
        ctx.fillStyle = '#333';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('X', width / 2, height - 10);
        ctx.save();
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Y', 0, 0);
        ctx.restore();
    }
    
    // Helper: Convert hex to rgba
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    // Update UI statistics
    updateUI() {
        document.getElementById('batch-iterations').textContent = this.batchIterations;
        document.getElementById('batch-loss').textContent = this.calculateLoss(this.batchParams).toFixed(2);
        
        document.getElementById('stochastic-iterations').textContent = this.stochasticIterations;
        document.getElementById('stochastic-loss').textContent = this.calculateLoss(this.stochasticParams).toFixed(2);
        
        document.getElementById('minibatch-iterations').textContent = this.minibatchIterations;
        document.getElementById('minibatch-loss').textContent = this.calculateLoss(this.minibatchParams).toFixed(2);
    }
    
    // Setup event listeners
    setupEventListeners() {
        document.getElementById('play-btn').addEventListener('click', () => {
            this.isPlaying = true;
        });
        
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.isPlaying = false;
        });
        
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.reset();
        });
        
        document.getElementById('speed-slider').addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
            document.getElementById('speed-value').textContent = `${this.speed}x`;
        });
        
        document.getElementById('batch-slider').addEventListener('input', (e) => {
            this.miniBatchSize = parseInt(e.target.value);
            document.getElementById('batch-display').textContent = this.miniBatchSize;
            document.getElementById('batch-size-value').textContent = this.miniBatchSize;
        });
    }
    
    // Reset simulation
    reset() {
        this.batchParams = { m: 0, b: 0 };
        this.stochasticParams = { m: 0, b: 0 };
        this.minibatchParams = { m: 0, b: 0 };
        
        this.batchIterations = 0;
        this.stochasticIterations = 0;
        this.minibatchIterations = 0;
        
        this.batchHistory = [];
        this.stochasticHistory = [];
        this.minibatchHistory = [];
        
        this.activeDataPoints = {
            batch: [],
            stochastic: [],
            minibatch: []
        };
        
        this.dataPoints = this.generateData();
        this.initializeDataPointVisuals();
        
        this.updateUI();
        this.draw();
    }
    
    // Main update loop
    update() {
        if (!this.isPlaying) return;
        
        this.frameCounter++;
        
        // Update based on speed
        if (this.frameCounter % Math.max(1, 11 - this.speed) === 0) {
            // Batch updates every iteration
            this.batchGradientStep();
            
            // Stochastic updates more frequently
            for (let i = 0; i < 3; i++) {
                this.stochasticGradientStep();
            }
            
            // Mini-batch updates moderately
            this.minibatchGradientStep();
            
            this.updateUI();
        }
    }
    
    // Draw all canvases
    draw() {
        this.drawCanvas(this.batchCtx, this.batchParams, this.batchHistory, '#3498db', 'batch');
        this.drawCanvas(this.stochasticCtx, this.stochasticParams, this.stochasticHistory, '#e74c3c', 'stochastic');
        this.drawCanvas(this.minibatchCtx, this.minibatchParams, this.minibatchHistory, '#2ecc71', 'minibatch');
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
    new GradientDescentDemo();
});
