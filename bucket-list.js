// ==============================================================================
// Himi & Sanyam Bucket List - JavaScript Interactivity & Supabase Sync
// ==============================================================================

let currentItems = [];
let activeCategory = 'All';
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

// Starter items used when Supabase is not connected yet or table is empty
const STARTER_ITEMS = [
    { id: '1', title: 'Watch a beach sunset together until the stars come out', category: 'Beach', is_completed: false },
    { id: '2', title: 'A weekend beach getaway with zero office stress', category: 'Beach', is_completed: false },
    { id: '3', title: 'Late night beach drive with good music & windows down', category: 'Beach', is_completed: false },
    { id: '4', title: 'Undercover office coffee date without anyone noticing', category: 'Office', is_completed: false },
    { id: '5', title: 'Get Himi to take her medicines & wear her glasses without making a funny face 😂', category: 'Office', is_completed: false },
    { id: '6', title: 'Have a peaceful lunch date without rushing back to work', category: 'Office', is_completed: false },
    { id: '7', title: 'Bookstore date where we pick out books for each other', category: 'Cozy', is_completed: false },
    { id: '8', title: 'Rainy day movie marathon with hot chocolate & blankets', category: 'Cozy', is_completed: false },
    { id: '9', title: 'Cook a chaotic and delicious dinner together from scratch', category: 'Cozy', is_completed: false },
    { id: '10', title: 'Take goofy photobooth pictures together', category: 'Cozy', is_completed: false },
    { id: '11', title: 'Our first flight & trip together to a brand new city', category: 'Adventure', is_completed: false },
    { id: '12', title: 'Fill a memory scrapbook with our tickets, notes, and photos', category: 'Adventure', is_completed: false }
];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    const isConfigured = isSupabaseConfigured();
    const banner = document.getElementById('setup-banner');

    if (!isConfigured) {
        if (banner) banner.classList.remove('hidden');
        // Render starter items in preview mode
        currentItems = [...STARTER_ITEMS];
        renderItems();
        return;
    } else {
        if (banner) banner.classList.add('hidden');
    }

    const client = initSupabase();
    if (!client) {
        if (banner) banner.classList.remove('hidden');
        currentItems = [...STARTER_ITEMS];
        renderItems();
        return;
    }

    await fetchBucketList();
    setupRealtimeSubscription(client);
}

// Fetch items from Supabase
async function fetchBucketList() {
    const client = initSupabase();
    if (!client) return;

    const loadingState = document.getElementById('loading-state');
    if (loadingState && currentItems.length === 0) {
        loadingState.classList.remove('hidden');
    }

    try {
        const { data, error } = await client
            .from('bucket_list')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching bucket list:', error);
            // If table doesn't exist or permissions error, fall back to local preview
            if (currentItems.length === 0) {
                currentItems = [...STARTER_ITEMS];
            }
        } else if (data && data.length > 0) {
            currentItems = data;
        } else if (data && data.length === 0) {
            // Seed starter items if table is brand new
            await seedStarterItems(client);
            return;
        }
    } catch (err) {
        console.error('Fetch exception:', err);
    } finally {
        renderItems();
    }
}

// Seed starter items into Supabase
async function seedStarterItems(client) {
    try {
        const itemsToInsert = STARTER_ITEMS.map(({ title, category, is_completed }) => ({
            title,
            category,
            is_completed
        }));
        const { data, error } = await client
            .from('bucket_list')
            .insert(itemsToInsert)
            .select();

        if (!error && data) {
            currentItems = data;
        } else {
            currentItems = [...STARTER_ITEMS];
        }
    } catch (e) {
        console.error('Seed exception:', e);
        currentItems = [...STARTER_ITEMS];
    }
    renderItems();
}

// Realtime Channel
function setupRealtimeSubscription(client) {
    if (realtimeChannel) {
        client.removeChannel(realtimeChannel);
    }

    try {
        realtimeChannel = client
            .channel('bucket-list-live')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bucket_list' }, () => {
                fetchBucketList();
            })
            .subscribe();
    } catch (e) {
        console.warn('Realtime subscription not supported:', e);
    }
}

