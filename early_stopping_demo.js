// Early Stopping Demo
// Developed by: Venugopal Adep

class EarlyStoppingDemo {
    constructor() {
        // Canvas setup
        this.noEarlyCanvas = document.getElementById('no-early-canvas');
        this.earlyStopCanvas = document.getElementById('early-stop-canvas');
        
        this.noEarlyCtx = this.noEarlyCanvas.getContext('2d');
        this.earlyStopCtx = this.earlyStopCanvas.getContext('2d');
        
        // Training parameters
        this.maxEpochs = 100;
        this.epoch = 0;
        this.patience = 5;
        this.speed = 5;
        
        // Early stopping state
        this.bestValError = Infinity;
        this.bestEpoch = 0;
        this.patienceCounter = 0;
        this.earlyStopped = false;
        this.stopEpoch = null;
        
        // Error tracking
        this.noEarlyTrainError = [];
        this.noEarlyValError = [];
        this.earlyStopTrainError = [];
        this.earlyStopValError = [];
        
        // Initial error values
        this.trainErrorStart = 2.8;
        this.valErrorStart = 2.8;
        
        // Animation state
        this.isPlaying = false;
        this.frameCounter = 0;
        
        this.setupEventListeners();
        this.reset();
        this.animate();
    }
    
    // Generate realistic error curves
    generateErrorCurve(type, epoch, maxEpochs) {
        const progress = epoch / maxEpochs;
        const noise = () => (Math.random() - 0.5) * 0.08;
        
        if (type === 'train') {
            // Training error: steadily decreases
            const base = 0.15 + (this.trainErrorStart - 0.15) * Math.exp(-3.5 * progress);
            return Math.max(0.1, base + noise());
        } else if (type === 'validation') {
            // Validation error: decreases then increases (U-shape)
            const optimalPoint = 0.25; // Optimal epoch as fraction
            
            if (progress < optimalPoint) {
                // Decreasing phase
                const decreaseRate = progress / optimalPoint;
                const base = this.valErrorStart - (this.valErrorStart - 0.4) * decreaseRate;
                return base + noise();
            } else {
                // Increasing phase (overfitting)
                const overfitProgress = (progress - optimalPoint) / (1 - optimalPoint);
                const base = 0.4 + overfitProgress * 1.2;
                return base + noise() + Math.pow(overfitProgress, 1.5) * 0.3;
            }
        }
    }
    
    // Check early stopping condition
    checkEarlyStopping(currentValError) {
        if (this.earlyStopped) {
            return true;
        }
        
        // Check if current validation error is better than best
        if (currentValError < this.bestValError - 0.001) { // Small threshold for improvement
            this.bestValError = currentValError;
            this.bestEpoch = this.epoch;
            this.patienceCounter = 0;
        } else {
            this.patienceCounter++;
        }
        
        // Stop if patience exceeded
        if (this.patienceCounter >= this.patience) {
            this.earlyStopped = true;
            this.stopEpoch = this.epoch;
            return true;
        }
        
        return false;
    }
    
    // Draw error curve chart
    drawChart(ctx, trainError, valError, hasEarlyStopping) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const padding = 60;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;
        
