// Card transitions function
function nextCard(cardNumber) {
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.classList.remove('active-card');
    card.classList.add('hidden');
  });

  const targetCard = document.getElementById(`card-${cardNumber}`);
  if (targetCard) {
    targetCard.classList.remove('hidden');
    // Force reflow and add active transition
    setTimeout(() => {
      targetCard.classList.add('active-card');
    }, 30);
  }
}

// Background floating books spawner
const booksContainer = document.getElementById('books-container');

function createFloatingBook() {
  if (!booksContainer) return;

  const book = document.createElement('div');
  book.classList.add('floating-book');
  
  // SVG markup for beautiful open book path matching custom theme
  book.innerHTML = `
    <svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full">
      <path d="M12 6c-3.18-2.07-7.46-2.58-10-2.58v13.5c2.54 0 6.82.51 10 2.58 3.18-2.07 7.46-2.58 10-2.58V3.42c-2.54 0-6.82.51-10 2.58zm9 11c-2.27 0-6.15.54-8 1.39V7.07c1.85-.85 5.73-1.39 8-1.39v11.32zM3 17V5.68c2.27 0 6.15.54 8 1.39v10.93c-1.85-.85-5.73-1.39-8-1.39z"/>
    </svg>
  `;

  // Random positions, rotation, sizes, and speed
  const leftPosition = Math.random() * 100; // 0% to 100% of viewport width
  const size = Math.random() * 24 + 12;      // 12px to 36px
  const drift = (Math.random() - 0.5) * 150; // horizontal drift direction
  const rotation = (Math.random() - 0.5) * 360; // rotation amount
  const duration = Math.random() * 5 + 5;     // 5s to 10s animation duration

  book.style.left = `${leftPosition}%`;
  book.style.width = `${size}px`;
  book.style.height = `${size}px`;

  // Inject custom CSS variables to feed keyframe calculations in style.css
  book.style.setProperty('--random-x', `${drift}px`);
  book.style.setProperty('--random-rot', `${rotation}deg`);
  book.style.setProperty('--random-scale', `${Math.random() * 0.7 + 0.6}`);
  
  book.style.animationDuration = `${duration}s`;

  booksContainer.appendChild(book);

  // Safely cleanup book element from DOM after it floats out of view
  setTimeout(() => {
    book.remove();
  }, duration * 1000);
}

// Periodically spawn floating books in background
setInterval(createFloatingBook, 500);

// Runaway "No" button logic
const noBtn = document.getElementById('no-btn');
const cardWrapper = document.getElementById('card-wrapper');

const noTexts = [
  "No",
  "Are you sure? 🥺",
  "Think again! 🏖️",
  "But the beach is waiting!",
  "Pretty please? ❤️",
  "Wrong button! 😂",
  "Try the other one!",
  "Still stubborn? 😉",
  "Nice try!",
  "Himi, pleaseee!"
];
let noCount = 0;

function moveNoButton() {
  if (!noBtn || !cardWrapper) return;

  // Change to absolute positioning if not done yet
  if (noBtn.style.position !== 'absolute') {
    noBtn.style.position = 'absolute';
    // Style adjustments to look correct when absolutely positioned
    noBtn.style.zIndex = '50';
    noBtn.style.transition = 'top 0.15s ease-out, left 0.15s ease-out';
  }

  const wrapperRect = cardWrapper.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();

  // Bounding calculations inside the card wrapper
  const padding = 24;
  const maxX = wrapperRect.width - btnRect.width - padding;
  const maxY = wrapperRect.height - btnRect.height - padding;

  // Make sure it moves to a completely different spot
  const randomX = Math.max(padding, Math.floor(Math.random() * maxX));
  const randomY = Math.max(padding, Math.floor(Math.random() * maxY));

  noBtn.style.left = `${randomX}px`;
  noBtn.style.top = `${randomY}px`;

  // Dynamically update text to show a cute persuading response
  noBtn.innerText = noTexts[noCount % noTexts.length];
  noCount++;
}

if (noBtn) {
  noBtn.addEventListener('mouseenter', moveNoButton);
  noBtn.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevents triggers twice and handles touchscreen taps gracefully
    moveNoButton();
  });
}

// Confetti celebration function
function celebrate() {
  nextCard(5);

  // Primary colorful burst featuring custom colors
  confetti({
    particleCount: 160,
    spread: 90,
    origin: { y: 0.55 },
    colors: ['#243B8F', '#FFF0C9', '#E74C3C', '#F39C12']
  });

  // Shoot side bursts for 5 seconds
  const duration = 5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    // double confetti cannons!
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
  }, 250);
}