// Toggle Complete
async function toggleComplete(id, currentStatus) {
    const newStatus = !currentStatus;

    // Optimistic UI update
    currentItems = currentItems.map(item => {
        if (item.id == id) {
            return {
                ...item,
                is_completed: newStatus,
                completed_at: newStatus ? new Date().toISOString() : null
            };
        }
        return item;
    });
    renderItems();

    if (newStatus) {
        fireCheckConfetti();
    }

    const client = initSupabase();
    if (!client) return;

    try {
        const { error } = await client
            .from('bucket_list')
            .update({
                is_completed: newStatus,
                completed_at: newStatus ? new Date().toISOString() : null
            })
            .eq('id', id);

        if (error) {
            console.error('Update error:', error);
            fetchBucketList(); // rollback on error
        }
    } catch (err) {
        console.error('Update exception:', err);
        fetchBucketList();
    }
}

// Add Item
async function handleAddItem(event) {
    event.preventDefault();
    const titleInput = document.getElementById('item-title');
    const categorySelect = document.getElementById('item-category');
    const submitBtn = document.getElementById('add-submit-btn');

    const title = titleInput.value.trim();
    const category = categorySelect.value;

    if (!title) return;

    submitBtn.disabled = true;
    submitBtn.innerText = 'Adding...';

    const client = initSupabase();

    if (client) {
        try {
            const { data, error } = await client
                .from('bucket_list')
                .insert([{ title, category, is_completed: false }])
                .select();

            if (error) {
                console.error('Insert error:', error);
                alert('Could not save to Supabase. Check credentials or table schema.');
            } else if (data) {
                currentItems.push(data[0]);
            }
        } catch (err) {
            console.error('Insert exception:', err);
        }
    } else {
        // Local preview fallback
        const newItem = {
            id: 'custom-' + Date.now(),
            title,
            category,
            is_completed: false
        };
        currentItems.push(newItem);
    }

    titleInput.value = '';
    submitBtn.disabled = false;
    submitBtn.innerText = 'Add Wish ❤️';
    toggleAddForm();
    renderItems();
    fireCheckConfetti();
}

// Delete Item
async function deleteItem(id, event) {
    event.stopPropagation();
    if (!confirm('Remove this wish from our bucket list?')) return;

    currentItems = currentItems.filter(item => item.id != id);
    renderItems();

    const client = initSupabase();
    if (!client) return;

    try {
        await client.from('bucket_list').delete().eq('id', id);
    } catch (err) {
        console.error('Delete error:', err);
    }
}

// Toggle Add Form Visibility
function toggleAddForm() {
    const form = document.getElementById('add-form');
    if (form) {
        form.classList.toggle('hidden');
        if (!form.classList.contains('hidden')) {
            document.getElementById('item-title').focus();
        }
    }
}

// Category Filter
function filterCategory(category) {
    activeCategory = category;

    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        const cat = btn.getAttribute('data-category');
        if (cat === category) {
            btn.classList.add('bg-customAccent', 'text-customBg', 'shadow-[2px_2px_0px_0px_#243B8F]');
            btn.classList.remove('bg-white', 'text-customAccent');
        } else {
            btn.classList.remove('bg-customAccent', 'text-customBg', 'shadow-[2px_2px_0px_0px_#243B8F]');
            btn.classList.add('bg-white', 'text-customAccent');
        }
    });

    renderItems();
}

