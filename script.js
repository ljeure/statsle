// Global variables to manage quiz state
let currentQuestionIndex = 0; // Tracks the current question
let questions = []; // Holds the quiz questions
let score = 0; // Tracks the user's score

// URL of the CSV data
const csvUrl = 'https://ourworldindata.org/grapher/life-expectancy.csv';

// Function to fetch and parse CSV data
async function fetchLifeExpectancyData() {
    try {
        const response = await fetch(csvUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        return parseCsv(csvText);
    } catch (error) {
        console.error('Error fetching life expectancy data:', error.message);
    }
}

// Simple CSV parser
function parseCsv(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    const data = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
            obj[header.trim()] = values[index]?.trim();
            return obj;
        }, {});
    });
    return data;
}

// Function to extract life expectancy for a specific entity and year
function getLifeExpectancy(data, entity, year) {
    const lifeExpectancyColumn = 'Period life expectancy at birth - Sex: total - Age: 0';
    const record = data.find(
        row => row.Entity === entity && parseInt(row.Year) === year
    );
    return record ? parseFloat(record[lifeExpectancyColumn]) : null;
}

// Generate quiz questions
async function generateQuiz() {
    const data = await fetchLifeExpectancyData();
    const year = 2023; // Year of interest
    const entities = ['World', 'United States', 'China', 'Africa', 'Europe'];

    // Create 5 questions
    questions = entities.map((entity) => {
        const value = getLifeExpectancy(data, entity, year);
        return {
            question: `What is the life expectancy in ${entity} in ${year}?`,
            correctAnswer: value,
        };
    });

    // Start the quiz
    loadQuestion();
}

// Load a question onto the page
function loadQuestion() {
    const questionElement = document.getElementById('question');
    const slider = document.getElementById('answer-slider');
    const sliderValueElement = document.getElementById('slider-value');
    const feedbackElement = document.getElementById('feedback');

    // Clear previous feedback
    feedbackElement.style.display = 'none';

    // Get the current question
    const currentQuestion = questions[currentQuestionIndex];

    // Update the question text
    questionElement.innerText = currentQuestion.question;

    // Reset the slider and value display
    slider.value = 50;
    sliderValueElement.innerText = slider.value;

    // Update slider value display on input
    slider.oninput = () => {
        sliderValueElement.innerText = slider.value;
    };
}

// Validate the user's answer
function submitAnswer() {
    const slider = document.getElementById('answer-slider');
    const feedbackElement = document.getElementById('feedback');

    const userAnswer = parseFloat(slider.value);
    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswer = currentQuestion.correctAnswer;

    // Check if the answer is within an acceptable range (e.g., ±2 years)
    const range = 2; // Acceptable range of error
    if (Math.abs(userAnswer - correctAnswer) <= range) {
        score++;
        feedbackElement.innerText = `Correct! The actual answer is ${correctAnswer}.`;
        feedbackElement.style.color = 'green';
    } else {
        feedbackElement.innerText = `Wrong! The correct answer is ${correctAnswer}. You guessed ${userAnswer}.`;
        feedbackElement.style.color = 'red';
    }

    feedbackElement.style.display = 'block';

    // Move to the next question after a short delay
    setTimeout(nextQuestion, 2000);
}

// Load the next question or finish the quiz
function nextQuestion() {
    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        endQuiz();
    }
}

// End the quiz
function endQuiz() {
    const questionElement = document.getElementById('question');
    const sliderContainer = document.getElementById('slider-container');
    const feedbackElement = document.getElementById('feedback');

    // Display final score
    questionElement.innerText = `Quiz complete! Your score: ${score}/${questions.length}`;
    sliderContainer.style.display = 'none';
    feedbackElement.style.display = 'none';
}

// Start the quiz on page load
window.onload = generateQuiz;
