// Neural Network Interactive Demo
// Developed by: Venugopal Adep

class NeuralNetwork {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.inputNodes = 3;
        this.hiddenNodes = 4;
        this.outputNodes = 2;
        this.animationSpeed = 5;
        this.isAnimating = false;
        
        // Network structure
        this.layers = [];
        this.weights = [];
        this.connections = [];
        
        // Animation state
        this.animationFrame = 0;
        this.animationProgress = 0;
        this.currentLayer = 0;
        
        this.initializeNetwork();
        this.setupEventListeners();
        this.draw();
    }
    
    initializeNetwork() {
        this.layers = [
            { nodes: this.inputNodes, color: '#ff6b9d', label: 'Input Layer' },
            { nodes: this.hiddenNodes, color: '#4a90e2', label: 'Hidden Layer' },
            { nodes: this.outputNodes, color: '#7ed321', label: 'Output Layer' }
        ];
        
        this.calculatePositions();
        this.initializeWeights();
        this.updateStatistics();
    }
    
    calculatePositions() {
        const layerSpacing = this.canvas.width / (this.layers.length + 1);
        
        this.layers.forEach((layer, layerIndex) => {
            layer.positions = [];
            const nodeSpacing = this.canvas.height / (layer.nodes + 1);
            
            for (let i = 0; i < layer.nodes; i++) {
                layer.positions.push({
                    x: layerSpacing * (layerIndex + 1),
                    y: nodeSpacing * (i + 1),
                    activation: 0,
                    value: Math.random()
                });
            }
        });
    }
    
    initializeWeights() {
        this.weights = [];
        this.connections = [];
        
        for (let i = 0; i < this.layers.length - 1; i++) {
            const layerWeights = [];
            const fromLayer = this.layers[i];
            const toLayer = this.layers[i + 1];
            
            for (let j = 0; j < fromLayer.nodes; j++) {
                const nodeWeights = [];
                for (let k = 0; k < toLayer.nodes; k++) {
                    const weight = Math.random() * 2 - 1; // Random weight between -1 and 1
                    nodeWeights.push(weight);
                    
                    this.connections.push({
                        from: fromLayer.positions[j],
                        to: toLayer.positions[k],
                        weight: weight,
                        active: false,
                        fromLayer: i,
                        toLayer: i + 1,
                        fromIndex: j,
                        toIndex: k
                    });
                }
                layerWeights.push(nodeWeights);
            }
            this.weights.push(layerWeights);
        }
    }
    
    randomizeWeights() {
        for (let connection of this.connections) {
            connection.weight = Math.random() * 2 - 1;
        }
        
        // Update weights array
        let connIndex = 0;
        for (let i = 0; i < this.weights.length; i++) {
            for (let j = 0; j < this.weights[i].length; j++) {
                for (let k = 0; k < this.weights[i][j].length; k++) {
                    this.weights[i][j][k] = this.connections[connIndex].weight;
                    connIndex++;
                }
            }
        }
        
        this.draw();
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw connections first (behind neurons)
        this.drawConnections();
        
        // Draw neurons
        this.drawNeurons();
        
        // Draw labels
        this.drawLabels();
    }
    
    drawConnections() {
        for (let connection of this.connections) {
            const { from, to, weight, active } = connection;
            
            this.ctx.beginPath();
            this.ctx.moveTo(from.x, from.y);
            this.ctx.lineTo(to.x, to.y);
            
            if (active) {
                // Active connection with gradient
                const gradient = this.ctx.createLinearGradient(from.x, from.y, to.x, to.y);
                gradient.addColorStop(0, '#ffd700');
                gradient.addColorStop(1, '#ff4500');
                this.ctx.strokeStyle = gradient;
                this.ctx.lineWidth = 3;
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = '#ffd700';
            } else {
                // Inactive connection - color based on weight
                const weightAbs = Math.abs(weight);
                const alpha = 0.2 + weightAbs * 0.3;
                this.ctx.strokeStyle = weight > 0 
                    ? `rgba(46, 204, 113, ${alpha})` 
                    : `rgba(231, 76, 60, ${alpha})`;
                this.ctx.lineWidth = 1 + weightAbs;
                this.ctx.shadowBlur = 0;
            }
            
            this.ctx.stroke();
        }
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
    }
    
    drawNeurons() {
        this.layers.forEach((layer, layerIndex) => {
            layer.positions.forEach((pos, nodeIndex) => {
                const radius = 25;
                
                // Draw neuron circle
                this.ctx.beginPath();
                this.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
                
                // Fill based on activation
                if (pos.activation > 0) {
                    const intensity = Math.min(pos.activation, 1);
                    this.ctx.fillStyle = this.interpolateColor('#ffffff', layer.color, intensity);
                    this.ctx.shadowBlur = 15;
                    this.ctx.shadowColor = layer.color;
                } else {
                    this.ctx.fillStyle = layer.color;
                    this.ctx.shadowBlur = 0;
                }
                
                this.ctx.fill();
                
                // Border
                this.ctx.strokeStyle = '#333';
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
                
                this.ctx.shadowBlur = 0;
                
                // Draw activation value if active
                if (pos.activation > 0) {
                    this.ctx.fillStyle = '#333';
                    this.ctx.font = 'bold 12px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(pos.value.toFixed(2), pos.x, pos.y);
                }
            });
        });
    }
    
    drawLabels() {
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#333';
        
        this.layers.forEach((layer, index) => {
            const x = layer.positions[0].x;
            const y = 30;
            this.ctx.fillText(layer.label, x, y);
        });
    }
    
    interpolateColor(color1, color2, factor) {
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);
        
        const r = Math.round(c1.r + (c2.r - c1.r) * factor);
        const g = Math.round(c1.g + (c2.g - c1.g) * factor);
        const b = Math.round(c1.b + (c2.b - c1.b) * factor);
        
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
    }
    
    forwardPropagation() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.animationProgress = 0;
        this.currentLayer = 0;
        
        // Reset all activations
        this.layers.forEach(layer => {
            layer.positions.forEach(pos => {
                pos.activation = 0;
                pos.value = 0;
            });
        });
        
        // Reset all connections
        this.connections.forEach(conn => {
            conn.active = false;
        });
        
        // Initialize input layer with random values
        this.layers[0].positions.forEach(pos => {
            pos.value = Math.random();
            pos.activation = 1;
        });
        
        this.animateForwardPropagation();
    }
    
    animateForwardPropagation() {
        if (this.currentLayer >= this.layers.length - 1) {
            this.isAnimating = false;
            document.getElementById('activation-display').textContent = 
                '✅ Forward Propagation Complete! Output values computed.';
            return;
        }
        
        const speed = 50 / this.animationSpeed;
        
        // Activate connections from current layer to next
        const currentLayerConnections = this.connections.filter(
            conn => conn.fromLayer === this.currentLayer
        );
        
        this.animationProgress += 1;
        
        if (this.animationProgress < speed) {
            // Animate connections
            const progress = this.animationProgress / speed;
            currentLayerConnections.forEach(conn => {
                conn.active = progress > Math.random() * 0.5;
            });
            
            document.getElementById('activation-display').textContent = 
                `🔄 Propagating signals from ${this.layers[this.currentLayer].label} to ${this.layers[this.currentLayer + 1].label}...`;
            
        } else {
            // Complete layer transition
            currentLayerConnections.forEach(conn => {
                conn.active = false;
            });
            
            // Compute activations for next layer
            const nextLayer = this.layers[this.currentLayer + 1];
            const currentLayer = this.layers[this.currentLayer];
            
            nextLayer.positions.forEach((pos, toIndex) => {
                let sum = 0;
                currentLayer.positions.forEach((fromPos, fromIndex) => {
                    const weight = this.weights[this.currentLayer][fromIndex][toIndex];
                    sum += fromPos.value * weight;
                });
                
                // Apply activation function (Sigmoid)
                pos.value = 1 / (1 + Math.exp(-sum));
                pos.activation = 1;
            });
            
            this.currentLayer++;
            this.animationProgress = 0;
        }
        
        this.draw();
        requestAnimationFrame(() => this.animateForwardPropagation());
    }
    
    updateArchitecture(inputNodes, hiddenNodes, outputNodes) {
        this.inputNodes = inputNodes;
        this.hiddenNodes = hiddenNodes;
        this.outputNodes = outputNodes;
        this.initializeNetwork();
        this.draw();
    }
    
    updateStatistics() {
        const totalNeurons = this.inputNodes + this.hiddenNodes + this.outputNodes;
        const totalConnections = (this.inputNodes * this.hiddenNodes) + (this.hiddenNodes * this.outputNodes);
        
        document.getElementById('total-neurons').textContent = totalNeurons;
        document.getElementById('total-connections').textContent = totalConnections;
        document.getElementById('total-weights').textContent = totalConnections;
        document.getElementById('network-depth').textContent = this.layers.length;
    }
    
    reset() {
        this.isAnimating = false;
        this.animationProgress = 0;
        this.currentLayer = 0;
        
        this.layers.forEach(layer => {
            layer.positions.forEach(pos => {
                pos.activation = 0;
                pos.value = 0;
            });
        });
        
        this.connections.forEach(conn => {
            conn.active = false;
        });
        
        document.getElementById('activation-display').textContent = 
            'Click "Forward Propagation" to see signal flow through the network';
        
        this.draw();
    }
    
    setupEventListeners() {
        // Input layer control
        document.getElementById('input-slider').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('input-value').textContent = value;
            this.updateArchitecture(value, this.hiddenNodes, this.outputNodes);
        });
        
        // Hidden layer control
        document.getElementById('hidden-slider').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('hidden-value').textContent = value;
            this.updateArchitecture(this.inputNodes, value, this.outputNodes);
        });
        
        // Output layer control
        document.getElementById('output-slider').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('output-value').textContent = value;
            this.updateArchitecture(this.inputNodes, this.hiddenNodes, value);
        });
        
        // Speed control
        document.getElementById('speed-slider').addEventListener('input', (e) => {
            this.animationSpeed = parseInt(e.target.value);
            document.getElementById('speed-value').textContent = this.animationSpeed + 'x';
        });
        
        // Forward propagation button
        document.getElementById('forward-btn').addEventListener('click', () => {
            this.forwardPropagation();
        });
        
        // Random weights button
        document.getElementById('random-weights-btn').addEventListener('click', () => {
            this.randomizeWeights();
        });
        
        // Reset button
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.reset();
        });
        
        // Canvas click for interaction
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Check if clicked on a neuron
            this.layers.forEach((layer, layerIndex) => {
                layer.positions.forEach((pos, nodeIndex) => {
                    const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
                    if (distance < 25) {
                        const message = `${layer.label} - Neuron ${nodeIndex + 1}\nValue: ${pos.value.toFixed(3)}\nActivation: ${pos.activation.toFixed(2)}`;
                        document.getElementById('activation-display').textContent = message;
                    }
                });
            });
        });
    }
}

// Initialize the neural network when page loads
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('neural-network-canvas');
    const neuralNetwork = new NeuralNetwork(canvas);
});
