// Dropout Regularization Demo
// Developed by: Venugopal Adep

class DropoutDemo {
    constructor() {
        // Canvas setup
        this.standardCanvas = document.getElementById('standard-canvas');
        this.dropoutCanvas = document.getElementById('dropout-canvas');
        this.standardLossCanvas = document.getElementById('standard-loss-canvas');
        this.dropoutLossCanvas = document.getElementById('dropout-loss-canvas');
        
        this.standardCtx = this.standardCanvas.getContext('2d');
        this.dropoutCtx = this.dropoutCanvas.getContext('2d');
        this.standardLossCtx = this.standardLossCanvas.getContext('2d');
        this.dropoutLossCtx = this.dropoutLossCanvas.getContext('2d');
        
        // Network architecture
        this.layers = [
            { neurons: 4, label: 'Input', x: 100 },
            { neurons: 8, label: 'Hidden 1', x: 250 },
            { neurons: 8, label: 'Hidden 2', x: 400 },
            { neurons: 3, label: 'Output', x: 550 }
        ];
        
        // Neuron states
        this.standardNeurons = this.initializeNeurons();
        this.dropoutNeurons = this.initializeNeurons();
        
        // Animation parameters
        this.isPlaying = false;
        this.speed = 3;
        this.dropoutRate = 0.5;
        this.trainingStep = 0;
        this.neuronsProcessed = 0;
        this.totalDropped = 0;
        
        // Visual parameters
        this.neuronRadius = 18;
        this.layerHeight = 300;
        this.startY = 50;
        
        // Animation timing
        this.frameCounter = 0;
        this.dropoutAnimation = {
            phase: 'forward', // 'forward', 'dropout', 'scale'
            progress: 0,
            duration: 60 // frames
        };

        // Loss tracking
        this.epoch = 0;
        this.maxEpochs = 100;
        this.standardTrainLoss = [];
        this.standardTestLoss = [];
        this.dropoutTrainLoss = [];
        this.dropoutTestLoss = [];
        
        // Initial loss values
        this.standardTrainStart = 2.5;
        this.standardTestStart = 2.5;
        this.dropoutTrainStart = 2.5;
        this.dropoutTestStart = 2.5;
        
        // Target loss (ideal)
        this.targetLoss = 0.3;
        
        this.setupEventListeners();
        this.reset();
        this.animate();
    }
    
    // Initialize neuron states
    initializeNeurons() {
        const neurons = {};
        this.layers.forEach((layer, layerIdx) => {
            neurons[layerIdx] = [];
            for (let i = 0; i < layer.neurons; i++) {
                neurons[layerIdx].push({
                    active: true,
                    activation: Math.random() * 2 - 1, // Random activation
                    originalActivation: 0,
                    scaled: false,
                    dropoutMask: 1,
                    glowIntensity: 0,
                    pulsePhase: Math.random() * Math.PI * 2
                });
            }
        });
        return neurons;
    }
    
    // Apply dropout to neurons
    applyDropout(neurons, rate, layerIdx) {
        // Skip input and output layers
        if (layerIdx === 0 || layerIdx === this.layers.length - 1) {
            neurons[layerIdx].forEach(neuron => {
                neuron.dropoutMask = 1;
                neuron.active = true;
            });
            return;
        }
        
        const keepProbability = 1 - rate;
        const scale = 1 / keepProbability;
        
        neurons[layerIdx].forEach(neuron => {
            if (Math.random() < keepProbability) {
                neuron.active = true;
                neuron.dropoutMask = scale; // Scale up remaining neurons
                neuron.activation = neuron.originalActivation * scale;
            } else {
                neuron.active = false;
                neuron.dropoutMask = 0;
                neuron.activation = 0;
                this.totalDropped++;
            }
        });
    }
    
    // Generate new activations
    generateActivations(neurons) {
        this.layers.forEach((layer, layerIdx) => {
            neurons[layerIdx].forEach(neuron => {
                neuron.originalActivation = Math.random() * 2 - 1;
                neuron.activation = neuron.originalActivation;
                neuron.glowIntensity = Math.abs(neuron.activation);
                neuron.pulsePhase += 0.1;
            });
        });
    }
    
    // Draw neural network
    drawNetwork(ctx, neurons, isDropout, animationPhase = 'static') {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        
        // Clear canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        
        // Draw title
        const title = isDropout ? 'After Applying Dropout' : 'Standard Neural Net';
        ctx.fillStyle = isDropout ? '#2ecc71' : '#e74c3c';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(title, width / 2, 25);
        
        // Draw connections first
        this.drawConnections(ctx, neurons, isDropout);
        
        // Draw neurons
        this.layers.forEach((layer, layerIdx) => {
            this.drawLayer(ctx, neurons, layerIdx, isDropout, animationPhase);
        });
        
        // Draw dropout animation effects
        if (isDropout && animationPhase !== 'static') {
            this.drawDropoutEffects(ctx, animationPhase);
        }
    }
    