        // Clear canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        
        // Draw grid
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= 10; i++) {
            // Vertical lines
            const x = padding + (chartWidth * i / 10);
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding);
            ctx.stroke();
            
            // Horizontal lines
            const y = padding + (chartHeight * i / 10);
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
        
        // Draw axes
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();
        
        // Axis labels
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Number of Iterations (Epochs)', width / 2, height - 15);
        
        ctx.save();
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Error', 0, 0);
        ctx.restore();
        
        // Draw epoch markers
        ctx.fillStyle = '#666';
        ctx.font = '11px Arial';
        for (let i = 0; i <= 10; i++) {
            const x = padding + (chartWidth * i / 10);
            const epochLabel = Math.floor(this.maxEpochs * i / 10);
            ctx.fillText(epochLabel, x, height - padding + 20);
        }
        
        // Draw error scale
        const maxError = 3.5;
        for (let i = 0; i <= 7; i++) {
            const y = height - padding - (chartHeight * i / 7);
            const errorLabel = (maxError * i / 7).toFixed(1);
            ctx.textAlign = 'right';
            ctx.fillText(errorLabel, padding - 10, y + 5);
        }
        
        // Scale functions
        const scaleX = (epoch) => padding + (epoch / this.maxEpochs) * chartWidth;
        const scaleY = (error) => height - padding - (Math.min(error, maxError) / maxError) * chartHeight;
        
        // Draw validation error curve
        if (valError.length > 1) {
            ctx.strokeStyle = '#e67e22';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(scaleX(0), scaleY(valError[0]));
            
            const maxIdx = hasEarlyStopping && this.stopEpoch !== null ? 
                Math.min(valError.length, this.stopEpoch + 1) : valError.length;
            
            for (let i = 1; i < maxIdx; i++) {
                ctx.lineTo(scaleX(i), scaleY(valError[i]));
            }
            ctx.stroke();
            
            // Draw points
            for (let i = 0; i < maxIdx; i++) {
                if (i % 5 === 0 || i === maxIdx - 1) {
                    ctx.fillStyle = '#e67e22';
                    ctx.beginPath();
                    ctx.arc(scaleX(i), scaleY(valError[i]), 5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }
            
            // Highlight best validation point for early stopping
            if (hasEarlyStopping && this.bestEpoch > 0) {
                ctx.fillStyle = '#2ecc71';
                ctx.beginPath();
                ctx.arc(scaleX(this.bestEpoch), scaleY(valError[this.bestEpoch]), 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#27ae60';
                ctx.lineWidth = 3;
                ctx.stroke();
                
                // Label
                ctx.fillStyle = '#2ecc71';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Best Model', scaleX(this.bestEpoch), scaleY(valError[this.bestEpoch]) - 15);
            }
        }
        
        // Draw training error curve
        if (trainError.length > 1) {
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(scaleX(0), scaleY(trainError[0]));
            
            const maxIdx = hasEarlyStopping && this.stopEpoch !== null ? 
                Math.min(trainError.length, this.stopEpoch + 1) : trainError.length;
            
            for (let i = 1; i < maxIdx; i++) {
                ctx.lineTo(scaleX(i), scaleY(trainError[i]));
            }
            ctx.stroke();
            
            // Draw points
            for (let i = 0; i < maxIdx; i++) {
                if (i % 5 === 0 || i === maxIdx - 1) {
                    ctx.fillStyle = '#3498db';
                    ctx.beginPath();
                    ctx.arc(scaleX(i), scaleY(trainError[i]), 5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }
        }
        
        // Draw early stopping line
        if (hasEarlyStopping && this.stopEpoch !== null) {
            const x = scaleX(this.stopEpoch);
            
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 3;
            ctx.setLineDash([8, 5]);
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Label
            ctx.fillStyle = '#e74c3c';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Early Stopping', x, padding - 10);
            ctx.font = '12px Arial';
            ctx.fillText(`Epoch ${this.stopEpoch}`, x, padding + 20);
        }
        
        // Highlight overfitting region for no early stopping
        if (!hasEarlyStopping && trainError.length > 25) {
            const overfitStart = 25;
            ctx.fillStyle = 'rgba(231, 76, 60, 0.1)';
            ctx.fillRect(
                scaleX(overfitStart),
                padding,
                scaleX(trainError.length - 1) - scaleX(overfitStart),
                chartHeight
            );
            
            ctx.fillStyle = '#e74c3c';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('OVERFITTING ZONE', scaleX((overfitStart + trainError.length) / 2), padding + 30);
        }
        
        // Current epoch indicator (only if still training)
        if (trainError.length > 0 && (!hasEarlyStopping || !this.earlyStopped)) {
            const currentEpoch = trainError.length - 1;
            const x = scaleX(currentEpoch);
            
            ctx.strokeStyle = '#9b59b6';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
    
    // Update metrics display
    updateMetrics() {
        // No early stopping metrics
        const noEarlyTrain = this.noEarlyTrainError[this.noEarlyTrainError.length - 1] || 0;
        const noEarlyVal = this.noEarlyValError[this.noEarlyValError.length - 1] || 0;
        const noEarlyGap = Math.abs(noEarlyVal - noEarlyTrain);
        
        document.getElementById('no-early-train').textContent = noEarlyTrain.toFixed(3);
        document.getElementById('no-early-val').textContent = noEarlyVal.toFixed(3);
        document.getElementById('no-early-epoch').textContent = this.epoch;
        document.getElementById('no-early-gap').textContent = noEarlyGap.toFixed(3);
        
        // Update status
        const noEarlyStatus = document.getElementById('no-early-status');
        if (this.epoch >= this.maxEpochs) {
            noEarlyStatus.className = 'status-indicator stopped';
            noEarlyStatus.textContent = '🛑 Training completed - Model overfit!';
        } else if (this.isPlaying) {
            noEarlyStatus.className = 'status-indicator training';
            noEarlyStatus.textContent = `🏃 Training in progress... (${this.epoch}/${this.maxEpochs})`;
        }
        
        // Early stopping metrics
        const earlyTrain = this.earlyStopTrainError[this.earlyStopTrainError.length - 1] || 0;
        const earlyVal = this.earlyStopValError[this.earlyStopValError.length - 1] || 0;
        const earlyGap = Math.abs(earlyVal - earlyTrain);
        
        document.getElementById('early-stop-train').textContent = earlyTrain.toFixed(3);
        document.getElementById('early-stop-val').textContent = earlyVal.toFixed(3);
        document.getElementById('early-stop-epoch').textContent = this.earlyStopped ? this.stopEpoch : this.epoch;
        document.getElementById('early-stop-gap').textContent = earlyGap.toFixed(3);
        
        // Update early stopping status
        const earlyStatus = document.getElementById('early-stop-status');
        if (this.earlyStopped) {
            earlyStatus.className = 'status-indicator optimal';
            earlyStatus.textContent = `✅ Stopped at epoch ${this.stopEpoch} - Optimal model saved!`;
        } else if (this.isPlaying) {
            earlyStatus.className = 'status-indicator training';
            earlyStatus.textContent = `🏃 Training... Patience: ${this.patienceCounter}/${this.patience}`;
        }
    }
    
    // Training epoch step
    performEpochStep() {
        if (this.epoch >= this.maxEpochs) {
            this.isPlaying = false;
            return;
        }
        
        this.epoch++;
        
        // Generate new error values
        const trainError = this.generateErrorCurve('train', this.epoch, this.maxEpochs);
        const valError = this.generateErrorCurve('validation', this.epoch, this.maxEpochs);
        
        // No early stopping - always continues
        this.noEarlyTrainError.push(trainError);
        this.noEarlyValError.push(valError);
        
        // With early stopping - check condition
        if (!this.earlyStopped) {
            this.earlyStopTrainError.push(trainError);
            this.earlyStopValError.push(valError);
            
            this.checkEarlyStopping(valError);
        }
        
        this.updateMetrics();
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
        
        document.getElementById('patience-slider').addEventListener('input', (e) => {
            this.patience = parseInt(e.target.value);
            document.getElementById('patience-value').textContent = e.target.value;
            document.getElementById('patience-display').textContent = e.target.value;
        });
        
        document.getElementById('speed-slider').addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
            document.getElementById('speed-value').textContent = `${e.target.value}x`;
        });
    }
    
    // Reset simulation
    reset() {
        this.epoch = 0;
        this.isPlaying = false;
        
        // Reset early stopping state
        this.bestValError = Infinity;
        this.bestEpoch = 0;
        this.patienceCounter = 0;
        this.earlyStopped = false;
        this.stopEpoch = null;
        
        // Reset error arrays
        this.noEarlyTrainError = [this.trainErrorStart];
        this.noEarlyValError = [this.valErrorStart];
        this.earlyStopTrainError = [this.trainErrorStart];
        this.earlyStopValError = [this.valErrorStart];
        
        this.updateMetrics();
        this.draw();
    }
    
    // Update loop
    update() {
        if (!this.isPlaying) return;
        
        this.frameCounter++;
        
        // Perform epoch step based on speed
        if (this.frameCounter % Math.max(1, 11 - this.speed) === 0) {
            this.performEpochStep();
            
            // Stop playing if both reached their end conditions
            if (this.epoch >= this.maxEpochs || (this.earlyStopped && this.epoch >= this.maxEpochs)) {
                this.isPlaying = false;
            }
        }
    }
    
    // Draw both charts
    draw() {
        this.drawChart(this.noEarlyCtx, this.noEarlyTrainError, this.noEarlyValError, false);
        this.drawChart(this.earlyStopCtx, this.earlyStopTrainError, this.earlyStopValError, true);
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
    new EarlyStoppingDemo();
});