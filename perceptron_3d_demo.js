// Perceptron 3D Demo - Interactive Neural Network Visualization
class Perceptron3DDemo {
    constructor() {
        // Neuron parameters
        this.weights = [1.0, 1.0, 1.0]; // w1, w2, w3
        this.bias = 0.0;
        this.learningRate = 0.1;
        this.activationType = 1; // 1: step, 2: sigmoid, 3: tanh
        
        // Data
        this.data = [];
        this.labels = [];
        this.numPoints = 100;
        this.spread = 2.0;
        
        // Training
        this.isTraining = false;
        this.trainingIteration = 0;
        this.maxIterations = 100;
        
        // Current view mode
        this.currentView = 'data'; // 'data' or 'neuron'
        
        this.initializeEventListeners();
        this.generateInitialData();
        this.updateVisualization();
    }

    initializeEventListeners() {
        // Weight sliders
        document.getElementById('w1Slider').addEventListener('input', (e) => {
            this.weights[0] = parseFloat(e.target.value);
            document.getElementById('w1Value').textContent = e.target.value;
            this.updateVisualization();
        });

        document.getElementById('w2Slider').addEventListener('input', (e) => {
            this.weights[1] = parseFloat(e.target.value);
            document.getElementById('w2Value').textContent = e.target.value;
            this.updateVisualization();
        });

        document.getElementById('w3Slider').addEventListener('input', (e) => {
            this.weights[2] = parseFloat(e.target.value);
            document.getElementById('w3Value').textContent = e.target.value;
            this.updateVisualization();
        });

        document.getElementById('biasSlider').addEventListener('input', (e) => {
            this.bias = parseFloat(e.target.value);
            document.getElementById('biasValue').textContent = e.target.value;
            this.updateVisualization();
        });

        // Activation function
        document.getElementById('activationSlider').addEventListener('input', (e) => {
            this.activationType = parseInt(e.target.value);
            const types = ['Step', 'Sigmoid', 'Tanh'];
            document.getElementById('activationTypeValue').textContent = types[this.activationType - 1];
            this.updateActivationDisplay();
            this.updateVisualization();
        });

        // Data generation
        document.getElementById('numPointsSlider').addEventListener('input', (e) => {
            this.numPoints = parseInt(e.target.value);
            document.getElementById('numPointsValue').textContent = e.target.value;
        });

        document.getElementById('spreadSlider').addEventListener('input', (e) => {
            this.spread = parseFloat(e.target.value);
            document.getElementById('spreadValue').textContent = e.target.value;
        });

        // Learning rate
        document.getElementById('learningRateSlider').addEventListener('input', (e) => {
            this.learningRate = parseFloat(e.target.value);
            document.getElementById('learningRateValue').textContent = e.target.value.padEnd(4, '0');
        });

        // Buttons
        document.getElementById('generateDataBtn').addEventListener('click', () => {
            this.generateRandomData();
            this.updateVisualization();
        });

        document.getElementById('trainBtn').addEventListener('click', () => {
            this.trainPerceptron();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetWeights();
        });

        // View switchers
        document.getElementById('dataViewBtn').addEventListener('click', () => {
            this.switchToDataView();
        });

        document.getElementById('neuronViewBtn').addEventListener('click', () => {
            this.switchToNeuronView();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch(e.key.toLowerCase()) {
                case 'g':
                    this.generateRandomData();
                    this.updateVisualization();
                    break;
                case ' ':
                    e.preventDefault();
                    this.trainPerceptron();
                    break;
                case 'r':
                    this.resetWeights();
                    break;
                case '1':
                    this.switchToDataView();
                    break;
                case '2':
                    this.switchToNeuronView();
                    break;
            }
        });
    }

