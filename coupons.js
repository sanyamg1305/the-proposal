// ==============================================================================
// Himi's Digital Scratch-Off Coupons - JavaScript & Canvas Physics
// ==============================================================================

let coupons = [];
let activeFilter = 'all';
let realtimeChannel = null;

// Background floating books spawner
const booksContainer = document.getElementById('books-container');

function createFloatingBook() {
    if (!booksContainer) return;

    const book = document.createElement('div');
    book.classList.add('floating-book');

    book.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full">
            <path d="M12 6c-3.18-2.07-7.46-2.58-10-2.58v13.5c2.54 0 6.82.51 10 2.58 3.18-2.07 7.46-2.58 10-2.58V3.42c-2.54 0-6.82.51-10 2.58zm9 11c-2.27 0-6.15.54-8 1.39V7.07c1.85-.85 5.73-1.39 8-1.39v11.32zM3 17V5.68c2.27 0 6.15.54 8 1.39v10.93c-1.85-.85-5.73-1.39-8-1.39z"/>
        </svg>
    `;

    const leftPosition = Math.random() * 100;
    const size = Math.random() * 24 + 12;
    const drift = (Math.random() - 0.5) * 150;
    const rotation = (Math.random() - 0.5) * 360;
    const duration = Math.random() * 5 + 5;

    book.style.left = `${leftPosition}%`;
    book.style.width = `${size}px`;
    book.style.height = `${size}px`;

    book.style.setProperty('--random-x', `${drift}px`);
    book.style.setProperty('--random-rot', `${rotation}deg`);
    book.style.setProperty('--random-scale', `${Math.random() * 0.7 + 0.6}`);
    book.style.animationDuration = `${duration}s`;

    booksContainer.appendChild(book);

    setTimeout(() => {
        book.remove();
    }, duration * 1000);
}

setInterval(createFloatingBook, 600);

// Default starter coupons
const STARTER_COUPONS = [
    {
        id: '1',
        title: 'One spontaneous sunset beach run with ice cream',
        description: 'Redeemable for one immediate sunset escape to the beach with your favorite ice cream in hand! 🍦🌅',
        icon: '🍦',
        is_scratched: false,
        is_redeemed: false,
        redeemed_at: null
    },
    {
        id: '2',
        title: 'Free pass to skip 1 health lecture from Sanyam',
        description: 'Total peace & quiet pass: zero comments or lectures about medicines, glasses, or coffee for the whole day! 😂',
        icon: '🤐',
        is_scratched: false,
        is_redeemed: false,
        redeemed_at: null
    },
    {
        id: '3',
        title: 'Sanyam cooks whatever you want from scratch',
        description: 'Chef Sanyam is at your command! Pick whatever meal or dessert your heart desires, cooked completely from scratch 🍳',
        icon: '🍳',
        is_scratched: false,
        is_redeemed: false,
        redeemed_at: null
    },
    {
        id: '4',
        title: 'Bookstore date: Sanyam buys you any book you pick',
        description: 'A cozy bookstore afternoon where Sanyam buys any book that catches your eye, no questions asked 📚',
        icon: '📚',
        is_scratched: false,
        is_redeemed: false,
        redeemed_at: null
    },
    {
        id: '5',
        title: 'Late night drive with your playlist on blast',
        description: 'Windows down, beach breeze, city lights, and your songs playing as loud as you want 🚗💨',
        icon: '🚗',
        is_scratched: false,
        is_redeemed: false,
        redeemed_at: null
    }
];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initCouponsApp();
});

async function initCouponsApp() {
    // Check localStorage fallback first
    const stored = loadLocalCoupons();
    if (stored && stored.length > 0) {
        coupons = stored;
    } else {
        coupons = [...STARTER_COUPONS];
    }
    renderCoupons();

    try {
        const client = await getSupabaseClient();
        if (client) {
            await fetchCoupons(client);
            setupCouponsRealtime(client);
        }
    } catch (e) {
        console.warn('Supabase coupons init error:', e);
    }
}

// Fetch from Supabase
async function fetchCoupons(client) {
    try {
        const { data, error } = await client
            .from('date_coupons')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching coupons:', error);
        } else if (data && data.length > 0) {
            coupons = data;
            saveLocalCoupons(coupons);
        } else if (data && data.length === 0) {
            await seedCoupons(client);
            return;
        }
    } catch (err) {
        console.error('Coupons fetch exception:', err);
    } finally {
        renderCoupons();
    }
}

// Seed starter coupons into Supabase
async function seedCoupons(client) {
    try {
        const toInsert = STARTER_COUPONS.map(({ title, description, icon, is_scratched, is_redeemed }) => ({
            title,
            description,
            icon,
            is_scratched: false,
            is_redeemed: false
        }));

        const { data, error } = await client
            .from('date_coupons')
            .insert(toInsert)
            .select();

        if (!error && data) {
            coupons = data;
            saveLocalCoupons(coupons);
        }
    } catch (e) {
        console.error('Coupons seed exception:', e);
    }
    renderCoupons();
}

// Realtime Subscription
function setupCouponsRealtime(client) {
    if (realtimeChannel) {
        client.removeChannel(realtimeChannel);
    }

    try {
        realtimeChannel = client
            .channel('date-coupons-live')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'date_coupons' }, () => {
                fetchCoupons(client);
            })
            .subscribe();
    } catch (e) {
        console.warn('Coupons realtime error:', e);
    }
}

// Render Coupons Grid
function renderCoupons() {
    const grid = document.getElementById('coupons-grid');
    if (!grid) return;

    updateCouponStats();

    // Filter coupons
    const filtered = coupons.filter(c => {
        if (activeFilter === 'unscratched') return !c.is_scratched;
        if (activeFilter === 'active') return c.is_scratched && !c.is_redeemed;
        if (activeFilter === 'redeemed') return c.is_redeemed;
        return true; // 'all'
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12 space-y-2">
                <span class="text-4xl">🎫</span>
                <p class="font-bold text-base">No coupons found in this category.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(coupon => {
        const isScratched = !!coupon.is_scratched;
        const isRedeemed = !!coupon.is_redeemed;
        const formattedDate = coupon.redeemed_at ? new Date(coupon.redeemed_at).toLocaleDateString() : '';

        return `
            <div id="card-container-${coupon.id}" class="relative bg-white border-3 border-customAccent rounded-2xl p-5 md:p-6 shadow-[5px_5px_0px_0px_#243B8F] overflow-hidden flex flex-col justify-between min-h-[260px] transition-all">
                
                <!-- Underlying Secret Layer -->
                <div class="space-y-3 z-10 flex-grow">
                    <div class="flex items-center justify-between">
                        <span class="text-3xl">${coupon.icon || '🎫'}</span>
                        <span class="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-customAccent bg-customBg">
                            Love Pass ✨
                        </span>
                    </div>
                    <h3 class="font-bold text-lg md:text-xl text-customAccent leading-tight">
                        ${escapeHtml(coupon.title)}
                    </h3>
                    <p class="text-xs md:text-sm font-semibold opacity-85 leading-relaxed">
                        ${escapeHtml(coupon.description)}
                    </p>
                </div>

                <!-- Bottom Action Area -->
                <div class="pt-4 z-10 flex items-center justify-between border-t-2 border-customAccent/20 mt-3">
                    <span class="text-xs font-bold opacity-60">Never expires ❤️</span>
                    
                    <div class="flex items-center gap-2">
                        ${!isRedeemed && isScratched ? `
                            <button onclick="redeemCoupon('${coupon.id}')" class="bg-customAccent text-customBg px-3.5 py-1.5 rounded-full font-bold text-xs md:text-sm hover:scale-105 active:scale-95 transition-all shadow-[2px_2px_0px_0px_#FFF0C9]">
                                Redeem 🎁
                            </button>
                        ` : ''}

                        ${isRedeemed ? `
                            <button onclick="shareOnWhatsApp('${coupon.id}')" class="bg-emerald-600 text-white px-3 py-1.5 rounded-full font-bold text-xs hover:bg-emerald-700 transition-all flex items-center gap-1 shadow-[1px_1px_0px_0px_#243B8F]">
                                <span>💬</span> Text Sanyam
                            </button>
                        ` : ''}
                    </div>
                </div>

                <!-- Redeemed Ink Stamp Overlay -->
                ${isRedeemed ? `
                    <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                        <div class="border-4 border-red-600 text-red-600 font-extrabold text-2xl md:text-3xl px-6 py-2 rounded-xl transform -rotate-12 uppercase tracking-widest bg-white/70 backdrop-blur-[1px] shadow-lg animate-pulse">
                            REDEEMED ✓
                            ${formattedDate ? `<div class="text-[10px] text-center font-bold tracking-normal opacity-90">${formattedDate}</div>` : ''}
                        </div>
                    </div>
                ` : ''}

                <!-- Scratch-Off Foil Canvas (Only if not yet scratched) -->
                ${!isScratched ? `
                    <canvas id="scratch-canvas-${coupon.id}" class="absolute inset-0 w-full h-full cursor-crosshair z-30 touch-none"></canvas>
                ` : ''}

            </div>
        `;
    }).join('');

    // Attach scratch physics to all unscratched cards
    filtered.forEach(coupon => {
        if (!coupon.is_scratched) {
            setupScratchCanvas(coupon.id);
        }
    });
}

// Scratch Canvas Physics
function setupScratchCanvas(couponId) {
    const canvas = document.getElementById(`scratch-canvas-${couponId}`);
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const rect = canvas.getBoundingClientRect();

    // Scale canvas resolution to element dimensions
    canvas.width = rect.width || 320;
    canvas.height = rect.height || 260;

    // Paint Foil Layer
    paintFoil(ctx, canvas.width, canvas.height);

    let isScratching = false;
    let totalPixels = canvas.width * canvas.height;
    let scratchedPixels = 0;
    let hasCleared = false;

    function getCoords(e) {
        const b = canvas.getBoundingClientRect();
        return {
            x: (e.clientX || (e.touches && e.touches[0].clientX)) - b.left,
            y: (e.clientY || (e.touches && e.touches[0].clientY)) - b.top
        };
    }

    function scratch(x, y) {
        if (hasCleared) return;

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 22, 0, Math.PI * 2);
        ctx.fill();

        // Sample scratch completion every few moves
        checkScratchPercentage();
    }

    function checkScratchPercentage() {
        if (hasCleared) return;

        try {
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;
            let transparentCount = 0;

            // Sample every 16th pixel for high performance
            for (let i = 3; i < data.length; i += 64) {
                if (data[i] === 0) {
                    transparentCount++;
                }
            }

            const ratio = transparentCount / (totalPixels / 16);

            if (ratio > 0.42) {
                hasCleared = true;
                autoRevealCoupon(couponId, canvas);
            }
        } catch (err) {
            console.warn('Canvas sample error:', err);
        }
    }

    // Pointer event listeners (unifies touch + mouse)
    canvas.addEventListener('pointerdown', (e) => {
        isScratching = true;
        canvas.setPointerCapture(e.pointerId);
        const { x, y } = getCoords(e);
        scratch(x, y);
    });

    canvas.addEventListener('pointermove', (e) => {
        if (!isScratching) return;
        const { x, y } = getCoords(e);
        scratch(x, y);
    });

    canvas.addEventListener('pointerup', (e) => {
        isScratching = false;
        try { canvas.releasePointerCapture(e.pointerId); } catch(ex) {}
    });

    canvas.addEventListener('pointercancel', () => {
        isScratching = false;
    });
}

// Paint glamorous navy & gold foil texture on canvas
function paintFoil(ctx, width, height) {
    // Rich navy gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#243B8F');
    grad.addColorStop(0.5, '#1E3278');
    grad.addColorStop(1, '#152355');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Decorative dotted border
    ctx.strokeStyle = '#FFF0C9';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // Sparkly star accents
    ctx.fillStyle = '#FFF0C9';
    drawStar(ctx, 35, 35, 4, 3);
    drawStar(ctx, width - 35, 35, 4, 3);
    drawStar(ctx, 35, height - 35, 4, 3);
    drawStar(ctx, width - 35, height - 35, 4, 3);

    // Centered foil text
    ctx.font = 'bold 16px Quicksand, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFF0C9';
    ctx.fillText('✨ SCRATCH TO REVEAL ✨', width / 2, height / 2 - 10);

    ctx.font = 'semibold 12px Quicksand, sans-serif';
    ctx.fillStyle = '#FFF0C9';
    ctx.fillText('Rub with your finger or mouse 🪙', width / 2, height / 2 + 18);
}

// Helper: draw cute stars on the foil
function drawStar(ctx, cx, cy, spikes, r) {
    let rot = Math.PI / 2 * 3;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    for (let i = 0; i < spikes; i++) {
        let x = cx + Math.cos(rot) * r;
        let y = cy + Math.sin(rot) * r;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * (r / 2);
        y = cy + Math.sin(rot) * (r / 2);
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(cx, cy - r);
    ctx.closePath();
    ctx.fill();
}

// Auto-reveal when scratch reaches threshold
async function autoRevealCoupon(couponId, canvas) {
    // Fade out canvas animation
    canvas.style.transition = 'opacity 0.4s ease-out';
    canvas.style.opacity = '0';

    setTimeout(() => {
        canvas.remove();
    }, 450);

    // Celebration confetti!
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#243B8F', '#FFF0C9', '#F39C12', '#E74C3C']
        });
    }

    // Update state
    coupons = coupons.map(c => {
        if (c.id == couponId) {
            return { ...c, is_scratched: true };
        }
        return c;
    });
    saveLocalCoupons(coupons);
    updateCouponStats();

    // Persist to Supabase
    try {
        const client = await getSupabaseClient();
        if (client) {
            await client.from('date_coupons').update({ is_scratched: true }).eq('id', couponId);
        }
    } catch (e) {
        console.warn('Supabase update scratch error:', e);
    }

    // Re-render in 500ms to show the Redeem button
    setTimeout(() => {
        renderCoupons();
    }, 500);
}

// Redeem Coupon Action
async function redeemCoupon(couponId) {
    const coupon = coupons.find(c => c.id == couponId);
    if (!coupon) return;

    if (!confirm(`Redeem "${coupon.title}" with Sanyam now? ❤️`)) return;

    const now = new Date().toISOString();

    coupons = coupons.map(c => {
        if (c.id == couponId) {
            return {
                ...c,
                is_redeemed: true,
                redeemed_at: now
            };
        }
        return c;
    });

    saveLocalCoupons(coupons);
    renderCoupons();

    // Celebration burst
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.5 },
            colors: ['#243B8F', '#FFF0C9', '#E74C3C', '#27AE60']
        });
    }

    // Persist to Supabase
    try {
        const client = await getSupabaseClient();
        if (client) {
            await client.from('date_coupons').update({
                is_redeemed: true,
                redeemed_at: now
            }).eq('id', couponId);
        }
    } catch (e) {
        console.warn('Supabase redeem error:', e);
    }
}

// Share on WhatsApp shortcut
function shareOnWhatsApp(couponId) {
    const coupon = coupons.find(c => c.id == couponId);
    if (!coupon) return;

    const message = `Hey Sanyam! 🥰 I'm officially redeeming my coupon:\n\n"${coupon.title}"\n\nGet ready! ❤️`;
    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
}

