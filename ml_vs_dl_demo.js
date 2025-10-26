// Machine Learning vs Deep Learning Interactive Demo
// Developed by: Venugopal Adep

class MLvsDLDemo {
    constructor() {
        this.datasetSlider = document.getElementById('datasetSlider');
        this.datasetSizeDisplay = document.getElementById('datasetSize');
        this.mlPerformance = document.getElementById('mlPerformance');
        this.dlPerformance = document.getElementById('dlPerformance');
        this.mlPercent = document.getElementById('mlPercent');
        this.dlPercent = document.getElementById('dlPercent');
        this.mlTime = document.getElementById('mlTime');
        this.dlTime = document.getElementById('dlTime');
        this.computeCost = document.getElementById('computeCost');
        this.computeCostLabel = document.getElementById('computeCostLabel');
        this.featureEngineering = document.getElementById('featureEngineering');
        this.featureLabel = document.getElementById('featureLabel');
        this.recommendation = document.getElementById('recommendation');
        this.recommendationLabel = document.getElementById('recommendationLabel');

        this.canvas = document.getElementById('performanceChart');
        this.ctx = this.canvas.getContext('2d');
        
        this.setupCanvas();
        this.setupEventListeners();
        this.updateVisualization(10000);
    }

    setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }

    drawPerformanceChart(currentDataSize) {
        const ctx = this.ctx;
        const width = this.canvas.width / (window.devicePixelRatio || 1);
        const height = this.canvas.height / (window.devicePixelRatio || 1);
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw grid
        ctx.strokeStyle = '#ecf0f1';
        ctx.lineWidth = 1;
        
        // Horizontal lines
        for (let i = 0; i <= 5; i++) {
            const y = (height - 40) * (i / 5) + 20;
            ctx.beginPath();
            ctx.moveTo(50, y);
            ctx.lineTo(width - 20, y);
            ctx.stroke();
            
            // Y-axis labels (performance %)
            ctx.fillStyle = '#7f8c8d';
            ctx.font = '12px Arial';
            ctx.textAlign = 'right';
            ctx.fillText((100 - i * 20) + '%', 45, y + 4);
        }
        
        // Draw ML curve
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        for (let x = 0; x <= width - 70; x += 5) {
            const dataSize = (x / (width - 70)) * 1000000;
            const mlPerf = this.calculateMLPerformance(dataSize);
            const y = height - 20 - ((mlPerf / 100) * (height - 40));
            
            if (x === 0) {
                ctx.moveTo(50 + x, y);
            } else {
                ctx.lineTo(50 + x, y);
            }
        }
        ctx.stroke();
        
        // Draw DL curve
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        for (let x = 0; x <= width - 70; x += 5) {
            const dataSize = (x / (width - 70)) * 1000000;
            const dlPerf = this.calculateDLPerformance(dataSize);
            const y = height - 20 - ((dlPerf / 100) * (height - 40));
            
            if (x === 0) {
                ctx.moveTo(50 + x, y);
            } else {
                ctx.lineTo(50 + x, y);
            }
        }
        ctx.stroke();
        
        // Draw current position marker
        const currentX = 50 + ((currentDataSize / 1000000) * (width - 70));
        const mlPerf = this.calculateMLPerformance(currentDataSize);
        const dlPerf = this.calculateDLPerformance(currentDataSize);
        const mlY = height - 20 - ((mlPerf / 100) * (height - 40));
        const dlY = height - 20 - ((dlPerf / 100) * (height - 40));
        
        // ML marker
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.arc(currentX, mlY, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // DL marker
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(currentX, dlY, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Current position line
        ctx.strokeStyle = '#95a5a6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(currentX, 20);
        ctx.lineTo(currentX, height - 20);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // X-axis labels
        ctx.fillStyle = '#7f8c8d';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        const labels = ['100', '10K', '100K', '500K', '1M'];
        const positions = [0, 0.25, 0.5, 0.75, 1];
        
        positions.forEach((pos, i) => {
            const x = 50 + pos * (width - 70);
            ctx.fillText(labels[i], x, height - 5);
        });
        
        // Axis titles
        ctx.save();
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('Performance', 0, 0);
        ctx.restore();
        
        ctx.textAlign = 'center';
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('Dataset Size', width / 2, height);
    }

    calculateMLPerformance(datasetSize) {
        let mlPerf;
        if (datasetSize < 1000) {
            mlPerf = 50 + (datasetSize / 1000) * 25;
        } else if (datasetSize < 10000) {
            mlPerf = 75 + ((datasetSize - 1000) / 9000) * 10;
        } else if (datasetSize < 50000) {
            mlPerf = 85 + ((datasetSize - 10000) / 40000) * 8;
        } else {
            mlPerf = 93 + ((datasetSize - 50000) / 950000) * 4;
        }
        return Math.min(97, mlPerf);
    }

    calculateDLPerformance(datasetSize) {
        let dlPerf;
        if (datasetSize < 1000) {
            dlPerf = 30 + (datasetSize / 1000) * 10;
        } else if (datasetSize < 10000) {
            dlPerf = 40 + ((datasetSize - 1000) / 9000) * 20;
        } else if (datasetSize < 100000) {
            dlPerf = 60 + ((datasetSize - 10000) / 90000) * 20;
        } else if (datasetSize < 500000) {
            dlPerf = 80 + ((datasetSize - 100000) / 400000) * 12;
        } else {
            dlPerf = 92 + ((datasetSize - 500000) / 500000) * 7;
        }
        return Math.min(99, dlPerf);
    }

    setupEventListeners() {
        this.datasetSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.updateVisualization(value);
        });

        window.addEventListener('resize', () => {
            this.setupCanvas();
            const currentValue = parseInt(this.datasetSlider.value);
            this.updateVisualization(currentValue);
        });
    }

    updateVisualization(datasetSize) {
        // Update display
        this.datasetSizeDisplay.textContent = this.formatNumber(datasetSize);

        // Calculate performances
        const mlPerf = this.calculateMLPerformance(datasetSize);
        const dlPerf = this.calculateDLPerformance(datasetSize);

        // Update progress bars
        this.mlPerformance.style.width = mlPerf + '%';
        this.dlPerformance.style.width = dlPerf + '%';
        this.mlPercent.textContent = mlPerf.toFixed(1) + '%';
        this.dlPercent.textContent = dlPerf.toFixed(1) + '%';

        // Update training time
        if (datasetSize < 10000) {
            this.mlTime.textContent = '⚡ Minutes';
            this.dlTime.textContent = '⏱️ Hours';
        } else if (datasetSize < 100000) {
            this.mlTime.textContent = '⚡ < 1 Hour';
            this.dlTime.textContent = '⏱️ Hours-Days';
        } else {
            this.mlTime.textContent = '⏱️ Few Hours';
            this.dlTime.textContent = '🕐 Days-Weeks';
        }

        // Update compute cost with emojis
        if (datasetSize < 10000) {
            this.computeCost.textContent = '💰';
            this.computeCostLabel.textContent = 'Low Cost';
            this.computeCost.style.color = '#27ae60';
        } else if (datasetSize < 100000) {
            this.computeCost.textContent = '💰💰';
            this.computeCostLabel.textContent = 'Medium Cost';
            this.computeCost.style.color = '#f39c12';
        } else {
            this.computeCost.textContent = '💰💰💰';
            this.computeCostLabel.textContent = 'High Cost';
            this.computeCost.style.color = '#e74c3c';
        }

        // Update feature engineering need
        if (datasetSize < 10000) {
            this.featureEngineering.textContent = '🛠️🛠️🛠️';
            this.featureLabel.textContent = 'Critical Manual Work';
            this.featureEngineering.style.color = '#e74c3c';
        } else if (datasetSize < 100000) {
            this.featureEngineering.textContent = '🛠️🛠️';
            this.featureLabel.textContent = 'Helpful Manual Work';
            this.featureEngineering.style.color = '#f39c12';
        } else {
            this.featureEngineering.textContent = '🛠️';
            this.featureLabel.textContent = 'Optional Manual Work';
            this.featureEngineering.style.color = '#27ae60';
        }

        // Update recommendation with emojis
        if (mlPerf > dlPerf) {
            this.recommendation.textContent = '🧠';
            this.recommendationLabel.textContent = 'Recommended: ML';
            this.recommendation.style.color = '#3498db';
        } else if (dlPerf > mlPerf + 5) {
            this.recommendation.textContent = '🤖';
            this.recommendationLabel.textContent = 'Recommended: DL';
            this.recommendation.style.color = '#e74c3c';
        } else {
            this.recommendation.textContent = '⚖️';
            this.recommendationLabel.textContent = 'Both Work Well';
            this.recommendation.style.color = '#f39c12';
        }

        // Draw the performance chart
        this.drawPerformanceChart(datasetSize);
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
}