    generateInitialData() {
        // Generate linearly separable data in 3D
        this.data = [];
        this.labels = [];
        
        const n = this.numPoints;
        
        // Class 1 (positive): points where x + y + z > 0
        for (let i = 0; i < n/2; i++) {
            const x = (Math.random() - 0.5) * this.spread + 1;
            const y = (Math.random() - 0.5) * this.spread + 1;
            const z = (Math.random() - 0.5) * this.spread + 1;
            this.data.push([x, y, z]);
            this.labels.push(1);
        }
        
        // Class 0 (negative): points where x + y + z < 0
        for (let i = 0; i < n/2; i++) {
            const x = (Math.random() - 0.5) * this.spread - 1;
            const y = (Math.random() - 0.5) * this.spread - 1;
            const z = (Math.random() - 0.5) * this.spread - 1;
            this.data.push([x, y, z]);
            this.labels.push(0);
        }
    }

    generateRandomData() {
        this.generateInitialData();
        this.updateStatusMessage("New random data generated!");
    }

    activationFunction(z) {
        switch(this.activationType) {
            case 1: // Step function
                return z >= 0 ? 1 : 0;
            case 2: // Sigmoid
                return 1 / (1 + Math.exp(-z));
            case 3: // Tanh
                return Math.tanh(z);
            default:
                return z >= 0 ? 1 : 0;
        }
    }

    predict(x) {
        const netInput = this.weights[0] * x[0] + this.weights[1] * x[1] + this.weights[2] * x[2] + this.bias;
        return this.activationFunction(netInput);
    }

    calculateAccuracy() {
        let correct = 0;
        for (let i = 0; i < this.data.length; i++) {
            const prediction = this.predict(this.data[i]);
            const predicted_class = this.activationType === 1 ? prediction : (prediction > 0.5 ? 1 : 0);
            if (predicted_class === this.labels[i]) {
                correct++;
            }
        }
        return correct / this.data.length;
    }

    trainPerceptron() {
        if (this.isTraining) return;
        
        this.isTraining = true;
        this.trainingIteration = 0;
        this.updateStatusMessage("Training perceptron...");
        
        const trainStep = () => {
            let errorCount = 0;
            
            for (let i = 0; i < this.data.length; i++) {
                const x = this.data[i];
                const target = this.labels[i];
                const netInput = this.weights[0] * x[0] + this.weights[1] * x[1] + this.weights[2] * x[2] + this.bias;
                const prediction = this.activationFunction(netInput);
                
                let error;
                if (this.activationType === 1) {
                    // Step function - use perceptron rule
                    error = target - prediction;
                } else {
                    // Sigmoid/Tanh - use gradient descent
                    const predicted_class = prediction > 0.5 ? 1 : 0;
                    error = target - predicted_class;
                }
                
                if (Math.abs(error) > 0.1) {
                    errorCount++;
                    // Update weights
                    this.weights[0] += this.learningRate * error * x[0];
                    this.weights[1] += this.learningRate * error * x[1];
                    this.weights[2] += this.learningRate * error * x[2];
                    this.bias += this.learningRate * error;
                }
            }
            
            // Update sliders and displays with new weight values during training
            this.updateSlidersFromWeights();
            
            this.trainingIteration++;
            this.updateVisualization();
            
            if (errorCount === 0 || this.trainingIteration >= this.maxIterations) {
                this.isTraining = false;
                const accuracy = (this.calculateAccuracy() * 100).toFixed(1);
                this.updateStatusMessage(`Training complete! Accuracy: ${accuracy}% (${this.trainingIteration} iterations)`);
            } else {
                setTimeout(trainStep, 100); // Continue training with delay for animation
            }
        };
        
        trainStep();
    }

