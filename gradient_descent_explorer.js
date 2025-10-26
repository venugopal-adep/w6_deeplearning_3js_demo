// Gradient Descent Explorer
// Developed by: Venugopal Adep

// Global variable to track animation state
let animationInProgress = false;

// Quiz questions
const quizQuestions = [
    {
        question: "What is the minimum point of the function f(x) = x²?",
        options: [
            "x = 1",
            "x = -1",
            "x = 0",
            "x = 2"
        ],
        correct: 2,
        explanation: "The minimum point of f(x) = x² is at x = 0. This is where the parabola reaches its lowest point, touching the x-axis."
    },
    {
        question: "What happens if we use a very large learning rate in this example?",
        options: [
            "The algorithm will converge faster",
            "The algorithm may overshoot and fail to converge",
            "The function will change",
            "Nothing will change"
        ],
        correct: 1,
        explanation: "With a very large learning rate, the algorithm might overshoot the minimum point, potentially bouncing back and forth or even diverging away from the minimum."
    },
    {
        question: "Why do we use the negative of the gradient in the update rule?",
        options: [
            "To make the calculations easier",
            "To move towards the maximum of the function",
            "To move towards the minimum of the function",
            "It's just a convention"
        ],
        correct: 2,
        explanation: "We use the negative of the gradient because we want to move towards the minimum of the function. The gradient points in the direction of steepest increase, so we move in the opposite direction to decrease."
    },
    {
        question: "What would happen if we started gradient descent at x = 0 for this function?",
        options: [
            "It would immediately find the minimum",
            "It would move away from the minimum",
            "It would stay at x = 0",
            "It would throw an error"
        ],
        correct: 2,
        explanation: "If we start at x = 0, which is already the minimum of f(x) = x², the gradient would be zero (f'(0) = 2*0 = 0). Therefore, the algorithm would stay at x = 0, as there's no direction to move."
    }
];

// Mathematical functions
function f(x) {
    return x * x;
}

function fPrime(x) {
    return 2 * x;
}

// Gradient descent algorithm
function gradientDescent(xInit, learningRate, numIterations) {
    let x = xInit;
    const history = [{
        iteration: 0,
        x: x,
        gradient: fPrime(x),
        fx: f(x)
    }];

    for (let i = 1; i <= numIterations; i++) {
        x = x - learningRate * fPrime(x);
        history.push({
            iteration: i,
            x: x,
            gradient: fPrime(x),
            fx: f(x)
        });
    }

    return history;
}

// Plot the gradient descent with animation
async function plotGradientDescentAnimated(history) {
    // Generate function curve
    const xRange = [];
    const yRange = [];
    for (let x = -10; x <= 10; x += 0.1) {
        xRange.push(x);
        yRange.push(f(x));
    }

    // Create function trace
    const functionTrace = {
        x: xRange,
        y: yRange,
        mode: 'lines',
        name: 'f(x) = x²',
        line: {
            color: '#3498db',
            width: 3
        }
    };

    const layout = {
        title: {
            text: 'Gradient Descent on f(x) = x² (Animating...)',
            font: {
                size: 20,
                color: '#2c3e50'
            }
        },
        xaxis: {
            title: 'x',
            gridcolor: '#ecf0f1',
            zeroline: true,
            zerolinecolor: '#95a5a6'
        },
        yaxis: {
            title: 'f(x)',
            gridcolor: '#ecf0f1',
            zeroline: true,
            zerolinecolor: '#95a5a6'
        },
        showlegend: true,
        legend: {
            x: 0.7,
            y: 0.95
        },
        hovermode: 'closest',
        plot_bgcolor: '#ffffff',
        paper_bgcolor: 'transparent',
        annotations: []
    };

    const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false
    };

    // Initialize plot with just the function
    Plotly.newPlot('plotDiv', [functionTrace], layout, config);

    // Animate points one by one
    const xHistory = [];
    const yHistory = [];

    for (let i = 0; i < history.length; i++) {
        xHistory.push(history[i].x);
        yHistory.push(history[i].fx);

        // Create path trace with current points
        const pathTrace = {
            x: xHistory.slice(),
            y: yHistory.slice(),
            mode: 'markers+lines',
            name: 'Gradient Descent Path',
            marker: {
                color: '#e74c3c',
                size: 10,
                symbol: 'circle',
                line: {
                    color: '#c0392b',
                    width: 2
                }
            },
            line: {
                color: '#e74c3c',
                width: 2,
                dash: 'dot'
            }
        };

        // Update annotations
        const annotations = [];
        
        if (i === 0) {
            annotations.push({
                x: xHistory[0],
                y: yHistory[0],
                text: 'Start',
                showarrow: true,
                arrowhead: 2,
                ax: 0,
                ay: -40,
                font: {
                    size: 14,
                    color: '#e74c3c',
                    weight: 'bold'
                }
            });
        }

        // Show current iteration number
        annotations.push({
            x: xHistory[xHistory.length - 1],
            y: yHistory[yHistory.length - 1],
            text: `Iteration ${i}`,
            showarrow: true,
            arrowhead: 2,
            ax: 0,
            ay: i === history.length - 1 ? 40 : -40,
            font: {
                size: 14,
                color: i === history.length - 1 ? '#27ae60' : '#e74c3c',
                weight: 'bold'
            }
        });

        layout.annotations = annotations;
        
        // Update title
        if (i === history.length - 1) {
            layout.title.text = 'Gradient Descent on f(x) = x² (Complete)';
        } else {
            layout.title.text = `Gradient Descent on f(x) = x² (Step ${i + 1}/${history.length})`;
        }

        // Update plot
        Plotly.react('plotDiv', [functionTrace, pathTrace], layout, config);

        // Wait before next point
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    animationInProgress = false;
}