// Filter Coupons
function filterCoupons(filter) {
    activeFilter = filter;

    const buttons = document.querySelectorAll('.coupon-filter-btn');
    buttons.forEach(btn => {
        const f = btn.getAttribute('data-filter');
        if (f === filter) {
            btn.classList.add('bg-customAccent', 'text-customBg', 'shadow-[2px_2px_0px_0px_#243B8F]');
            btn.classList.remove('bg-white', 'text-customAccent');
        } else {
            btn.classList.remove('bg-customAccent', 'text-customBg', 'shadow-[2px_2px_0px_0px_#243B8F]');
            btn.classList.add('bg-white', 'text-customAccent');
        }
    });

    renderCoupons();
}

// Stats counter updater
function updateCouponStats() {
    const availableEl = document.getElementById('stat-available');
    const scratchedEl = document.getElementById('stat-scratched');
    const redeemedEl = document.getElementById('stat-redeemed');

    const total = coupons.length;
    const scratched = coupons.filter(c => c.is_scratched && !c.is_redeemed).length;
    const redeemed = coupons.filter(c => c.is_redeemed).length;
    const readyToScratch = coupons.filter(c => !c.is_scratched).length;

    if (availableEl) availableEl.innerText = readyToScratch;
    if (scratchedEl) scratchedEl.innerText = scratched;
    if (redeemedEl) redeemedEl.innerText = redeemed;
}

// Local Storage helpers for instant offline/fallback persistence
function loadLocalCoupons() {
    try {
        const raw = localStorage.getItem('himi_date_coupons');
        if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
}

function saveLocalCoupons(data) {
    try {
        localStorage.setItem('himi_date_coupons', JSON.stringify(data));
    } catch (e) {}
}

// HTML escape helper
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