    // Add new method to update sliders from current weight values
    updateSlidersFromWeights() {
        // Clamp weights to slider ranges to prevent out-of-bounds values
        const clampedWeights = [
            Math.max(-5, Math.min(5, this.weights[0])),
            Math.max(-5, Math.min(5, this.weights[1])),
            Math.max(-5, Math.min(5, this.weights[2]))
        ];
        const clampedBias = Math.max(-3, Math.min(3, this.bias));
        
        // Update the actual weights/bias to clamped values if they were out of range
        this.weights[0] = clampedWeights[0];
        this.weights[1] = clampedWeights[1];
        this.weights[2] = clampedWeights[2];
        this.bias = clampedBias;
        
        // Update slider positions
        document.getElementById('w1Slider').value = clampedWeights[0].toFixed(1);
        document.getElementById('w2Slider').value = clampedWeights[1].toFixed(1);
        document.getElementById('w3Slider').value = clampedWeights[2].toFixed(1);
        document.getElementById('biasSlider').value = clampedBias.toFixed(1);
        
        // Update value displays
        document.getElementById('w1Value').textContent = clampedWeights[0].toFixed(1);
        document.getElementById('w2Value').textContent = clampedWeights[1].toFixed(1);
        document.getElementById('w3Value').textContent = clampedWeights[2].toFixed(1);
        document.getElementById('biasValue').textContent = clampedBias.toFixed(1);
    }

    resetWeights() {
        this.weights = [1.0, 1.0, 1.0];
        this.bias = 0.0;
        
        // Update sliders
        document.getElementById('w1Slider').value = 1.0;
        document.getElementById('w2Slider').value = 1.0;
        document.getElementById('w3Slider').value = 1.0;
        document.getElementById('biasSlider').value = 0.0;
        
        // Update displays
        document.getElementById('w1Value').textContent = '1.0';
        document.getElementById('w2Value').textContent = '1.0';
        document.getElementById('w3Value').textContent = '1.0';
        document.getElementById('biasValue').textContent = '0.0';
        
        this.updateVisualization();
        this.updateStatusMessage("Weights reset to default values!");
    }

    switchToDataView() {
        this.currentView = 'data';
        document.getElementById('dataViewBtn').classList.add('active');
        document.getElementById('neuronViewBtn').classList.remove('active');
        document.getElementById('perceptronPlot').style.display = 'block';
        document.getElementById('neuronDiagram').style.display = 'none';
        document.getElementById('plotTitle').textContent = '3D Perceptron Decision Boundary';
        this.updateVisualization();
    }

    switchToNeuronView() {
        this.currentView = 'neuron';
        document.getElementById('neuronViewBtn').classList.add('active');
        document.getElementById('dataViewBtn').classList.remove('active');
        document.getElementById('perceptronPlot').style.display = 'none';
        document.getElementById('neuronDiagram').style.display = 'block';
        document.getElementById('plotTitle').textContent = 'Perceptron Neural Network Structure';
        this.createNeuronDiagram();
    }

