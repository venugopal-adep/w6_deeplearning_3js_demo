// Avoid Overfitting : Batch Normalization Demo
// Developed by: Venugopal Adep

class BatchNormalizationDemo {
    constructor() {
        // Canvas setup
        this.overfitCanvas = document.getElementById('overfitting-canvas');
        this.normalizedCanvas = document.getElementById('normalized-canvas');
        
        this.overfitCtx = this.overfitCanvas.getContext('2d');
        this.normalizedCtx = this.normalizedCanvas.getContext('2d');
        
        // Training parameters
        this.maxEpochs = 100;
        this.epoch = 0;
        
        // Loss tracking
        this.overfitTrainLoss = [];
        this.overfitTestLoss = [];
        this.normalizedTrainLoss = [];
        this.normalizedTestLoss = [];
        
        // Neural network visualization
        this.layerWeights = {
            overfit: { layer1: [], layer2: [], layer3: [] },
            normalized: { layer1: [], layer2: [], layer3: [] }
        };
        
        this.layerActivations = {
            overfit: { layer1: [], layer2: [], layer3: [] },
            normalized: { layer1: [], layer2: [], layer3: [] }
        };
        
        // Batch norm parameters
        this.batchNormStats = {
            mean: [],
            variance: [],
            normalized: []
        };
        
        // Animation state
        this.isPlaying = false;
        this.speed = 5;
        this.frameCounter = 0;
        
        // Initial loss values
        this.overfitTrainStart = 2.5;
        this.overfitTestStart = 2.5;
        this.normalizedTrainStart = 2.5;
        this.normalizedTestStart = 2.5;
        
        // Target loss (ideal)
        this.targetLoss = 0.3;
        
        this.setupEventListeners();
        this.reset();
        this.animate();
    }
    
    // Generate realistic loss curves with batch norm effects
    generateLossCurve(type, epoch, maxEpochs) {
        const progress = epoch / maxEpochs;
        
        if (type === 'overfit-train') {
            // Training loss decreases rapidly but becomes unstable
            const base = this.targetLoss + (this.overfitTrainStart - this.targetLoss) * Math.exp(-5 * progress);
            const instability = epoch > 20 ? Math.sin(epoch * 0.5) * 0.1 : 0;
            return Math.max(0.05, base - 0.2 * progress + instability);
        } else if (type === 'overfit-test') {
            // Test loss decreases initially then increases (classic overfitting)
            const optimal = 0.4;
            if (progress < 0.3) {
                return this.overfitTestStart - (this.overfitTestStart - optimal) * (progress / 0.3);
            } else {
                const overfit = (progress - 0.3) / 0.7;
                return optimal + overfit * 1.2 + Math.random() * 0.15;
            }
        } else if (type === 'normalized-train') {
            // Training loss decreases smoothly with batch norm
            const base = this.targetLoss + (this.normalizedTrainStart - this.targetLoss) * Math.exp(-3 * progress);
            const stability = 0.02; // Much more stable
            return Math.max(0.2, base + (Math.random() - 0.5) * stability);
        } else if (type === 'normalized-test') {
            // Test loss follows training closely (good generalization)
            const base = this.targetLoss + (this.normalizedTestStart - this.targetLoss) * Math.exp(-2.8 * progress);
            const stability = 0.03; // Follows training loss closely
            return Math.max(0.25, base + (Math.random() - 0.5) * stability);
        }
    }
    
