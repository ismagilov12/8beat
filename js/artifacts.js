/* ============================================
   8BEAT — ARTIFACT SYSTEM
   Монетки, зірочки, грибочки що літають по сайту
   Збір артефактів = промокоди та бали
   ============================================ */

class ArtifactSystem {
    constructor() {
        this.container = document.getElementById('artifacts-container');
        this.artifacts = [];
        this.config = {
            coin: { emoji: '🪙', points: 10, spawnInterval: 8000, lifetime: 12000, key: '8beat_coins' },
            star: { emoji: '⭐', points: 50, spawnInterval: 60000, lifetime: 15000, key: '8beat_stars' },
            mushroom: { emoji: '🍄', points: 30, spawnInterval: 45000, lifetime: 20000, key: '8beat_mushrooms' }
        };
        this.promoCodes = {
            coin10: { code: 'COIN10', discount: '10%', threshold: 10, type: 'coin' },
            star3: { code: 'STARPOWER', discount: '20%', threshold: 3, type: 'star' },
            mushroom1: { code: 'ONEUP', discount: 'Безкошт. доставка', threshold: 1, type: 'mushroom' }
        };

        if (this.container) this.init();
    }

    init() {
        // Запускаємо спавн різних артефактів
        this.spawnLoop('coin');
        this.spawnLoop('star');
        this.spawnLoop('mushroom');

        // Перший коін одразу
        setTimeout(() => this.spawn('coin'), 2000);
    }

    spawnLoop(type) {
        const cfg = this.config[type];
        setInterval(() => {
            if (this.artifacts.filter(a => a.type === type).length < 3) {
                this.spawn(type);
            }
        }, cfg.spawnInterval);
    }

    spawn(type) {
        const cfg = this.config[type];
        const el = document.createElement('div');
        el.className = 'artifact';
        el.textContent = cfg.emoji;
        el.dataset.type = type;

        // Рандомна позиція (уникаючи хедер)
        const x = Math.random() * (window.innerWidth - 60) + 20;
        const y = Math.random() * (window.innerHeight - 200) + 100;
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.position = 'fixed';

        // Рандомна затримка анімації для різноманітності
        el.style.animationDelay = (Math.random() * 2) + 's';

        // Зірочки більші
        if (type === 'star') el.style.fontSize = '2.5rem';
        if (type === 'mushroom') el.style.fontSize = '1.8rem';

        // Клік = збір
        el.addEventListener('click', () => this.collect(el, type));

        this.container.appendChild(el);

        const artifact = { el, type, timer: null };
        this.artifacts.push(artifact);

        // Автовидалення після lifetime
        artifact.timer = setTimeout(() => {
            this.remove(artifact);
        }, cfg.lifetime);
    }

    collect(el, type) {
        const cfg = this.config[type];

        // Анімація збору
        el.classList.add('collected');

        // Показуємо +points
        this.showFloatingText(el, `+${cfg.points}`);

        // Додаємо бали
        addScore(cfg.points);

        // Збільшуємо лічильник
        const count = parseInt(localStorage.getItem(cfg.key) || '0') + 1;
        localStorage.setItem(cfg.key, count.toString());
        updateScoreDisplay();

        // Тост
        const messages = {
            coin: `🪙 Монетка зібрана! +${cfg.points} балів`,
            star: `⭐ ЗІРОЧКА! Рідкісний дроп! +${cfg.points} балів`,
            mushroom: `🍄 ГРИБОЧОК 1UP! +${cfg.points} балів`
        };
        showToast(messages[type]);

        // Перевірка промокодів
        this.checkPromoCodes(type, count);

        // Видалити елемент
        setTimeout(() => {
            const idx = this.artifacts.findIndex(a => a.el === el);
            if (idx !== -1) {
                clearTimeout(this.artifacts[idx].timer);
                this.artifacts.splice(idx, 1);
            }
            el.remove();
        }, 400);
    }

    showFloatingText(el, text) {
        const float = document.createElement('div');
        float.style.cssText = `
            position: fixed;
            left: ${el.style.left};
            top: ${parseInt(el.style.top) - 20}px;
            font-family: 'Press Start 2P', monospace;
            font-size: 0.8rem;
            color: #FBD000;
            text-shadow: 2px 2px 0 #000;
            z-index: 1000;
            pointer-events: none;
            transition: all 0.8s ease;
        `;
        float.textContent = text;
        document.body.appendChild(float);

        requestAnimationFrame(() => {
            float.style.top = (parseInt(float.style.top) - 50) + 'px';
            float.style.opacity = '0';
        });

        setTimeout(() => float.remove(), 1000);
    }

    checkPromoCodes(type, count) {
        for (const [key, promo] of Object.entries(this.promoCodes)) {
            if (promo.type === type && count === promo.threshold) {
                const storageKey = `8beat_promo_${key}`;
                if (!localStorage.getItem(storageKey)) {
                    localStorage.setItem(storageKey, promo.code);
                    setTimeout(() => {
                        showPromoModal(
                            type === 'coin' ? '🪙' : type === 'star' ? '⭐' : '🍄',
                            'ПРОМОКОД РОЗБЛОКОВАНО!',
                            `Ти зібрав ${count} ${type === 'coin' ? 'монеток' : type === 'star' ? 'зірочки' : 'грибочок'}!`,
                            promo.code,
                            `Знижка: ${promo.discount}`
                        );
                    }, 500);
                }
            }
        }
    }

    remove(artifact) {
        if (artifact.el.parentNode) {
            artifact.el.style.opacity = '0';
            artifact.el.style.transition = 'opacity 0.5s';
            setTimeout(() => artifact.el.remove(), 500);
        }
        const idx = this.artifacts.indexOf(artifact);
        if (idx !== -1) this.artifacts.splice(idx, 1);
    }
}

// Запуск при завантаженні
document.addEventListener('DOMContentLoaded', () => {
    window.artifactSystem = new ArtifactSystem();
});