    createNeuronDiagram() {
        // Create a network diagram showing the perceptron structure
        const trace_inputs = {
            x: [1, 1, 1],
            y: [3, 2, 1],
            z: [0, 0, 0],
            mode: 'markers+text',
            type: 'scatter3d',
            marker: {
                size: 20,
                color: '#3498db',
                symbol: 'circle'
            },
            text: ['x₁', 'x₂', 'x₃'],
            textposition: 'middle left',
            name: 'Inputs',
            showlegend: true
        };

        const trace_neuron = {
            x: [4],
            y: [2],
            z: [0],
            mode: 'markers+text',
            type: 'scatter3d',
            marker: {
                size: 40,
                color: '#e74c3c',
                symbol: 'circle'
            },
            text: ['⊕<br>Σ'],
            textfont: { size: 20 },
            textposition: 'middle center',
            name: 'Neuron',
            showlegend: true
        };

        const trace_output = {
            x: [7],
            y: [2],
            z: [0],
            mode: 'markers+text',
            type: 'scatter3d',
            marker: {
                size: 20,
                color: '#27ae60',
                symbol: 'diamond'
            },
            text: ['Output'],
            textposition: 'middle right',
            name: 'Output',
            showlegend: true
        };

        // Connection lines (weights)
        const trace_weights = {
            x: [1, 4, null, 1, 4, null, 1, 4],
            y: [3, 2, null, 2, 2, null, 1, 2],
            z: [0, 0, null, 0, 0, null, 0, 0],
            mode: 'lines+text',
            type: 'scatter3d',
            line: {
                width: 6,
                color: '#667eea'
            },
            text: ['', `w₁=${this.weights[0].toFixed(1)}`, '', '', `w₂=${this.weights[1].toFixed(1)}`, '', '', `w₃=${this.weights[2].toFixed(1)}`],
            textposition: 'middle center',
            name: 'Weights',
            showlegend: true
        };

        const trace_output_line = {
            x: [4, 7],
            y: [2, 2],
            z: [0, 0],
            mode: 'lines',
            type: 'scatter3d',
            line: {
                width: 6,
                color: '#27ae60'
            },
            name: 'Output Line',
            showlegend: false
        };

        const layout = {
            scene: {
                xaxis: { title: '', showgrid: false, zeroline: false, showticklabels: false },
                yaxis: { title: '', showgrid: false, zeroline: false, showticklabels: false },
                zaxis: { title: '', showgrid: false, zeroline: false, showticklabels: false },
                camera: {
                    eye: { x: 0, y: 0, z: 1.5 }
                },
                bgcolor: 'rgba(0,0,0,0)'
            },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            margin: { l: 0, r: 0, b: 0, t: 0 },
            showlegend: true,
            legend: {
                x: 0.02,
                y: 0.98
            }
        };

        Plotly.newPlot('neuronDiagram', [trace_inputs, trace_neuron, trace_output, trace_weights, trace_output_line], layout);
    }

    createDecisionBoundaryMesh() {
        // Create a mesh for the decision boundary plane: w1*x + w2*y + w3*z + b = 0
        const range = 5;
        const resolution = 20;
        
        if (this.weights[2] === 0) {
            // Handle case where w3 is zero (plane parallel to z-axis)
            return null;
        }
        
        const x = [];
        const y = [];
        const z = [];
        
        for (let i = 0; i <= resolution; i++) {
            const xi = -range + (2 * range * i) / resolution;
            const row_y = [];
            const row_z = [];
            
            for (let j = 0; j <= resolution; j++) {
                const yj = -range + (2 * range * j) / resolution;
                // Calculate z from the plane equation: z = -(w1*x + w2*y + b) / w3
                const zk = -(this.weights[0] * xi + this.weights[1] * yj + this.bias) / this.weights[2];
                
                row_y.push(yj);
                row_z.push(zk);
            }
            
            x.push(new Array(resolution + 1).fill(xi));
            y.push(row_y);
            z.push(row_z);
        }
        
        return {
            type: 'surface',
            x: x,
            y: y,
            z: z,
            colorscale: [[0, 'rgba(102, 126, 234, 0.3)'], [1, 'rgba(102, 126, 234, 0.3)']],
            showscale: false,
            name: 'Decision Boundary',
            hoverinfo: 'skip'
        };
    }