    // Simulate neural network layers with/without batch norm
    simulateLayerActivations(epoch, hasBatchNorm) {
        const numNeurons = 8;
        const layers = ['layer1', 'layer2', 'layer3'];
        
        layers.forEach((layer, layerIdx) => {
            const activations = [];
            const weights = [];
            
            for (let i = 0; i < numNeurons; i++) {
                if (hasBatchNorm) {
                    // With batch norm: stable, normalized activations
                    const normalized = (Math.random() - 0.5) * 2; // Standard normal
                    activations.push(normalized);
                    weights.push(Math.random() * 0.5 - 0.25); // Smaller weights
                } else {
                    // Without batch norm: unstable, varying activations
                    const scale = Math.pow(2, epoch / 20); // Exponential growth
                    const activation = (Math.random() - 0.5) * scale;
                    activations.push(Math.max(-5, Math.min(5, activation))); // Clamp
                    weights.push((Math.random() - 0.5) * Math.min(2, scale * 0.1));
                }
            }
            
            if (hasBatchNorm) {
                this.layerActivations.normalized[layer] = activations;
                this.layerWeights.normalized[layer] = weights;
            } else {
                this.layerActivations.overfit[layer] = activations;
                this.layerWeights.overfit[layer] = weights;
            }
        });
        
        // Simulate batch normalization statistics
        if (hasBatchNorm) {
            const sampleData = Array.from({length: 32}, () => Math.random() * 4 - 2);
            const mean = sampleData.reduce((a, b) => a + b) / sampleData.length;
            const variance = sampleData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / sampleData.length;
            const normalized = sampleData.map(x => (x - mean) / Math.sqrt(variance + 1e-8));
            
            this.batchNormStats.mean.push(mean);
            this.batchNormStats.variance.push(variance);
            this.batchNormStats.normalized.push(normalized);
        }
    }
    
    // Draw neural network visualization with batch norm
    drawNetworkVisualization(ctx, isNormalized) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        
        // Network layout
        const layers = [
            { x: 100, neurons: 4, label: 'Input' },
            { x: 250, neurons: 6, label: 'Hidden 1' },
            { x: 400, neurons: 6, label: 'Hidden 2' },
            { x: 550, neurons: 1, label: 'Output' }
        ];
        
        const neuronRadius = 15;
        const layerHeight = 250;
        const startY = (height - layerHeight) / 2;
        
        // Draw connections
        for (let i = 0; i < layers.length - 1; i++) {
            const fromLayer = layers[i];
            const toLayer = layers[i + 1];
            
            for (let from = 0; from < fromLayer.neurons; from++) {
                for (let to = 0; to < toLayer.neurons; to++) {
                    const fromY = startY + (layerHeight / (fromLayer.neurons + 1)) * (from + 1);
                    const toY = startY + (layerHeight / (toLayer.neurons + 1)) * (to + 1);
                    
                    // Connection strength based on weights
                    const weightKey = `layer${i + 1}`;
                    const weights = isNormalized ? 
                        this.layerWeights.normalized[weightKey] : 
                        this.layerWeights.overfit[weightKey];
                    
                    const weight = weights && weights[to] ? Math.abs(weights[to]) : 0.5;
                    const alpha = Math.min(1, weight);
                    const color = isNormalized ? `rgba(46, 204, 113, ${alpha})` : `rgba(231, 76, 60, ${alpha})`;
                    
                    ctx.strokeStyle = color;
                    ctx.lineWidth = Math.max(0.5, weight * 3);
                    ctx.beginPath();
                    ctx.moveTo(fromLayer.x + neuronRadius, fromY);
                    ctx.lineTo(toLayer.x - neuronRadius, toY);
                    ctx.stroke();
                }
            }
        }
        