// Workflow animation functions
let workflowAnimations = {
    ml: null,
    dl: null
};

function animateWorkflow(type) {
    // Clear any existing animation
    if (workflowAnimations[type]) {
        clearInterval(workflowAnimations[type]);
    }

    // Get all flow steps for the selected type
    const diagrams = document.querySelectorAll('.arch-diagram');
    const diagram = type === 'ml' ? diagrams[0] : diagrams[1];
    const steps = diagram.querySelectorAll('.flow-step');
    const arrows = diagram.querySelectorAll('.flow-arrow');

    // Reset all steps
    steps.forEach(step => {
        step.style.opacity = '0.3';
        step.style.transform = 'scale(0.95)';
    });
    arrows.forEach(arrow => {
        arrow.style.opacity = '0.3';
    });

    // Animate steps sequentially
    let currentStep = 0;
    workflowAnimations[type] = setInterval(() => {
        if (currentStep < steps.length) {
            // Highlight current step
            steps[currentStep].style.opacity = '1';
            steps[currentStep].style.transform = 'scale(1.05)';
            steps[currentStep].style.transition = 'all 0.5s ease';
            steps[currentStep].style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';

            // Highlight arrow after current step
            if (currentStep < arrows.length) {
                arrows[currentStep].style.opacity = '1';
                arrows[currentStep].style.transition = 'all 0.3s ease';
            }

            // Fade previous step slightly
            if (currentStep > 0) {
                steps[currentStep - 1].style.opacity = '0.7';
                steps[currentStep - 1].style.transform = 'scale(1)';
                steps[currentStep - 1].style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
            }

            currentStep++;
        } else {
            // Animation complete - highlight all
            steps.forEach(step => {
                step.style.opacity = '1';
                step.style.transform = 'scale(1)';
                step.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
            });
            arrows.forEach(arrow => {
                arrow.style.opacity = '1';
            });
            clearInterval(workflowAnimations[type]);
            workflowAnimations[type] = null;
        }
    }, 800);
}

