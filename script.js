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

let names = ['Prize 1', 'Prize 2', 'Prize 3', 'Prize 4', 'Prize 5', 'Prize 6'];
let colors = ['#FFC300', '#FF5733', '#C70039', '#900C3F', '#581845', '#1B4F72'];
let rotation = 0;
let spinSpeed = 0;
let isSpinning = false;
let winningSegment;
let spinCount = 0;
const results = {};

function setupCanvas() {
    const container = canvas.parentElement;
    // Get the displayed size of the canvas from CSS
    const displayWidth = container.clientWidth; // Or canvas.clientWidth
    const displayHeight = container.clientHeight; // Or canvas.clientHeight

    // Check if the canvas size needs to be updated
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        // Set the internal drawing buffer size to match the displayed size
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        drawWheel(); // Redraw the wheel with the new dimensions
    }
}

function drawWheel() {
    setupCanvas(); // Ensure canvas is set to the correct size before drawing

    const numSegments = names.length;
    const anglePerSegment = 2 * Math.PI / numSegments;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10; // Subtract a small margin

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
        // Adjust font size based on canvas size
        const fontSize = Math.max(12, canvas.width / 25); // Minimum 12px
        ctx.font = `${fontSize}px Arial`;
        ctx.fillText(names[i], radius - 15, 5); // Adjust text position
        ctx.restore();
    }
    // Draw pointer
    ctx.restore(); // Restore to original canvas coordinate system
    ctx.beginPath();
    ctx.moveTo(centerX, 10);
    ctx.lineTo(centerX - 15, 40);
    ctx.lineTo(centerX + 15, 40);
    ctx.closePath();
    ctx.fillStyle = '#333'; // Pointer color
    ctx.fill();
    ctx.stroke();
}


function spin() {
    if (isSpinning) return;
    isSpinning = true;
    spinCount++;
    // Add more randomness to the spin
    spinSpeed = Math.random() * 0.4 + 0.2; // Increased range
    rotation = Math.random() * 2 * Math.PI; // Start at a random angle
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
        // The pointer is at the top (3*PI/2), so we calculate the segment under it
        const currentAngle = ( (3 * Math.PI / 2) - rotation + 2 * Math.PI) % (2 * Math.PI);
        winningSegment = Math.floor(currentAngle / anglePerSegment);
        
        setTimeout(() => {
            const winner = names[winningSegment];
            showWinner(winner);
            updateResults(winner);
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
    // Update history
    const newRow = historyTableBody.insertRow();
    const spinCell = newRow.insertCell(0);
    const winnerCell = newRow.insertCell(1);
    spinCell.textContent = spinCount;
    winnerCell.textContent = winner;

    // Update summary
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
        // Generate more colors if needed
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
        // Also remove the corresponding color to maintain consistency
        colors.splice(winningSegment % colors.length, 1);
        drawWheel();
    }
    hideWinner();
});
keepBtn.addEventListener('click', hideWinner);

// Initial setup and redraw on resize
window.addEventListener('resize', () => {
    drawWheel();
});

// Initial draw
drawWheel();