// Display gradient descent steps (non-animated version kept for reference)
function displaySteps(history) {
    const container = document.getElementById('stepsContainer');
    container.innerHTML = '<h3 style="margin-bottom: 15px; color: #2c3e50;"><i class="fas fa-list"></i> Gradient Descent Steps</h3>';
    
    history.forEach(step => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step-item';
        stepDiv.innerHTML = `
            <strong>Iteration ${step.iteration}:</strong> 
            x = ${step.x.toFixed(4)}, 
            f'(x) = ${step.gradient.toFixed(4)}, 
            f(x) = ${step.fx.toFixed(4)}
        `;
        container.appendChild(stepDiv);
    });
}

// Animated display of steps synchronized with plot
async function displayStepsAnimated(history) {
    const container = document.getElementById('stepsContainer');
    container.innerHTML = '<h3 style="margin-bottom: 15px; color: #2c3e50;"><i class="fas fa-list"></i> Gradient Descent Steps</h3>';
    
    for (let i = 0; i < history.length; i++) {
        const step = history[i];
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step-item';
        stepDiv.id = `step-${i}`;
        stepDiv.style.opacity = '0';
        stepDiv.style.transform = 'translateX(-20px)';
        stepDiv.style.transition = 'all 0.3s ease';
        
        // More detailed step information
        stepDiv.innerHTML = `
            <div style="font-weight: bold; color: #667eea; margin-bottom: 5px;">
                Iteration ${step.iteration}
            </div>
            <div style="margin-left: 10px;">
                <div>x = ${step.x.toFixed(6)}</div>
                <div>f'(x) = ${step.gradient.toFixed(6)}</div>
                <div>f(x) = ${step.fx.toFixed(6)}</div>
                ${step.iteration > 0 ? `<div style="color: #27ae60; margin-top: 5px;">
                    Δx = ${(history[i].x - history[i-1].x).toFixed(6)}
                </div>` : ''}
            </div>
        `;
        container.appendChild(stepDiv);
        
        // Animate in
        setTimeout(() => {
            stepDiv.style.opacity = '1';
            stepDiv.style.transform = 'translateX(0)';
        }, 50);
        
        // Highlight current step
        stepDiv.classList.add('active');
        
        // Remove highlight from previous step
        if (i > 0) {
            document.getElementById(`step-${i-1}`)?.classList.remove('active');
        }
        
        // Scroll to current step
        stepDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Wait before next step
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Keep last step highlighted
    document.getElementById(`step-${history.length - 1}`)?.classList.add('active');
}

// Run gradient descent
async function runGradientDescent() {
    if (animationInProgress) {
        alert('Animation already in progress. Please wait...');
        return;
    }
    
    const xInit = parseFloat(document.getElementById('xInit').value);
    const learningRate = parseFloat(document.getElementById('learningRate').value);
    const iterations = parseInt(document.getElementById('iterations').value);

    // Validate inputs
    if (isNaN(xInit) || isNaN(learningRate) || isNaN(iterations)) {
        alert('Please enter valid numbers for all parameters.');
        return;
    }

    if (learningRate <= 0 || learningRate > 1) {
        alert('Learning rate should be between 0 and 1.');
        return;
    }

    if (iterations < 1 || iterations > 100) {
        alert('Number of iterations should be between 1 and 100.');
        return;
    }

    animationInProgress = true;
    
    // Run gradient descent
    const history = gradientDescent(xInit, learningRate, iterations);

    // Switch to visualization tab
    switchTab('visualization');
    
    // Run plot and steps animation simultaneously
    await Promise.all([
        plotGradientDescentAnimated(history),
        displayStepsAnimated(history)
    ]);
    
    animationInProgress = false;
}

// Tab switching
function switchTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => button.classList.remove('active'));

    // Show selected tab
    document.getElementById(tabName).classList.add('active');

    // Activate corresponding button
    const buttonIndex = tabName === 'visualization' ? 0 : (tabName === 'learning' ? 1 : 2);
    buttons[buttonIndex].classList.add('active');

    // Initialize quiz if quiz tab is selected
    if (tabName === 'quiz' && !document.getElementById('quizContainer').hasChildNodes()) {
        initializeQuiz();
    }
}

