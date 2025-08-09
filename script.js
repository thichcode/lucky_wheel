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

let names = ['Prize 1', 'Prize 2', 'Prize 3', 'Prize 4', 'Prize 5', 'Prize 6'];
let colors = ['#FFC300', '#FF5733', '#C70039', '#900C3F', '#581845', '#1B4F72'];
let rotation = 0;
let spinSpeed = 0;
let isSpinning = false;
let winningSegment;

function drawWheel() {
    const numSegments = names.length;
    const anglePerSegment = 2 * Math.PI / numSegments;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rotation);

    for (let i = 0; i < numSegments; i++) {
        const angle = i * anglePerSegment;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, canvas.width / 2, angle, angle + anglePerSegment);
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        ctx.stroke();

        ctx.save();
        ctx.rotate(angle + anglePerSegment / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.fillText(names[i], canvas.width / 2 - 20, 10);
        ctx.restore();
    }
    ctx.restore();
}

function spin() {
    if (isSpinning) return;
    isSpinning = true;
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
            showWinner(names[winningSegment]);
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

function updateWheel() {
    const newNames = nameInput.value.split('\n').filter(name => name.trim() !== '');
    if (newNames.length > 0) {
        names = newNames;
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

drawWheel();
