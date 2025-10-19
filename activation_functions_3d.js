// 3D Activation Functions Visualization using Three.js
// Deep Learning Demo - Interactive and Visual

class ActivationFunctions3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.surface = null;
        this.derivativeSurface = null;
        this.grid = null;
        
        this.currentFunction = 'relu';
        this.parameter = 0.01;
        this.resolution = 60;
        this.showDerivative = false;
        this.showGrid = true;
        this.autoRotate = true;
        this.show2DPlot = true;
        this.showWireframe = false;
        this.showParticles = false;
        this.animationSpeed = 1.0;
        this.viewAll = false;
        this.comparisonMode = false;
        
        // Animation
        this.time = 0;
        this.particles = [];
        
        // 2D canvas
        this.canvas2D = null;
        this.ctx2D = null;
        
        this.init();
        this.setup2DCanvas();
        this.setupControls();
        this.animate();
    }
    
    init() {
        const container = document.getElementById('canvas-container');
        
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(12, 10, 12);
        this.camera.lookAt(0, 0, 0);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(this.renderer.domElement);
        
        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight1.position.set(10, 10, 10);
        this.scene.add(directionalLight1);
        
        const directionalLight2 = new THREE.DirectionalLight(0x4fc3f7, 0.6);
        directionalLight2.position.set(-10, -10, -10);
        this.scene.add(directionalLight2);
        
        const pointLight = new THREE.PointLight(0x764ba2, 0.8, 50);
        pointLight.position.set(0, 5, 0);
        this.scene.add(pointLight);
        
        // Grid - larger and more visible
        this.createGrid();
        
        // Create particles system
        this.createParticles();
        
        // Create initial surface
        this.updateSurface();
        
        // Mouse controls (basic rotation)
        this.setupMouseControls();
        
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }
    
    setup2DCanvas() {
        this.canvas2D = document.getElementById('plot-canvas');
        this.ctx2D = this.canvas2D.getContext('2d');
        
        // Set canvas size - bigger
        this.canvas2D.width = 410;
        this.canvas2D.height = 260;
        
        this.draw2DPlot();
    }
    
    draw2DPlot() {
        if (!this.show2DPlot || !this.ctx2D) return;
        
        const ctx = this.ctx2D;
        const width = this.canvas2D.width;
        const height = this.canvas2D.height;
        
        // Clear canvas
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, width, height);
        
        // Setup coordinate system
        const padding = 40;
        const plotWidth = width - 2 * padding;
        const plotHeight = height - 2 * padding;
        
        const xMin = -6;
        const xMax = 6;
        const yMin = -2;
        const yMax = 6;
        
        // Draw axes
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        // X-axis
        const yZero = padding + plotHeight * (yMax / (yMax - yMin));
        ctx.moveTo(padding, yZero);
        ctx.lineTo(width - padding, yZero);
        
        // Y-axis
        const xZero = padding + plotWidth * (-xMin / (xMax - xMin));
        ctx.moveTo(xZero, padding);
        ctx.lineTo(xZero, height - padding);
        ctx.stroke();
        
        // Draw grid
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 0.5;
        for (let i = -2; i <= 2; i++) {
            if (i !== 0) {
                // Horizontal grid lines
                const y = padding + plotHeight * ((yMax - i) / (yMax - yMin));
                ctx.beginPath();
                ctx.moveTo(padding, y);
                ctx.lineTo(width - padding, y);
                ctx.stroke();
            }
        }
        
        // Draw labels
        ctx.fillStyle = '#999';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        
        // X-axis labels
        for (let x = -5; x <= 5; x += 5) {
            const px = padding + plotWidth * ((x - xMin) / (xMax - xMin));
            ctx.fillText(x.toString(), px, yZero + 15);
        }
        
        // Y-axis labels
        ctx.textAlign = 'right';
        for (let y = 0; y <= 4; y += 2) {
            const py = padding + plotHeight * ((yMax - y) / (yMax - yMin));
            ctx.fillText(y.toString(), xZero - 5, py + 3);
        }
        
        // Draw function
        const activationFunc = this.getActivationFunction(this.currentFunction);
        
        ctx.strokeStyle = '#4fc3f7';
        ctx.lineWidth = 3.5;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#4fc3f7';
        ctx.beginPath();
        
        let firstPoint = true;
        for (let px = 0; px <= plotWidth; px += 1) {
            const x = xMin + (px / plotWidth) * (xMax - xMin);
            const y = activationFunc(x);
            
            // Clamp y to visible range
            const clampedY = Math.max(yMin, Math.min(yMax, y));
            
            const canvasX = padding + px;
            const canvasY = padding + plotHeight * ((yMax - clampedY) / (yMax - yMin));
            
            if (firstPoint) {
                ctx.moveTo(canvasX, canvasY);
                firstPoint = false;
            } else {
                ctx.lineTo(canvasX, canvasY);
            }
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Draw derivative if enabled
        if (this.showDerivative) {
            const derivativeFunc = this.getDerivativeFunction(this.currentFunction);
            
            ctx.strokeStyle = '#ff6b6b';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#ff6b6b';
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            
            firstPoint = true;
            for (let px = 0; px <= plotWidth; px += 1) {
                const x = xMin + (px / plotWidth) * (xMax - xMin);
                const y = derivativeFunc(x);
                
                const clampedY = Math.max(yMin, Math.min(yMax, y));
                
                const canvasX = padding + px;
                const canvasY = padding + plotHeight * ((yMax - clampedY) / (yMax - yMin));
                
                if (firstPoint) {
                    ctx.moveTo(canvasX, canvasY);
                    firstPoint = false;
                } else {
                    ctx.lineTo(canvasX, canvasY);
                }
            }
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.shadowBlur = 0;
            
            // Add legend for derivative
            ctx.fillStyle = '#ff6b6b';
            ctx.font = 'bold 11px Arial';
            ctx.fillText('--- Derivative', width - padding - 80, padding + 15);
        }
        
        // Add function name on plot
        ctx.fillStyle = '#4fc3f7';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        const funcNames = {
            'sigmoid': '📈 Sigmoid',
            'tanh': '📉 Tanh',
            'relu': '⚡ ReLU'
        };
        ctx.fillText(funcNames[this.currentFunction], padding + 10, padding + 20);
    }
    
    createGrid() {
        if (this.grid) {
            this.scene.remove(this.grid);
        }
        
        const gridHelper = new THREE.GridHelper(15, 30, 0x4fc3f7, 0x333333);
        gridHelper.position.y = -4;
        this.grid = gridHelper;
        
        if (this.showGrid) {
            this.scene.add(this.grid);
        }
    }
    
    createParticles() {
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 500;
        const positions = new Float32Array(particlesCount * 3);
        const colors = new Float32Array(particlesCount * 3);
        
        for (let i = 0; i < particlesCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 30;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
            
            colors[i * 3] = Math.random();
            colors[i * 3 + 1] = Math.random() * 0.5 + 0.5;
            colors[i * 3 + 2] = 1;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        this.particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
        
        if (this.showParticles) {
            this.scene.add(this.particleSystem);
        }
    }
    
    setupMouseControls() {
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        
        this.renderer.domElement.addEventListener('mousedown', (e) => {
            isDragging = true;
        });
        
        this.renderer.domElement.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaMove = {
                    x: e.offsetX - previousMousePosition.x,
                    y: e.offsetY - previousMousePosition.y
                };
                
                const deltaRotationQuaternion = new THREE.Quaternion()
                    .setFromEuler(new THREE.Euler(
                        deltaMove.y * 0.01,
                        deltaMove.x * 0.01,
                        0,
                        'XYZ'
                    ));
                
                this.camera.position.applyQuaternion(deltaRotationQuaternion);
                this.camera.lookAt(this.scene.position);
            }
            
            previousMousePosition = {
                x: e.offsetX,
                y: e.offsetY
            };
        });
        
        this.renderer.domElement.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        // Zoom with mouse wheel
        this.renderer.domElement.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomSpeed = 0.1;
            const direction = this.camera.position.clone().normalize();
            
            if (e.deltaY < 0) {
                this.camera.position.sub(direction.multiplyScalar(zoomSpeed));
            } else {
                this.camera.position.add(direction.multiplyScalar(zoomSpeed));
            }
            
            // Limit zoom
            const distance = this.camera.position.length();
            if (distance < 5) {
                this.camera.position.normalize().multiplyScalar(5);
            } else if (distance > 20) {
                this.camera.position.normalize().multiplyScalar(20);
            }
        });
    }
    
    // Activation Functions
    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }
    
    sigmoidDerivative(x) {
        const s = this.sigmoid(x);
        return s * (1 - s);
    }
    
    tanh(x) {
        return Math.tanh(x);
    }
    
    tanhDerivative(x) {
        const t = Math.tanh(x);
        return 1 - t * t;
    }
    
    relu(x) {
        return Math.max(0, x);
    }
    
    reluDerivative(x) {
        return x > 0 ? 1 : 0;
    }
    
    leakyRelu(x, alpha = 0.01) {
        return x > 0 ? x : alpha * x;
    }
    
    leakyReluDerivative(x, alpha = 0.01) {
        return x > 0 ? 1 : alpha;
    }
    
    elu(x, alpha = 1.0) {
        return x > 0 ? x : alpha * (Math.exp(x) - 1);
    }
    
    eluDerivative(x, alpha = 1.0) {
        return x > 0 ? 1 : alpha * Math.exp(x);
    }
    
    swish(x, beta = 1.0) {
        return x / (1 + Math.exp(-beta * x));
    }
    
    swishDerivative(x, beta = 1.0) {
        const sigmoid = 1 / (1 + Math.exp(-beta * x));
        return sigmoid + beta * x * sigmoid * (1 - sigmoid);
    }
    
    gelu(x) {
        // Approximation of GELU
        return 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3))));
    }
    
    geluDerivative(x) {
        const tanh_inner = Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3));
        const tanh_val = Math.tanh(tanh_inner);
        const sech2 = 1 - tanh_val * tanh_val;
        return 0.5 * (1 + tanh_val) + 0.5 * x * sech2 * Math.sqrt(2 / Math.PI) * (1 + 3 * 0.044715 * x * x);
    }
    
    getActivationFunction(name) {
        const functions = {
            'sigmoid': (x) => this.sigmoid(x),
            'tanh': (x) => this.tanh(x),
            'relu': (x) => this.relu(x)
        };
        return functions[name];
    }
    
    getDerivativeFunction(name) {
        const derivatives = {
            'sigmoid': (x) => this.sigmoidDerivative(x),
            'tanh': (x) => this.tanhDerivative(x),
            'relu': (x) => this.reluDerivative(x)
        };
        return derivatives[name];
    }
    
    createSurface(activationFunc, isDerivative = false) {
        const resolution = this.resolution;
        const size = 8;
        const geometry = new THREE.BufferGeometry();
        
        const vertices = [];
        const colors = [];
        const indices = [];
        
        // Create vertices with color based on activation value
        for (let i = 0; i <= resolution; i++) {
            for (let j = 0; j <= resolution; j++) {
                const x = (i / resolution) * size * 2 - size;
                const z = (j / resolution) * size * 2 - size;
                const y = activationFunc(x) * 1.5; // Scale up for better visibility
                
                vertices.push(x, y, z);
                
                // Enhanced color based on y value
                const color = this.getColorForValue(y, isDerivative);
                colors.push(color.r, color.g, color.b);
            }
        }
        
        // Create indices for triangles
        for (let i = 0; i < resolution; i++) {
            for (let j = 0; j < resolution; j++) {
                const a = i * (resolution + 1) + j;
                const b = a + 1;
                const c = a + resolution + 1;
                const d = c + 1;
                
                indices.push(a, c, b);
                indices.push(b, c, d);
            }
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        
        const material = new THREE.MeshPhongMaterial({
            vertexColors: true,
            side: THREE.DoubleSide,
            shininess: 150,
            flatShading: false,
            transparent: isDerivative,
            opacity: isDerivative ? 0.7 : 0.95,
            wireframe: this.showWireframe
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        if (isDerivative) {
            mesh.position.x = 10; // Offset derivative to the side
        }
        
        return mesh;
    }
    
    getColorForValue(value, isDerivative = false) {
        // Color gradient from blue (negative) -> green (zero) -> yellow -> red (positive)
        const color = new THREE.Color();
        
        let normalizedValue;
        if (isDerivative) {
            // For derivatives, typically 0 to 1 range
            normalizedValue = Math.max(0, Math.min(1, value));
            color.setHSL(0.6 - normalizedValue * 0.6, 1.0, 0.5);
        } else {
            // For activation functions
            if (value < -1) {
                color.setRGB(0, 0, 1); // Blue for very negative
            } else if (value < 0) {
                const t = (value + 1); // 0 to 1
                color.setRGB(0, t, 1); // Blue to cyan
            } else if (value < 1) {
                const t = value; // 0 to 1
                color.setRGB(t, 1, 1 - t); // Cyan to yellow
            } else {
                const t = Math.min((value - 1) / 2, 1); // Saturate at 3
                color.setRGB(1, 1 - t, 0); // Yellow to red
            }
        }
        
        return color;
    }
    
    updateSurface() {
        // Remove old surfaces
        if (this.surface) {
            this.scene.remove(this.surface);
            this.surface.geometry.dispose();
            this.surface.material.dispose();
        }
        
        if (this.derivativeSurface) {
            this.scene.remove(this.derivativeSurface);
            this.derivativeSurface.geometry.dispose();
            this.derivativeSurface.material.dispose();
        }
        
        // Remove old "all" surfaces
        if (this.allSurfaces) {
            this.allSurfaces.forEach(s => {
                this.scene.remove(s);
                s.geometry.dispose();
                s.material.dispose();
            });
            this.allSurfaces = [];
        }
        
        if (this.viewAll) {
            // Show all three functions side by side
            const functions = ['sigmoid', 'tanh', 'relu'];
            this.allSurfaces = [];
            
            functions.forEach((funcName, index) => {
                const activationFunc = this.getActivationFunction(funcName);
                const surface = this.createSurface(activationFunc);
                surface.position.x = (index - 1) * 12; // Spread them out
                this.scene.add(surface);
                this.allSurfaces.push(surface);
            });
        } else {
            // Create single surface
            const activationFunc = this.getActivationFunction(this.currentFunction);
            this.surface = this.createSurface(activationFunc);
            this.scene.add(this.surface);
            
            // Create derivative surface if enabled
            if (this.showDerivative) {
                const derivativeFunc = this.getDerivativeFunction(this.currentFunction);
                this.derivativeSurface = this.createSurface(derivativeFunc, true);
                this.scene.add(this.derivativeSurface);
            }
        }
        
        // Update info text
        this.updateInfo();
        
        // Update 2D plot
        this.draw2DPlot();
    }
    
    updateInfo() {
        const infoTexts = {
            'sigmoid': {
                title: '📈 Sigmoid Function',
                details: [
                    '📊 Range: 0 to 1',
                    '🎯 Gives probabilities',
                    '💡 Used for binary classification',
                    '⚠️ Can suffer from vanishing gradients'
                ]
            },
            'tanh': {
                title: '📉 Tanh (Hyperbolic Tangent)',
                details: [
                    '📊 Range: -1 to 1',
                    '🎯 More steeper than sigmoid',
                    '💡 Zero-centered output',
                    '✅ Better than sigmoid for hidden layers'
                ]
            },
            'relu': {
                title: '⚡ ReLU (Rectified Linear Unit)',
                details: [
                    '📊 Range: 0 to ∞',
                    '🎯 Less computationally expensive',
                    '💡 Most popular for hidden layers',
                    '🚀 Fast convergence'
                ]
            }
        };
        
        const info = infoTexts[this.currentFunction];
        let html = `<div class="info-title">${info.title}</div>`;
        info.details.forEach(detail => {
            html += `<div class="info-detail">${detail}</div>`;
        });
        
        document.getElementById('function-info').innerHTML = html;
    }
    
    setupControls() {
        // Function selector
        const functionSelect = document.getElementById('function-select');
        functionSelect.addEventListener('change', (e) => {
            this.currentFunction = e.target.value;
            this.updateSurface();
        });
        
        // Resolution slider
        const resolutionSlider = document.getElementById('resolution-slider');
        const resolutionValue = document.getElementById('resolution-value');
        resolutionSlider.addEventListener('input', (e) => {
            this.resolution = parseInt(e.target.value);
            resolutionValue.textContent = this.resolution;
            this.updateSurface();
        });
        
        // Speed slider
        const speedSlider = document.getElementById('speed-slider');
        const speedValue = document.getElementById('speed-value');
        speedSlider.addEventListener('input', (e) => {
            this.animationSpeed = parseFloat(e.target.value);
            speedValue.textContent = this.animationSpeed.toFixed(1);
        });
        
        // Show derivative checkbox
        const showDerivativeCheckbox = document.getElementById('show-derivative');
        showDerivativeCheckbox.addEventListener('change', (e) => {
            this.showDerivative = e.target.checked;
            this.updateSurface();
        });
        
        // Show wireframe checkbox
        const showWireframeCheckbox = document.getElementById('show-wireframe');
        showWireframeCheckbox.addEventListener('change', (e) => {
            this.showWireframe = e.target.checked;
            this.updateSurface();
        });
        
        // Show particles checkbox
        const showParticlesCheckbox = document.getElementById('show-particles');
        showParticlesCheckbox.addEventListener('change', (e) => {
            this.showParticles = e.target.checked;
            if (this.showParticles) {
                this.scene.add(this.particleSystem);
            } else {
                this.scene.remove(this.particleSystem);
            }
        });
        
        // Auto rotate checkbox
        const autoRotateCheckbox = document.getElementById('auto-rotate');
        autoRotateCheckbox.addEventListener('change', (e) => {
            this.autoRotate = e.target.checked;
        });
        
        // View all button
        const viewAllButton = document.getElementById('view-all');
        viewAllButton.addEventListener('click', () => {
            this.viewAll = !this.viewAll;
            viewAllButton.textContent = this.viewAll ? '🎯 Single View' : '🎯 View All Three';
            this.updateSurface();
            
            // Adjust camera for better view
            if (this.viewAll) {
                this.camera.position.set(20, 12, 20);
            } else {
                this.camera.position.set(12, 10, 12);
            }
        });
        
        // Comparison mode button
        const toggleComparisonButton = document.getElementById('toggle-comparison');
        toggleComparisonButton.addEventListener('click', () => {
            this.comparisonMode = !this.comparisonMode;
            const comparisonContainer = document.getElementById('comparison-container');
            
            if (this.comparisonMode) {
                comparisonContainer.style.display = 'flex';
                this.drawComparisonPlots();
            } else {
                comparisonContainer.style.display = 'none';
            }
        });
        
        // Reset camera button
        const resetButton = document.getElementById('reset-camera');
        resetButton.addEventListener('click', () => {
            if (this.viewAll) {
                this.camera.position.set(20, 12, 20);
            } else {
                this.camera.position.set(12, 10, 12);
            }
            this.camera.lookAt(0, 0, 0);
        });
    }
    
    drawComparisonPlots() {
        const functions = [
            { name: 'sigmoid', canvasId: 'sigmoid-canvas', func: (x) => this.sigmoid(x) },
            { name: 'tanh', canvasId: 'tanh-canvas', func: (x) => this.tanh(x) },
            { name: 'relu', canvasId: 'relu-canvas', func: (x) => this.relu(x) }
        ];
        
        functions.forEach(({ canvasId, func }) => {
            const canvas = document.getElementById(canvasId);
            const ctx = canvas.getContext('2d');
            
            canvas.width = 300;
            canvas.height = 180;
            
            const width = canvas.width;
            const height = canvas.height;
            
            // Clear
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, width, height);
            
            const padding = 30;
            const plotWidth = width - 2 * padding;
            const plotHeight = height - 2 * padding;
            
            const xMin = -6;
            const xMax = 6;
            const yMin = -1.5;
            const yMax = 4;
            
            // Axes
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 1;
            ctx.beginPath();
            
            const yZero = padding + plotHeight * (yMax / (yMax - yMin));
            ctx.moveTo(padding, yZero);
            ctx.lineTo(width - padding, yZero);
            
            const xZero = padding + plotWidth * (-xMin / (xMax - xMin));
            ctx.moveTo(xZero, padding);
            ctx.lineTo(xZero, height - padding);
            ctx.stroke();
            
            // Function
            ctx.strokeStyle = '#4fc3f7';
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            let firstPoint = true;
            for (let px = 0; px <= plotWidth; px += 1) {
                const x = xMin + (px / plotWidth) * (xMax - xMin);
                const y = func(x);
                const clampedY = Math.max(yMin, Math.min(yMax, y));
                
                const canvasX = padding + px;
                const canvasY = padding + plotHeight * ((yMax - clampedY) / (yMax - yMin));
                
                if (firstPoint) {
                    ctx.moveTo(canvasX, canvasY);
                    firstPoint = false;
                } else {
                    ctx.lineTo(canvasX, canvasY);
                }
            }
            ctx.stroke();
        });
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.time += 0.01 * this.animationSpeed;
        
        // Auto rotate
        if (this.autoRotate) {
            const rotationSpeed = 0.003 * this.animationSpeed;
            const radius = this.camera.position.length();
            const angle = Math.atan2(this.camera.position.z, this.camera.position.x) + rotationSpeed;
            this.camera.position.x = radius * Math.cos(angle);
            this.camera.position.z = radius * Math.sin(angle);
            this.camera.lookAt(0, 0, 0);
        }
        
        // Animate particles
        if (this.showParticles && this.particleSystem) {
            this.particleSystem.rotation.y += 0.001 * this.animationSpeed;
            const positions = this.particleSystem.geometry.attributes.position.array;
            
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += Math.sin(this.time + i) * 0.01;
            }
            
            this.particleSystem.geometry.attributes.position.needsUpdate = true;
        }
        
        // Animate surfaces with pulsing effect
        if (this.surface && !this.viewAll) {
            this.surface.rotation.y = Math.sin(this.time * 0.5) * 0.05;
        }
        
        if (this.allSurfaces) {
            this.allSurfaces.forEach((surface, index) => {
                surface.rotation.y = Math.sin(this.time * 0.5 + index * Math.PI / 3) * 0.05;
            });
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', () => {
    new ActivationFunctions3D();
});