// Initialize quiz
let userAnswers = [];
let quizChecked = [];

function initializeQuiz() {
    const container = document.getElementById('quizContainer');
    container.innerHTML = '';
    userAnswers = new Array(quizQuestions.length).fill(null);
    quizChecked = new Array(quizQuestions.length).fill(false);

    quizQuestions.forEach((q, qIndex) => {
        const questionCard = document.createElement('div');
        questionCard.className = 'question-card';
        questionCard.id = `question-${qIndex}`;

        let html = `
            <div class="question-text">
                <strong>Question ${qIndex + 1}:</strong> ${q.question}
            </div>
        `;

        q.options.forEach((option, oIndex) => {
            html += `
                <div class="option" onclick="selectOption(${qIndex}, ${oIndex})">
                    <input type="radio" name="q${qIndex}" id="q${qIndex}_o${oIndex}" style="margin-right: 10px;">
                    <label for="q${qIndex}_o${oIndex}" style="cursor: pointer;">${option}</label>
                </div>
            `;
        });

        html += `
            <button class="check-button" onclick="checkAnswer(${qIndex})">
                <i class="fas fa-check"></i> Check Answer
            </button>
            <div class="explanation" id="explanation-${qIndex}">
                <strong><i class="fas fa-info-circle"></i> Explanation:</strong><br>
                ${q.explanation}
            </div>
        `;

        questionCard.innerHTML = html;
        container.appendChild(questionCard);
    });
}

// Select option
function selectOption(qIndex, oIndex) {
    userAnswers[qIndex] = oIndex;
    
    // Update visual selection
    const questionCard = document.getElementById(`question-${qIndex}`);
    const options = questionCard.querySelectorAll('.option');
    options.forEach((opt, i) => {
        if (i === oIndex) {
            opt.classList.add('selected');
            opt.querySelector('input').checked = true;
        } else {
            opt.classList.remove('selected');
            opt.querySelector('input').checked = false;
        }
    });
}

// Check answer
function checkAnswer(qIndex) {
    if (userAnswers[qIndex] === null) {
        alert('Please select an answer first.');
        return;
    }

    quizChecked[qIndex] = true;

    const questionCard = document.getElementById(`question-${qIndex}`);
    const options = questionCard.querySelectorAll('.option');
    const explanation = document.getElementById(`explanation-${qIndex}`);

    const correct = quizQuestions[qIndex].correct;
    const userAnswer = userAnswers[qIndex];

    // Mark correct and incorrect answers
    options.forEach((opt, i) => {
        opt.style.pointerEvents = 'none';
        if (i === correct) {
            opt.classList.add('correct');
        } else if (i === userAnswer && i !== correct) {
            opt.classList.add('incorrect');
        }
    });

    // Show explanation
    explanation.classList.add('show');

    // Scroll to explanation
    explanation.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Show final score
function showFinalScore() {
    const scoreDisplay = document.getElementById('scoreDisplay');
    
    // Calculate score
    let score = 0;
    quizChecked.forEach((checked, i) => {
        if (checked && userAnswers[i] === quizQuestions[i].correct) {
            score++;
        }
    });

    const totalQuestions = quizQuestions.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    let message = '';
    let icon = '';
    let color = '';

    if (score === totalQuestions) {
        message = "Congratulations! You're a gradient descent expert! 🏆";
        icon = '<i class="fas fa-trophy" style="font-size: 3em; margin-bottom: 20px;"></i>';
        color = '#27ae60';
    } else if (score >= totalQuestions / 2) {
        message = "Good job! You're on your way to mastering gradient descent. Keep learning! 📚";
        icon = '<i class="fas fa-star" style="font-size: 3em; margin-bottom: 20px;"></i>';
        color = '#3498db';
    } else {
        message = "You're making progress! Review the explanations and try again to improve your score. 💪";
        icon = '<i class="fas fa-redo" style="font-size: 3em; margin-bottom: 20px;"></i>';
        color = '#f39c12';
    }

    scoreDisplay.innerHTML = `
        <div class="score-display" style="background: ${color};">
            ${icon}
            <div style="font-size: 2em; margin: 10px 0;">Your Score: ${score}/${totalQuestions}</div>
            <div style="font-size: 1.2em; margin: 10px 0;">${percentage}%</div>
            <div style="font-size: 1em; margin-top: 15px; font-weight: normal;">${message}</div>
        </div>
    `;

    scoreDisplay.scrollIntoView({ behavior: 'smooth' });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    // Create initial plot with default parameters
    const defaultHistory = gradientDescent(10, 0.1, 10);
    plotGradientDescent(defaultHistory);
    displaySteps(defaultHistory);

    // Add enter key support for inputs
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                runGradientDescent();
            }
        });
    });

    console.log('%c Gradient Descent Explorer Loaded! ', 'background: #667eea; color: white; font-size: 16px; padding: 10px;');
    console.log('%c Press Enter after changing values to run gradient descent ', 'background: #2c3e50; color: white; font-size: 12px; padding: 5px;');
});