function resetWorkflows() {
    // Clear all animations
    Object.keys(workflowAnimations).forEach(key => {
        if (workflowAnimations[key]) {
            clearInterval(workflowAnimations[key]);
            workflowAnimations[key] = null;
        }
    });

    // Reset all steps to full opacity
    const allSteps = document.querySelectorAll('.flow-step');
    const allArrows = document.querySelectorAll('.flow-arrow');
    
    allSteps.forEach(step => {
        step.style.opacity = '1';
        step.style.transform = 'scale(1)';
        step.style.transition = 'all 0.3s ease';
        step.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
    });

    allArrows.forEach(arrow => {
        arrow.style.opacity = '1';
        arrow.style.transition = 'all 0.3s ease';
    });
}

// Add hover effects to use case items
document.addEventListener('DOMContentLoaded', () => {
    const demo = new MLvsDLDemo();

    // Add click handlers to use case items
    const useCaseItems = document.querySelectorAll('.use-case-item');
    useCaseItems.forEach(item => {
        item.addEventListener('click', function() {
            // Create a pulse effect
            this.style.transform = 'scale(1.1)';
            setTimeout(() => {
                this.style.transform = 'translateX(5px)';
            }, 200);
        });
    });

    // Add smooth scroll for better UX
    const smoothScroll = (target) => {
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Press 1 for ML workflow
        if (e.key === '1') {
            animateWorkflow('ml');
        }
        // Press 2 for DL workflow
        if (e.key === '2') {
            animateWorkflow('dl');
        }
        // Press R for reset
        if (e.key === 'r' || e.key === 'R') {
            resetWorkflows();
        }
    });

    // Add info tooltips
    console.log('%c ML vs DL Demo Loaded! ', 'background: #667eea; color: white; font-size: 16px; padding: 10px;');
    console.log('%c Keyboard Shortcuts: ', 'background: #2c3e50; color: white; font-size: 14px; padding: 5px;');
    console.log('  1 - Animate ML Workflow');
    console.log('  2 - Animate DL Workflow');
    console.log('  R - Reset Animations');
});

// Add performance comparison animation on scroll
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeIn 0.6s ease forwards';
        }
    });
}, observerOptions);

// Observe all major sections
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.comparison-section, .interactive-demo, .comparison-table, .use-cases, .architecture-viz');
    sections.forEach(section => {
        observer.observe(section);
    });
});