    updateVisualization() {
        if (this.currentView !== 'data') return;

        // Separate data by class for coloring
        const class0_x = [], class0_y = [], class0_z = [];
        const class1_x = [], class1_y = [], class1_z = [];
        
        for (let i = 0; i < this.data.length; i++) {
            if (this.labels[i] === 0) {
                class0_x.push(this.data[i][0]);
                class0_y.push(this.data[i][1]);
                class0_z.push(this.data[i][2]);
            } else {
                class1_x.push(this.data[i][0]);
                class1_y.push(this.data[i][1]);
                class1_z.push(this.data[i][2]);
            }
        }

        // Create scatter plots for each class
        const trace_class0 = {
            x: class0_x,
            y: class0_y,
            z: class0_z,
            mode: 'markers',
            type: 'scatter3d',
            marker: {
                size: 8,
                color: '#e74c3c',
                symbol: 'circle',
                opacity: 0.8
            },
            name: 'Class 0',
            showlegend: true
        };

        const trace_class1 = {
            x: class1_x,
            y: class1_y,
            z: class1_z,
            mode: 'markers',
            type: 'scatter3d',
            marker: {
                size: 8,
                color: '#27ae60',
                symbol: 'diamond',
                opacity: 0.8
            },
            name: 'Class 1',
            showlegend: true
        };

        const traces = [trace_class0, trace_class1];

        // Add decision boundary if weights are not all zero
        const boundary = this.createDecisionBoundaryMesh();
        if (boundary) {
            traces.push(boundary);
        }

        const layout = {
            scene: {
                xaxis: { title: 'X₁', range: [-5, 5] },
                yaxis: { title: 'X₂', range: [-5, 5] },
                zaxis: { title: 'X₃', range: [-5, 5] },
                camera: {
                    eye: { x: 1.2, y: 1.2, z: 1.2 }
                }
            },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            margin: { l: 0, r: 0, b: 0, t: 0 },
            showlegend: true,
            legend: {
                x: 0.02,
                y: 0.98
            }
        };

        Plotly.newPlot('perceptronPlot', traces, layout);
        this.updateMetrics();
        this.updateEquationDisplay();
    }

    updateMetrics() {
        const accuracy = this.calculateAccuracy() * 100;
        document.getElementById('accuracyMetric').textContent = accuracy.toFixed(1) + '%';
        
        // Calculate average net input
        let sumNetInput = 0;
        let positiveCount = 0;
        
        for (let i = 0; i < this.data.length; i++) {
            const x = this.data[i];
            const netInput = this.weights[0] * x[0] + this.weights[1] * x[1] + this.weights[2] * x[2] + this.bias;
            sumNetInput += netInput;
            
            if (this.predict(x) > 0.5) {
                positiveCount++;
            }
        }
        
        const avgNetInput = this.data.length > 0 ? sumNetInput / this.data.length : 0;
        document.getElementById('netInputMetric').textContent = avgNetInput.toFixed(2);
        document.getElementById('positiveOutputs').textContent = positiveCount;
        
        const weightsSum = this.weights.reduce((a, b) => a + b, 0) + this.bias;
        document.getElementById('weightsSum').textContent = weightsSum.toFixed(2);
        
        // Update current weights display
        const weightsDisplay = `[${this.weights.map(w => w.toFixed(1)).join(', ')}, ${this.bias.toFixed(1)}]`;
        document.getElementById('currentWeights').textContent = weightsDisplay;
    }

    updateEquationDisplay() {
        const w1 = this.weights[0].toFixed(1);
        const w2 = this.weights[1].toFixed(1);
        const w3 = this.weights[2].toFixed(1);
        const b = this.bias.toFixed(1);
        
        const equation = `Output = σ(${w1}x₁ + ${w2}x₂ + ${w3}x₃ + ${b})`;
        document.getElementById('neuronEquation').textContent = equation;
    }

    updateActivationDisplay() {
        const functions = [
            { name: 'Step Function', formula: 'σ(z) = 1 if z ≥ 0, else 0' },
            { name: 'Sigmoid', formula: 'σ(z) = 1 / (1 + e⁻ᶻ)' },
            { name: 'Tanh', formula: 'σ(z) = tanh(z) = (eᶻ - e⁻ᶻ) / (eᶻ + e⁻ᶻ)' }
        ];
        
        const func = functions[this.activationType - 1];
        document.getElementById('activationDisplay').textContent = func.name;
        document.getElementById('activationFormula').textContent = func.formula;
    }

    updateStatusMessage(message) {
        document.getElementById('statusMessage').textContent = message;
    }
}

// Initialize the demo when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Perceptron3DDemo();
});