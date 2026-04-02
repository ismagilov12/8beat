/* ============================================
   8BEAT — MAIN APP (Arcade Retro Style)
   ============================================ */

// === ПРОДУКТИ ===
window.products = [
    { id: 1, name: 'Pixel Heart', price: 350, category: 'Геймер', type: 'Футболка', sizes: ['S','M','L','XL'], rating: 5, badge: 'ХІТ!', colors: ['#E52521','#049CD8'] },
    { id: 2, name: 'Ретро Бластер', price: 420, category: 'Ретро', type: 'Футболка', sizes: ['S','M','L','XL'], rating: 4, badge: 'НОВ!', colors: ['#049CD8','#FBD000'] },
    { id: 3, name: 'Грибочок 1UP', price: 380, category: 'Геймер', type: 'Футболка', sizes: ['S','M','L','XL','XXL'], rating: 5, colors: ['#43B047','#E52521'] },
    { id: 4, name: 'Зоряний Воїн', price: 450, category: 'Абстракт', type: 'Футболка', sizes: ['S','M','L','XL'], rating: 4, colors: ['#FBD000','#43B047'] },
    { id: 5, name: 'Фаєрбол Фанк', price: 500, category: 'Геймер', type: 'Худі', sizes: ['M','L','XL'], rating: 5, badge: '🔥', colors: ['#E52521','#FBD000'] },
    { id: 6, name: 'Привид Аркади', price: 390, category: 'Ретро', type: 'Футболка', sizes: ['S','M','L','XL'], rating: 4, colors: ['#7B53AD','#049CD8'] },
    { id: 7, name: 'Данж Кролер', price: 440, category: 'Геймер', type: 'Футболка', sizes: ['S','M','L','XL'], rating: 5, colors: ['#1a1a2e','#E52521'] },
    { id: 8, name: 'Пікселі та Мрії', price: 360, category: 'Мінімалізм', type: 'Футболка', sizes: ['S','M','L','XL','XXL'], rating: 4, colors: ['#049CD8','#43B047'] },
    { id: 9, name: 'Бос-файт', price: 550, category: 'Геймер', type: 'Худі', sizes: ['M','L','XL'], rating: 5, badge: 'BOSS', colors: ['#E52521','#7B53AD'] },
    { id: 10, name: 'Нескінченний Ран', price: 370, category: 'Абстракт', type: 'Футболка', sizes: ['S','M','L','XL'], rating: 4, colors: ['#43B047','#FBD000'] },
    { id: 11, name: 'Спейс Інвейдер', price: 410, category: 'Ретро', type: 'Футболка', sizes: ['S','M','L','XL'], rating: 5, colors: ['#0f0f1e','#049CD8'] },
    { id: 12, name: 'Контра Клаб', price: 480, category: 'Геймер', type: 'Худі', sizes: ['M','L','XL','XXL'], rating: 5, badge: '30 LIVES', colors: ['#E52521','#43B047'] }
];

// === НАВІГАЦІЯ ===
document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            menuBtn.textContent = mobileMenu.classList.contains('hidden') ? '☰' : '✕';
        });
    }

    // Ініціалізація скору
    updateScoreDisplay();

    // Підписка на newsletter
    const nlForm = document.getElementById('newsletter-form');
    if (nlForm) {
        nlForm.addEventListener('submit', (e) => {
            e.preventDefault();
            document.getElementById('newsletter-success').classList.remove('hidden');
            nlForm.classList.add('hidden');
            showToast('📮 +1 ЛАЙФ! Промокод FIRSTLIFE активовано!');
            addScore(50);
        });
    }

    // Кнопки "В кошик" на головній
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const product = window.products.find(p => p.id === id);
            if (product && window.cartManager) {
                window.cartManager.addItem({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    size: product.sizes[1] || 'M',
                    quantity: 1
                });
                showToast(`🛒 ${product.name} додано в кошик!`);
                addScore(10);
            }
        });
    });
});

// === СКОР СИСТЕМА ===
function getScore() {
    return parseInt(localStorage.getItem('8beat_score') || '0');
}

function setScore(val) {
    localStorage.setItem('8beat_score', val.toString());
    updateScoreDisplay();
}

function addScore(points) {
    const newScore = getScore() + points;
    setScore(newScore);

    // Перевірка на промокоди
    if (newScore >= 500 && !localStorage.getItem('8beat_promo_500')) {
        localStorage.setItem('8beat_promo_500', 'ARCADE10');
        showPromoModal('🏆', 'ДОСЯГНЕННЯ РОЗБЛОКОВАНО!', 'Ти набрав 500 балів!', 'ARCADE10', 'Знижка -10% на будь-яке замовлення!');
    }
}

function updateScoreDisplay() {
    const el = document.getElementById('user-score');
    if (el) {
        const score = getScore();
        el.textContent = score.toString().padStart(4, '0');
    }

    // Оновити прогрес-бар
    const progressBar = document.getElementById('promo-progress');
    if (progressBar) {
        const score = getScore();
        const pct = Math.min(100, (score / 500) * 100);
        progressBar.style.width = pct + '%';
    }

    // Оновити лічильники артефактів
    const coinsEl = document.getElementById('coins-collected');
    const starsEl = document.getElementById('stars-collected');
    const mushroomsEl = document.getElementById('mushrooms-collected');
    if (coinsEl) coinsEl.textContent = localStorage.getItem('8beat_coins') || '0';
    if (starsEl) starsEl.textContent = localStorage.getItem('8beat_stars') || '0';
    if (mushroomsEl) mushroomsEl.textContent = localStorage.getItem('8beat_mushrooms') || '0';
}

// === ТОСТИ ===
function showToast(message, duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// === ПРОМО МОДАЛ ===
function showPromoModal(icon, title, text, code, extra) {
    const modal = document.getElementById('promo-modal');
    if (!modal) return;

    document.getElementById('modal-icon').textContent = icon;
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-text').textContent = text;

    if (code) {
        document.getElementById('modal-promo').classList.remove('hidden');
        document.getElementById('modal-code').textContent = code;
    } else {
        document.getElementById('modal-promo').classList.add('hidden');
    }

    modal.classList.remove('hidden');

    document.getElementById('modal-close').onclick = () => {
        modal.classList.add('hidden');
    };
}

// === УТИЛІТИ ===
function formatPrice(price) {
    return price.toLocaleString('uk-UA') + '₴';
}

function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}