// Render Bucket List Items & Update Progress
function renderItems() {
    const listContainer = document.getElementById('items-list');
    const emptyState = document.getElementById('empty-state');

    // Filter items
    const filtered = activeCategory === 'All' 
        ? currentItems 
        : currentItems.filter(i => i.category.toLowerCase() === activeCategory.toLowerCase());

    updateProgressBar();

    if (filtered.length === 0) {
        listContainer.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    listContainer.innerHTML = filtered.map(item => {
        const isDone = !!item.is_completed;
        const categoryBadge = getCategoryBadge(item.category);

        return `
            <div onclick="toggleComplete('${item.id}', ${isDone})" class="group cursor-pointer flex items-center justify-between p-4 rounded-2xl border-2 border-customAccent transition-all duration-200 ${isDone ? 'bg-amber-100/60 opacity-80' : 'bg-white hover:bg-customBg/50 hover:-translate-y-0.5 shadow-[3px_3px_0px_0px_#243B8F]'}">
                <div class="flex items-center gap-3.5 flex-grow pr-2">
                    <!-- Checkbox -->
                    <div class="w-6 h-6 rounded-lg border-2 border-customAccent flex items-center justify-center flex-shrink-0 transition-all ${isDone ? 'bg-customAccent text-customBg' : 'bg-white group-hover:border-customAccent'}">
                        ${isDone ? `
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                            </svg>
                        ` : ''}
                    </div>

                    <!-- Title & Details -->
                    <div class="flex flex-col">
                        <span class="font-bold text-sm md:text-base leading-snug transition-all ${isDone ? 'line-through opacity-70' : 'text-customAccent'}">
                            ${escapeHtml(item.title)}
                        </span>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="text-xs font-semibold px-2 py-0.5 rounded-full border border-customAccent bg-customBg/80 text-customAccent">
                                ${categoryBadge}
                            </span>
                            ${isDone ? `<span class="text-xs font-bold text-emerald-700">✓ Completed ❤️</span>` : ''}
                        </div>
                    </div>
                </div>

                <!-- Delete button -->
                <button onclick="deleteItem('${item.id}', event)" title="Remove item" class="opacity-30 hover:opacity-100 hover:text-red-600 transition-opacity p-2 rounded-lg">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                </button>
            </div>
        `;
    }).join('');
}

// Category badge helper
function getCategoryBadge(cat) {
    const c = (cat || '').toLowerCase();
    if (c.includes('beach')) return '🏖️ Beach';
    if (c.includes('office')) return '🏢 Office';
    if (c.includes('cozy')) return '📚 Cozy';
    if (c.includes('adventure')) return '✈️ Adventure';
    return `✨ ${cat || 'General'}`;
}

// Progress Bar & Cheer Messages
function updateProgressBar() {
    const total = currentItems.length;
    const completed = currentItems.filter(i => i.is_completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    const bar = document.getElementById('progress-bar');
    const text = document.getElementById('progress-text');
    const cheer = document.getElementById('progress-cheer');

    if (bar) bar.style.width = `${percentage}%`;
    if (text) text.innerText = `${completed} / ${total} (${percentage}%)`;

    if (cheer) {
        if (completed === 0) {
            cheer.innerText = "Check off memories as we make them! 💕";
        } else if (percentage < 30) {
            cheer.innerText = "Off to a wonderful start! Every memory counts ✨";
        } else if (percentage < 70) {
            cheer.innerText = "Look at all the beautiful chapters we've lived! 🏖️📖";
        } else if (percentage < 100) {
            cheer.innerText = "Almost every dream fulfilled together! ❤️";
        } else {
            cheer.innerText = "🎉 Every single wish achieved with Himi! Let's dream up more!";
        }
    }
}

// Confetti micro-celebration
function fireCheckConfetti() {
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#243B8F', '#FFF0C9', '#E74C3C', '#2ECC71']
        });
    }
}

// Save credentials from the setup banner
function handleSaveCredentials() {
    const url = document.getElementById('setup-url').value.trim();
    const key = document.getElementById('setup-key').value.trim();

    if (!url || !key) {
        alert('Please enter both the Supabase URL and the Anon Public Key.');
        return;
    }

    const client = saveSupabaseCredentials(url, key);
    if (client) {
        document.getElementById('setup-banner').classList.add('hidden');
        fetchBucketList();
        setupRealtimeSubscription(client);
    } else {
        alert('Credentials saved, but could not initialize client. Please check the URL format.');
    }
}

// Basic HTML escaping
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
