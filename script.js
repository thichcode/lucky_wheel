const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const nameInput = document.getElementById('nameInput');
const updateBtn = document.getElementById('updateBtn');
const winnerModal = document.getElementById('winnerModal');
const winnerText = document.getElementById('winnerText');
const removeBtn = document.getElementById('removeBtn');
const keepBtn = document.getElementById('keepBtn');
const wheelTitleInput = document.getElementById('wheelTitleInput');
const historyTableBody = document.querySelector('#historyTable tbody');
const summaryTableBody = document.querySelector('#summaryTable tbody');
const musicToggleBtn = document.getElementById('musicToggleBtn');

// Audio elements
const backgroundMusic = document.getElementById('backgroundMusic');
const spinSound = document.getElementById('spinSound');
const winSound = document.getElementById('winSound');

let names = ['Prize 1', 'Prize 2', 'Prize 3', 'Prize 4', 'Prize 5', 'Prize 6'];
let colors = ['#FFC300', '#FF5733', '#C70039', '#900C3F', '#581845', '#1B4F72'];
let rotation = 0;
let spinSpeed = 0;
let isSpinning = false;
let winningSegment;
let spinCount = 0;
const results = {};

// Function to start background music (requires user interaction first)
function startBackgroundMusic() {
    if (backgroundMusic.paused) {
        backgroundMusic.play().catch(error => {
            console.log("Autoplay prevented:", error);
            // You might want to add a "Start Music" button if autoplay fails
        });
    }
}

// Add a click event to the body or a specific button to start music on first user interaction
document.body.addEventListener('click', startBackgroundMusic, { once: true });

// Toggle background music
musicToggleBtn.addEventListener('click', () => {
    if (backgroundMusic.paused) {
        backgroundMusic.play().catch(error => console.log("Music play error:", error));
        musicToggleBtn.textContent = '🔇 Music';
    } else {
        backgroundMusic.pause();
        musicToggleBtn.textContent = '🔊 Music';
    }
});


function setupCanvas() {
    const container = canvas.parentElement;
    const displayWidth = container.clientWidth;
    const displayHeight = container.clientHeight;

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        drawWheel();
    }
}

function drawWheel() {
    setupCanvas();

    const numSegments = names.length;
    const anglePerSegment = 2 * Math.PI / numSegments;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);

    for (let i = 0; i < numSegments; i++) {
        const angle = i * anglePerSegment;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, angle, angle + anglePerSegment);
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        ctx.stroke();

        ctx.save();
        ctx.rotate(angle + anglePerSegment / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fff';
        const fontSize = Math.max(12, canvas.width / 25);
        ctx.font = `${fontSize}px Arial`;
        ctx.fillText(names[i], radius - 15, 5);
        ctx.restore();
    }
    ctx.restore();
    // Draw smaller, more refined pointer
    ctx.save();
    ctx.translate(centerX, 0); // Position at the top center
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-8, 20);
    ctx.lineTo(8, 20);
    ctx.closePath();
    ctx.fillStyle = '#333'; // Pointer color
    ctx.fill();
    ctx.strokeStyle = '#000'; // Add a border
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
}


function spin() {
    if (isSpinning) return;
    isSpinning = true;
    spinCount++;
    spinSound.currentTime = 0; // Reset sound to the beginning
    spinSound.play().catch(error => console.log("Spin sound play error:", error));
    spinSpeed = Math.random() * 0.4 + 0.2;
    rotation = Math.random() * 2 * Math.PI;
    animateSpin();
}

function animateSpin() {
    rotation += spinSpeed;
    spinSpeed *= 0.99; 

    drawWheel();

    if (spinSpeed > 0.001) {
        requestAnimationFrame(animateSpin);
    } else {
        isSpinning = false;
        rotation = rotation % (2 * Math.PI);
        const numSegments = names.length;
        const anglePerSegment = 2 * Math.PI / numSegments;
        const currentAngle = ( (3 * Math.PI / 2) - rotation + 2 * Math.PI) % (2 * Math.PI);
        winningSegment = Math.floor(currentAngle / anglePerSegment);
        
        setTimeout(() => {
            const winner = names[winningSegment];
            showWinner(winner);
            updateResults(winner);
            winSound.currentTime = 0; // Reset sound to the beginning
            winSound.play().catch(error => console.log("Win sound play error:", error));
        }, 100);
    }
}

function showWinner(winner) {
    winnerText.textContent = `Winner: ${winner}`;
    winnerModal.style.display = 'block';
}

function hideWinner() {
    winnerModal.style.display = 'none';
}

function updateResults(winner) {
    const newRow = historyTableBody.insertRow();
    const spinCell = newRow.insertCell(0);
    const winnerCell = newRow.insertCell(1);
    spinCell.textContent = spinCount;
    winnerCell.textContent = winner;

    results[winner] = (results[winner] || 0) + 1;
    renderSummary();
}

function renderSummary() {
    summaryTableBody.innerHTML = '';
    for (const winner in results) {
        const newRow = summaryTableBody.insertRow();
        const winnerCell = newRow.insertCell(0);
        const winsCell = newRow.insertCell(1);
        winnerCell.textContent = winner;
        winsCell.textContent = results[winner];
    }
}

function generateRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function updateWheel() {
    const newNames = nameInput.value.split('\n').filter(name => name.trim() !== '');
    if (newNames.length > 0) {
        names = newNames;
        while (colors.length < names.length) {
            colors.push(generateRandomColor());
        }
        drawWheel();
    }
}

spinBtn.addEventListener('click', spin);
updateBtn.addEventListener('click', updateWheel);
removeBtn.addEventListener('click', () => {
    if (names.length > 1) {
        names.splice(winningSegment, 1);
        colors.splice(winningSegment % colors.length, 1);
        drawWheel();
    }
    hideWinner();
});
keepBtn.addEventListener('click', hideWinner);

window.addEventListener('resize', () => {
    drawWheel();
});

drawWheel();