        // Draw neurons
        layers.forEach((layer, layerIdx) => {
            for (let i = 0; i < layer.neurons; i++) {
                const y = startY + (layerHeight / (layer.neurons + 1)) * (i + 1);
                
                // Neuron activation based on simulation
                const activationKey = `layer${layerIdx + 1}`;
                const activations = isNormalized ? 
                    this.layerActivations.normalized[activationKey] : 
                    this.layerActivations.overfit[activationKey];
                
                const activation = activations && activations[i] ? activations[i] : 0;
                const intensity = Math.abs(activation);
                
                // Neuron color based on activation
                let neuronColor;
                if (isNormalized) {
                    neuronColor = `rgba(46, 204, 113, ${0.3 + intensity * 0.7})`;
                } else {
                    const unstable = intensity > 2 ? 1 : intensity / 2;
                    neuronColor = `rgba(231, 76, 60, ${0.3 + unstable * 0.7})`;
                }
                
                // Draw neuron
                ctx.fillStyle = neuronColor;
                ctx.beginPath();
                ctx.arc(layer.x, y, neuronRadius, 0, Math.PI * 2);
                ctx.fill();
                
                // Neuron border
                ctx.strokeStyle = isNormalized ? '#27ae60' : '#c0392b';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Activation value text
                ctx.fillStyle = '#333';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(activation.toFixed(1), layer.x, y + 3);
            }
            
            // Layer label
            ctx.fillStyle = '#333';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(layer.label, layer.x, startY - 20);
            
            // Batch normalization indicator
            if (isNormalized && layerIdx > 0 && layerIdx < layers.length - 1) {
                ctx.fillStyle = '#2ecc71';
                ctx.font = 'bold 10px Arial';
                ctx.fillText('BatchNorm', layer.x, startY + layerHeight + 20);
                
                // BN stats
                if (this.batchNormStats.mean.length > 0) {
                    const mean = this.batchNormStats.mean[this.batchNormStats.mean.length - 1];
                    const variance = this.batchNormStats.variance[this.batchNormStats.variance.length - 1];
                    ctx.font = '8px Arial';
                    ctx.fillText(`μ=${mean.toFixed(2)}`, layer.x, startY + layerHeight + 35);
                    ctx.fillText(`σ²=${variance.toFixed(2)}`, layer.x, startY + layerHeight + 45);
                }
            }
        });
        
        // Title
        const title = isNormalized ? 'With Batch Normalization' : 'Without Batch Normalization';
        ctx.fillStyle = isNormalized ? '#2ecc71' : '#e74c3c';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(title, width / 2, 30);
        