    // Draw connections between layers
    drawConnections(ctx, neurons, isDropout) {
        for (let layerIdx = 0; layerIdx < this.layers.length - 1; layerIdx++) {
            const fromLayer = this.layers[layerIdx];
            const toLayer = this.layers[layerIdx + 1];
            
            for (let fromIdx = 0; fromIdx < fromLayer.neurons; fromIdx++) {
                for (let toIdx = 0; toIdx < toLayer.neurons; toIdx++) {
                    const fromNeuron = neurons[layerIdx][fromIdx];
                    const toNeuron = neurons[layerIdx + 1][toIdx];
                    
                    const fromY = this.startY + (this.layerHeight / (fromLayer.neurons + 1)) * (fromIdx + 1);
                    const toY = this.startY + (this.layerHeight / (toLayer.neurons + 1)) * (toIdx + 1);
                    
                    // Connection opacity based on neuron states
                    let alpha = 0.3;
                    if (fromNeuron.active && toNeuron.active) {
                        alpha = 0.6;
                    } else if (!fromNeuron.active || !toNeuron.active) {
                        alpha = 0.1;
                    }
                    
                    const color = isDropout ? `rgba(46, 204, 113, ${alpha})` : `rgba(231, 76, 60, ${alpha})`;
                    
                    ctx.strokeStyle = color;
                    ctx.lineWidth = fromNeuron.active && toNeuron.active ? 2 : 1;
                    ctx.beginPath();
                    ctx.moveTo(fromLayer.x + this.neuronRadius, fromY);
                    ctx.lineTo(toLayer.x - this.neuronRadius, toY);
                    ctx.stroke();
                }
            }
        }
    }
    
    // Draw a single layer
    drawLayer(ctx, neurons, layerIdx, isDropout, animationPhase) {
        const layer = this.layers[layerIdx];
        
        for (let neuronIdx = 0; neuronIdx < layer.neurons; neuronIdx++) {
            const neuron = neurons[layerIdx][neuronIdx];
            const y = this.startY + (this.layerHeight / (layer.neurons + 1)) * (neuronIdx + 1);
            
            this.drawNeuron(ctx, layer.x, y, neuron, isDropout, layerIdx, animationPhase);
        }
        
        // Draw layer label
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(layer.label, layer.x, this.startY - 10);
        
        // Draw dropout indicator for hidden layers
        if (isDropout && layerIdx > 0 && layerIdx < this.layers.length - 1) {
            ctx.fillStyle = '#8e44ad';
            ctx.font = 'bold 12px Arial';
            ctx.fillText('DROPOUT', layer.x, this.startY + this.layerHeight + 25);
            ctx.fillText(`Rate: ${Math.round(this.dropoutRate * 100)}%`, layer.x, this.startY + this.layerHeight + 40);
        }
    }
    
