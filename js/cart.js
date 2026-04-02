/* ============================================
   8BEAT — CART SYSTEM (Arcade Style)
   Кошик з купонами, доставкою, localStorage
   ============================================ */

class CartManager {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('8beat_cart') || '[]');
        this.coupons = {
            '8BEAT10': { discount: 10, type: 'percent', desc: '-10% на замовлення' },
            'PIXEL20': { discount: 20, type: 'percent', desc: '-20% на замовлення' },
            'ARCADE10': { discount: 10, type: 'percent', desc: '-10% (артефакт)' },
            'STARPOWER': { discount: 20, type: 'percent', desc: '-20% (зірочка)' },
            'ONEUP': { discount: 0, type: 'free_delivery', desc: 'Безкошт. доставка' },
            'FIRSTLIFE': { discount: 15, type: 'percent', desc: '-15% перше замовлення' },
            'COIN10': { discount: 10, type: 'percent', desc: '-10% (монетки)' }
        };
        this.appliedCoupon = localStorage.getItem('8beat_coupon') || null;
        this.deliveryPrice = 70;
        this.freeDeliveryThreshold = 1000;
        this.listeners = {};
        this.updateBadge();
    }

    addItem(item) {
        const existing = this.items.find(i => i.id === item.id && i.size === item.size);
        if (existing) {
            existing.quantity += item.quantity || 1;
        } else {
            this.items.push({ ...item, quantity: item.quantity || 1 });
        }
        this.save();
        this.emit('change');
    }

    removeItem(id, size) {
        this.items = this.items.filter(i => !(i.id === id && i.size === size));
        this.save();
        this.emit('change');
    }

    updateQuantity(id, size, qty) {
        const item = this.items.find(i => i.id === id && i.size === size);
        if (item) {
            item.quantity = Math.max(1, qty);
            this.save();
            this.emit('change');
        }
    }

    getSubtotal() {
        return this.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    }

    getDiscount() {
        if (!this.appliedCoupon) return 0;
        const coupon = this.coupons[this.appliedCoupon];
        if (!coupon || coupon.type !== 'percent') return 0;
        return Math.round(this.getSubtotal() * coupon.discount / 100);
    }

    getDelivery() {
        if (this.appliedCoupon && this.coupons[this.appliedCoupon]?.type === 'free_delivery') return 0;
        return this.getSubtotal() >= this.freeDeliveryThreshold ? 0 : this.deliveryPrice;
    }

    getTotal() {
        return this.getSubtotal() - this.getDiscount() + this.getDelivery();
    }

    applyCoupon(code) {
        const upper = code.toUpperCase().trim();
        if (this.coupons[upper]) {
            this.appliedCoupon = upper;
            localStorage.setItem('8beat_coupon', upper);
            this.emit('change');
            return { success: true, desc: this.coupons[upper].desc };
        }
        return { success: false, desc: 'Невідомий промокод' };
    }

    removeCoupon() {
        this.appliedCoupon = null;
        localStorage.removeItem('8beat_coupon');
        this.emit('change');
    }

    clear() {
        this.items = [];
        this.appliedCoupon = null;
        localStorage.removeItem('8beat_coupon');
        this.save();
        this.emit('change');
    }

    save() {
        localStorage.setItem('8beat_cart', JSON.stringify(this.items));
        this.updateBadge();
    }

    updateBadge() {
        const badge = document.getElementById('cart-count');
        if (badge) {
            const count = this.items.reduce((s, i) => s + i.quantity, 0);
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    on(event, fn) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(fn);
    }

    emit(event) {
        (this.listeners[event] || []).forEach(fn => fn());
    }

    getItemCount() {
        return this.items.reduce((s, i) => s + i.quantity, 0);
    }
}

// Глобальний інстанс
window.cartManager = new CartManager();

// Кнопка кошика → перехід на сторінку
document.addEventListener('DOMContentLoaded', () => {
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            const isRoot = !window.location.pathname.includes('/pages/');
            window.location.href = isRoot ? 'pages/cart.html' : 'cart.html';
        });
    }
});