        // Status indicator
        const status = isNormalized ? 'Stable Gradients ✓' : 'Unstable Gradients ✗';
        ctx.font = '14px Arial';
        ctx.fillText(status, width / 2, 50);
    }
    
    // Draw loss curve chart (enhanced)
    drawChart(ctx, trainLoss, testLoss, isOverfitting) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const padding = 50;
        const chartWidth = width - 2 * padding;
        const chartHeight = 300; // Reduced height to make room for network
        const chartStartY = height - chartHeight - 20;
        
        // Clear chart area only
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, chartStartY - 10, width, chartHeight + 30);
        
        // ...existing chart code but with adjusted positions...
        // Draw grid
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= 10; i++) {
            const x = padding + (chartWidth * i / 10);
            ctx.beginPath();
            ctx.moveTo(x, chartStartY);
            ctx.lineTo(x, chartStartY + chartHeight);
            ctx.stroke();
            
            const y = chartStartY + (chartHeight * i / 10);
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
        
        // Scale functions
        const scaleX = (epoch) => padding + (epoch / this.maxEpochs) * chartWidth;
        const scaleY = (loss) => chartStartY + chartHeight - (Math.min(loss, 3.0) / 3.0) * chartHeight;
        
        // Draw training and test loss curves
        if (trainLoss.length > 1) {
            // Training loss
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(scaleX(0), scaleY(trainLoss[0]));
            for (let i = 1; i < trainLoss.length; i++) {
                ctx.lineTo(scaleX(i), scaleY(trainLoss[i]));
            }
            ctx.stroke();
            
            // Test loss
            ctx.strokeStyle = '#e67e22';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(scaleX(0), scaleY(testLoss[0]));
            for (let i = 1; i < testLoss.length; i++) {
                ctx.lineTo(scaleX(i), scaleY(testLoss[i]));
            }
            ctx.stroke();
        }
        
        // Highlight overfitting region
        if (isOverfitting && trainLoss.length > 30) {
            const overfitStart = 30;
            ctx.fillStyle = 'rgba(231, 76, 60, 0.1)';
            ctx.fillRect(
                scaleX(overfitStart),
                chartStartY,
                scaleX(trainLoss.length - 1) - scaleX(overfitStart),
                chartHeight
            );
        }
        
        // Draw network visualization above the chart
        this.drawNetworkVisualization(ctx, !isOverfitting);
    }
    
    // ...existing methods with minimal changes...
    updateMetrics() {
        // Overfitting model
        const overfitTrain = this.overfitTrainLoss[this.overfitTrainLoss.length - 1] || 0;
        const overfitTest = this.overfitTestLoss[this.overfitTestLoss.length - 1] || 0;
        const overfitGap = Math.abs(overfitTest - overfitTrain);
        
        document.getElementById('overfit-train-loss').textContent = overfitTrain.toFixed(2);
        document.getElementById('overfit-test-loss').textContent = overfitTest.toFixed(2);
        document.getElementById('overfit-epoch').textContent = this.epoch;
        document.getElementById('overfit-gap').textContent = overfitGap.toFixed(2);
        
        // Normalized model
        const normTrain = this.normalizedTrainLoss[this.normalizedTrainLoss.length - 1] || 0;
        const normTest = this.normalizedTestLoss[this.normalizedTestLoss.length - 1] || 0;
        const normGap = Math.abs(normTest - normTrain);
        
        document.getElementById('norm-train-loss').textContent = normTrain.toFixed(2);
        document.getElementById('norm-test-loss').textContent = normTest.toFixed(2);
        document.getElementById('norm-epoch').textContent = this.epoch;
        document.getElementById('norm-gap').textContent = normGap.toFixed(2);
    }
    
    // ...existing event listeners...
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
    }
    
    // Reset simulation
    reset() {
        this.epoch = 0;
        this.overfitTrainLoss = [this.overfitTrainStart];
        this.overfitTestLoss = [this.overfitTestStart];
        this.normalizedTrainLoss = [this.normalizedTrainStart];
        this.normalizedTestLoss = [this.normalizedTestStart];
        
        // Reset network state
        this.layerWeights = {
            overfit: { layer1: [], layer2: [], layer3: [] },
            normalized: { layer1: [], layer2: [], layer3: [] }
        };
        
        this.layerActivations = {
            overfit: { layer1: [], layer2: [], layer3: [] },
            normalized: { layer1: [], layer2: [], layer3: [] }
        };
        
        this.batchNormStats = {
            mean: [],
            variance: [],
            normalized: []
        };
        
        this.isPlaying = false;
        this.simulateLayerActivations(0, false);
        this.simulateLayerActivations(0, true);
        this.updateMetrics();
        this.draw();
    }
    
    // Training step
    trainStep() {
        if (this.epoch >= this.maxEpochs) {
            this.isPlaying = false;
            return;
        }
        
        this.epoch++;
        
        // Generate new loss values
        this.overfitTrainLoss.push(this.generateLossCurve('overfit-train', this.epoch, this.maxEpochs));
        this.overfitTestLoss.push(this.generateLossCurve('overfit-test', this.epoch, this.maxEpochs));
        this.normalizedTrainLoss.push(this.generateLossCurve('normalized-train', this.epoch, this.maxEpochs));
        this.normalizedTestLoss.push(this.generateLossCurve('normalized-test', this.epoch, this.maxEpochs));
        
        // Simulate network layers
        this.simulateLayerActivations(this.epoch, false);
        this.simulateLayerActivations(this.epoch, true);
        
        this.updateMetrics();
    }
    
    // Update loop
    update() {
        if (!this.isPlaying) return;
        
        this.frameCounter++;
        
        if (this.frameCounter % Math.max(1, 11 - this.speed) === 0) {
            this.trainStep();
        }
    }
    
    // Draw both charts
    draw() {
        this.drawChart(this.overfitCtx, this.overfitTrainLoss, this.overfitTestLoss, true);
        this.drawChart(this.normalizedCtx, this.normalizedTrainLoss, this.normalizedTestLoss, false);
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
    new BatchNormalizationDemo();
});