    // Draw individual neuron
    drawNeuron(ctx, x, y, neuron, isDropout, layerIdx, animationPhase) {
        const radius = this.neuronRadius;
        
        // Neuron color and effects
        let fillColor, strokeColor, strokeWidth = 2;
        
        if (!neuron.active) {
            // Dropped neuron - with X mark
            fillColor = '#bdc3c7';
            strokeColor = '#7f8c8d';
            
            // Draw neuron base
            ctx.fillStyle = fillColor;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth;
            ctx.stroke();
            
            // Draw X mark
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 3;
            const crossSize = radius * 0.6;
            ctx.beginPath();
            ctx.moveTo(x - crossSize, y - crossSize);
            ctx.lineTo(x + crossSize, y + crossSize);
            ctx.moveTo(x + crossSize, y - crossSize);
            ctx.lineTo(x - crossSize, y + crossSize);
            ctx.stroke();
            
        } else {
            // Active neuron
            const intensity = Math.abs(neuron.activation);
            const pulse = Math.sin(neuron.pulsePhase) * 0.3 + 0.7;
            
            if (isDropout) {
                fillColor = `rgba(46, 204, 113, ${0.3 + intensity * 0.5 * pulse})`;
                strokeColor = '#27ae60';
            } else {
                fillColor = `rgba(231, 76, 60, ${0.3 + intensity * 0.5 * pulse})`;
                strokeColor = '#c0392b';
            }
            
            // Glow effect for active neurons
            if (neuron.glowIntensity > 0.5) {
                const glowRadius = radius + 5;
                const glowAlpha = (neuron.glowIntensity - 0.5) * 0.4;
                
                ctx.fillStyle = isDropout ? `rgba(46, 204, 113, ${glowAlpha})` : `rgba(231, 76, 60, ${glowAlpha})`;
                ctx.beginPath();
                ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Draw neuron
            ctx.fillStyle = fillColor;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth;
            ctx.stroke();
            
            // Draw activation value
            ctx.fillStyle = '#333';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            const displayValue = neuron.activation.toFixed(1);
            ctx.fillText(displayValue, x, y + 3);
            
            // Draw scaling indicator for dropout
            if (isDropout && neuron.dropoutMask > 1 && layerIdx > 0 && layerIdx < this.layers.length - 1) {
                ctx.fillStyle = '#8e44ad';
                ctx.font = '8px Arial';
                ctx.fillText(`×${neuron.dropoutMask.toFixed(1)}`, x, y + 15);
            }
        }
    }
    
    // Draw dropout animation effects
    drawDropoutEffects(ctx, phase) {
        if (phase === 'dropout') {
            // Show dropout process with particles
            for (let i = 0; i < 20; i++) {
                const x = Math.random() * ctx.canvas.width;
                const y = Math.random() * ctx.canvas.height;
                const alpha = Math.random() * 0.5;
                
                ctx.fillStyle = `rgba(231, 76, 60, ${alpha})`;
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    // Update metrics display
    updateMetrics() {
        // Count active/dropped neurons for each network
        let standardActive = 0, standardDropped = 0;
        let dropoutActive = 0, dropoutDropped = 0;
        
        this.layers.forEach((layer, layerIdx) => {
            // Skip input/output for dropout counting
            const countLayer = layerIdx > 0 && layerIdx < this.layers.length - 1;
            
            this.standardNeurons[layerIdx].forEach(neuron => {
                if (neuron.active) standardActive++;
                else if (countLayer) standardDropped++;
            });
            
            this.dropoutNeurons[layerIdx].forEach(neuron => {
                if (neuron.active) dropoutActive++;
                else if (countLayer) dropoutDropped++;
            });
        });
        
        // Update displays
        document.getElementById('standard-active').textContent = standardActive;
        document.getElementById('standard-dropped').textContent = standardDropped;
        document.getElementById('standard-rate').textContent = '0%';
        
        document.getElementById('dropout-active').textContent = dropoutActive;
        document.getElementById('dropout-dropped').textContent = dropoutDropped;
        document.getElementById('dropout-rate').textContent = `${Math.round(this.dropoutRate * 100)}%`;
        
        // Update training status
        document.getElementById('training-step').textContent = this.trainingStep;
        document.getElementById('neurons-processed').textContent = this.neuronsProcessed;
        document.getElementById('total-dropped').textContent = this.totalDropped;
    }
    
    // Training step
    performTrainingStep() {
        this.trainingStep++;
        
        // Generate new activations
        this.generateActivations(this.standardNeurons);
        this.generateActivations(this.dropoutNeurons);
        
        // Apply dropout to dropout network
        this.layers.forEach((layer, layerIdx) => {
            this.applyDropout(this.dropoutNeurons, this.dropoutRate, layerIdx);
            this.neuronsProcessed += layer.neurons;
        });
        
        // Reset animation
        this.dropoutAnimation.phase = 'forward';
        this.dropoutAnimation.progress = 0;
        
        this.updateMetrics();
    }

    // Generate realistic loss curves with dropout effects
    generateLossCurve(type, epoch, maxEpochs) {
        const progress = epoch / maxEpochs;
        
        if (type === 'standard-train') {
            // Training loss decreases rapidly without dropout
            const base = this.targetLoss + (this.standardTrainStart - this.targetLoss) * Math.exp(-4 * progress);
            return Math.max(0.05, base - 0.15 * progress);
        } else if (type === 'standard-test') {
            // Test loss decreases initially then increases (overfitting)
            const optimal = 0.4;
            if (progress < 0.3) {
                return this.standardTestStart - (this.standardTestStart - optimal) * (progress / 0.3);
            } else {
                const overfit = (progress - 0.3) / 0.7;
                return optimal + overfit * 1.5 + Math.random() * 0.1;
            }
        } else if (type === 'dropout-train') {
            // Training loss decreases more slowly with dropout (regularization effect)
            const base = this.targetLoss + (this.dropoutTrainStart - this.targetLoss) * Math.exp(-2.5 * progress);
            return Math.max(0.2, base + (Math.random() - 0.5) * 0.03);
        } else if (type === 'dropout-test') {
            // Test loss follows training closely (good generalization)
            const base = this.targetLoss + (this.dropoutTestStart - this.targetLoss) * Math.exp(-2.3 * progress);
            return Math.max(0.25, base + (Math.random() - 0.5) * 0.04);
        }
    }

    // Draw loss curve chart
    drawLossChart(ctx, trainLoss, testLoss, isDropout) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const padding = 50;
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
        ctx.fillText('Epochs', width / 2, height - 15);
        
        ctx.save();
        ctx.translate(20, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Loss', 0, 0);
        ctx.restore();
        
        // Draw epoch markers
        ctx.fillStyle = '#666';
        ctx.font = '11px Arial';
        for (let i = 0; i <= 10; i++) {
            const x = padding + (chartWidth * i / 10);
            const epochLabel = Math.floor(this.maxEpochs * i / 10);
            ctx.fillText(epochLabel, x, height - padding + 20);
        }
        
        // Draw loss scale
        const maxLoss = 3.0;
        for (let i = 0; i <= 6; i++) {
            const y = height - padding - (chartHeight * i / 6);
            const lossLabel = (maxLoss * i / 6).toFixed(1);
            ctx.textAlign = 'right';
            ctx.fillText(lossLabel, padding - 10, y + 5);
        }
        
        // Scale functions
        const scaleX = (epoch) => padding + (epoch / this.maxEpochs) * chartWidth;
        const scaleY = (loss) => height - padding - (Math.min(loss, maxLoss) / maxLoss) * chartHeight;
        
        // Draw target line (ideal fit)
        if (trainLoss.length > 0) {
            ctx.strokeStyle = '#95a5a6';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(padding, scaleY(this.targetLoss));
            ctx.lineTo(width - padding, scaleY(this.targetLoss));
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        // Draw test loss curve
        if (testLoss.length > 1) {
            ctx.strokeStyle = '#e67e22';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(scaleX(0), scaleY(testLoss[0]));
            
            for (let i = 1; i < testLoss.length; i++) {
                ctx.lineTo(scaleX(i), scaleY(testLoss[i]));
            }
            ctx.stroke();
            
            // Draw points
            testLoss.forEach((loss, i) => {
                if (i % 3 === 0 || i === testLoss.length - 1) {
                    ctx.fillStyle = '#e67e22';
                    ctx.beginPath();
                    ctx.arc(scaleX(i), scaleY(loss), 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            });
        }
        
        // Draw training loss curve
        if (trainLoss.length > 1) {
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(scaleX(0), scaleY(trainLoss[0]));
            
            for (let i = 1; i < trainLoss.length; i++) {
                ctx.lineTo(scaleX(i), scaleY(trainLoss[i]));
            }
            ctx.stroke();
            
            // Draw points
            trainLoss.forEach((loss, i) => {
                if (i % 3 === 0 || i === trainLoss.length - 1) {
                    ctx.fillStyle = '#3498db';
                    ctx.beginPath();
                    ctx.arc(scaleX(i), scaleY(loss), 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            });
        }
        
        // Highlight overfitting region for standard network
        if (!isDropout && trainLoss.length > 30) {
            const overfitStart = 30;
            ctx.fillStyle = 'rgba(231, 76, 60, 0.1)';
            ctx.fillRect(
                scaleX(overfitStart),
                padding,
                scaleX(trainLoss.length - 1) - scaleX(overfitStart),
                chartHeight
            );
            
            // Label overfitting region
            ctx.fillStyle = '#e74c3c';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('OVERFITTING', scaleX((overfitStart + trainLoss.length) / 2), padding + 20);
        }
        
        // Current epoch indicator
        if (trainLoss.length > 0) {
            const currentEpoch = trainLoss.length - 1;
            const x = scaleX(currentEpoch);
            
            ctx.strokeStyle = '#9b59b6';
            ctx.lineWidth = 2;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    // Update loss metrics display
    updateLossMetrics() {
        // Standard network metrics
        const standardTrain = this.standardTrainLoss[this.standardTrainLoss.length - 1] || 0;
        const standardTest = this.standardTestLoss[this.standardTestLoss.length - 1] || 0;
        const standardGap = Math.abs(standardTest - standardTrain);
        
        document.getElementById('standard-train-loss').textContent = standardTrain.toFixed(2);
        document.getElementById('standard-test-loss').textContent = standardTest.toFixed(2);
        document.getElementById('standard-epoch').textContent = this.epoch;
        document.getElementById('standard-gap').textContent = standardGap.toFixed(2);
        
        // Dropout network metrics
        const dropoutTrain = this.dropoutTrainLoss[this.dropoutTrainLoss.length - 1] || 0;
        const dropoutTest = this.dropoutTestLoss[this.dropoutTestLoss.length - 1] || 0;
        const dropoutGap = Math.abs(dropoutTest - dropoutTrain);
        
        document.getElementById('dropout-train-loss').textContent = dropoutTrain.toFixed(2);
        document.getElementById('dropout-test-loss').textContent = dropoutTest.toFixed(2);
        document.getElementById('dropout-epoch').textContent = this.epoch;
        document.getElementById('dropout-gap').textContent = dropoutGap.toFixed(2);
    }

    // Training epoch step for loss curves
    performEpochStep() {
        if (this.epoch >= this.maxEpochs) {
            this.isPlaying = false;
            return;
        }
        
        this.epoch++;
        
        // Generate new loss values
        this.standardTrainLoss.push(this.generateLossCurve('standard-train', this.epoch, this.maxEpochs));
        this.standardTestLoss.push(this.generateLossCurve('standard-test', this.epoch, this.maxEpochs));
        this.dropoutTrainLoss.push(this.generateLossCurve('dropout-train', this.epoch, this.maxEpochs));
        this.dropoutTestLoss.push(this.generateLossCurve('dropout-test', this.epoch, this.maxEpochs));
        
        this.updateLossMetrics();
    }
    
    // Setup event listeners
    setupEventListeners() {
        document.getElementById('play-btn').addEventListener('click', () => {
            this.isPlaying = true;
        });
        
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.isPlaying = false;
        });
        
        document.getElementById('step-btn').addEventListener('click', () => {
            this.performTrainingStep();
        });
        
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.reset();
        });
        
        document.getElementById('dropout-slider').addEventListener('input', (e) => {
            this.dropoutRate = parseFloat(e.target.value) / 100;
            document.getElementById('dropout-value').textContent = `${e.target.value}%`;
            this.updateMetrics();
        });
        
        document.getElementById('speed-slider').addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
            document.getElementById('speed-value').textContent = `${e.target.value}x`;
        });
    }
    
    // Reset simulation
    reset() {
        this.trainingStep = 0;
        this.neuronsProcessed = 0;
        this.totalDropped = 0;
        this.epoch = 0;
        this.isPlaying = false;
        
        // Reset loss tracking
        this.standardTrainLoss = [this.standardTrainStart];
        this.standardTestLoss = [this.standardTestStart];
        this.dropoutTrainLoss = [this.dropoutTrainStart];
        this.dropoutTestLoss = [this.dropoutTestStart];
        
        this.standardNeurons = this.initializeNeurons();
        this.dropoutNeurons = this.initializeNeurons();
        
        // Initial activations
        this.generateActivations(this.standardNeurons);
        this.generateActivations(this.dropoutNeurons);
        
        this.updateMetrics();
        this.updateLossMetrics();
        this.draw();
    }
    
    // Update loop
    update() {
        if (!this.isPlaying) return;
        
        this.frameCounter++;
        
        // Animate dropout process
        this.dropoutAnimation.progress += 1;
        if (this.dropoutAnimation.progress >= this.dropoutAnimation.duration) {
            this.dropoutAnimation.progress = 0;
            
            switch (this.dropoutAnimation.phase) {
                case 'forward':
                    this.dropoutAnimation.phase = 'dropout';
                    break;
                case 'dropout':
                    this.dropoutAnimation.phase = 'scale';
                    break;
                case 'scale':
                    this.dropoutAnimation.phase = 'forward';
                    break;
            }
        }
        
        // Update pulse phases
        this.layers.forEach((layer, layerIdx) => {
            this.standardNeurons[layerIdx].forEach(neuron => {
                neuron.pulsePhase += 0.05;
            });
            this.dropoutNeurons[layerIdx].forEach(neuron => {
                neuron.pulsePhase += 0.05;
            });
        });
        
        // Perform training step based on speed
        if (this.frameCounter % Math.max(1, 11 - this.speed) === 0) {
            this.performTrainingStep();
        }

        // Perform epoch step for loss curves
        if (this.frameCounter % Math.max(1, 11 - this.speed) === 0) {
            this.performEpochStep();
        }
    }
    
    // Draw both networks
    draw() {
        this.drawNetwork(this.standardCtx, this.standardNeurons, false);
        this.drawNetwork(this.dropoutCtx, this.dropoutNeurons, true, this.dropoutAnimation.phase);
        this.drawLossChart(this.standardLossCtx, this.standardTrainLoss, this.standardTestLoss, false);
        this.drawLossChart(this.dropoutLossCtx, this.dropoutTrainLoss, this.dropoutTestLoss, true);
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
    new DropoutDemo();
});