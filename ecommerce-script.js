console.log('LuxeWear E-commerce Script Loaded');

// ==================== GLOBAL STATE ====================
let currentLang = 'en';
let cart = JSON.parse(localStorage.getItem('luxewear_cart')) || [];

// ==================== LANGUAGE SYSTEM ====================
function applyLanguage(lang) {
    console.log('Applying language:', lang);
    currentLang = lang;
    
    // Update all elements with language attributes
    const elements = document.querySelectorAll('[data-en][data-gr]');
    elements.forEach(element => {
        const text = element.getAttribute('data-' + lang);
        
        if (element.tagName === 'INPUT' && element.type !== 'submit' && element.type !== 'button') {
            const placeholder = element.getAttribute('data-' + lang + '-placeholder');
            if (placeholder) {
                element.placeholder = placeholder;
            }
        } else if (element.tagName === 'TEXTAREA') {
            const placeholder = element.getAttribute('data-' + lang + '-placeholder');
            if (placeholder) {
                element.placeholder = placeholder;
            }
        } else if (element.tagName === 'SELECT') {
            // Handle select options
            Array.from(element.options).forEach(option => {
                const optionText = option.getAttribute('data-' + lang);
                if (optionText) {
                    option.textContent = optionText;
                }
            });
        } else if (element.tagName === 'BUTTON' || element.tagName === 'A') {
            element.textContent = text;
        } else {
            element.textContent = text;
        }
    });
    
    // Store language preference
    localStorage.setItem('luxewear_lang', lang);
}

// ==================== CART FUNCTIONS ====================
function addToCart(product) {
    const existingItem = cart.find(item => 
        item.id === product.id && 
        item.size === product.size && 
        item.color === product.color
    );
    
    if (existingItem) {
        existingItem.quantity += product.quantity || 1;
    } else {
        cart.push({
            ...product,
            quantity: product.quantity || 1
        });
    }
    
    saveCart();
    updateCartCount();
    showToast(currentLang === 'en' ? 'Added to cart!' : 'Προστέθηκε στο καλάθι!', 'success');
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartCount();
    renderCart();
}

function updateCartQuantity(index, quantity) {
    if (quantity < 1) {
        removeFromCart(index);
        return;
    }
    cart[index].quantity = parseInt(quantity);
    saveCart();
    renderCart();
}

function saveCart() {
    localStorage.setItem('luxewear_cart', JSON.stringify(cart));
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const countElements = document.querySelectorAll('.cart-count');
    countElements.forEach(el => {
        el.textContent = totalItems;
        if (totalItems > 0) {
            el.style.display = 'flex';
        } else {
            el.style.display = 'none';
        }
    });
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
}

function renderCart() {
    const cartContent = document.getElementById('cartContent');
    if (!cartContent) return;
    
    if (cart.length === 0) {
        cartContent.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-bag"></i>
                <h2 data-en="Your cart is empty" data-gr="Το καλάθι σας είναι κενό">Your cart is empty</h2>
                <p data-en="Add some items to get started" data-gr="Προσθέστε προϊόντα για να ξεκινήσετε">Add some items to get started</p>
                <a href="ecommerce-shop.html" class="btn btn-primary">
                    <span data-en="Continue Shopping" data-gr="Συνέχεια Αγορών">Continue Shopping</span>
                </a>
            </div>
        `;
        applyLanguage(currentLang);
        return;
    }
    
    const subtotal = getCartTotal();
    const shipping = subtotal > 100 ? 0 : 10;
    const total = subtotal + shipping;
    
    cartContent.innerHTML = `
        <div class="cart-grid">
            <div class="cart-items">
                ${cart.map((item, index) => `
                    <div class="cart-item">
                        <div class="cart-item-image">
                            <img src="${item.image || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200'}" alt="${item.name}">
                        </div>
                        <div class="cart-item-details">
                            <h3>${item.name}</h3>
                            ${item.size ? `<p data-en="Size: ${item.size}" data-gr="Μέγεθος: ${item.size}">Size: ${item.size}</p>` : ''}
                            ${item.color ? `<p data-en="Color: ${item.color}" data-gr="Χρώμα: ${item.color}">Color: ${item.color}</p>` : ''}
                            <div class="quantity-controls" style="margin-top: 15px; display: inline-flex;">
                                <button onclick="updateCartQuantity(${index}, ${item.quantity - 1})">-</button>
                                <input type="number" value="${item.quantity}" min="1" onchange="updateCartQuantity(${index}, this.value)" style="width: 60px;">
                                <button onclick="updateCartQuantity(${index}, ${item.quantity + 1})">+</button>
                            </div>
                            <div class="cart-item-price">€${(parseFloat(item.price) * item.quantity).toFixed(2)}</div>
                        </div>
                        <div class="cart-item-actions">
                            <button class="remove-item" onclick="removeFromCart(${index})" data-en="Remove" data-gr="Αφαίρεση">Remove</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="cart-summary">
                <h2 data-en="Order Summary" data-gr="Περίληψη Παραγγελίας">Order Summary</h2>
                <div class="summary-row">
                    <span data-en="Subtotal:" data-gr="Υποσύνολο:">Subtotal:</span>
                    <span>€${subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span data-en="Shipping:" data-gr="Αποστολή:">Shipping:</span>
                    <span>${shipping === 0 ? (currentLang === 'en' ? 'FREE' : 'ΔΩΡΕΑΝ') : '€' + shipping.toFixed(2)}</span>
                </div>
                <div class="summary-row total">
                    <span data-en="Total:" data-gr="Σύνολο:">Total:</span>
                    <span>€${total.toFixed(2)}</span>
                </div>
                <button class="btn btn-primary" onclick="handleCheckout()">
                    <span data-en="Proceed to Checkout" data-gr="Ολοκλήρωση Αγοράς">Proceed to Checkout</span>
                </button>
                <a href="ecommerce-shop.html" class="btn btn-outline" style="margin-top: 15px;">
                    <span data-en="Continue Shopping" data-gr="Συνέχεια Αγορών">Continue Shopping</span>
                </a>
            </div>
        </div>
    `;
    
    applyLanguage(currentLang);
}

function handleCheckout() {
    showToast(
        currentLang === 'en' 
            ? 'This is a demo. In a live site, this would process payment.' 
            : 'Αυτό είναι demo. Σε πραγματική σελίδα, θα επεξεργαζόταν την πληρωμή.',
        'success'
    );
}

// ==================== TOAST NOTIFICATIONS ====================
function showToast(message, type = 'success') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==================== PRODUCT FILTERING ====================
function initFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const sortSelect = document.querySelector('.sort-select');
    
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                const category = this.getAttribute('data-category');
                filterProducts(category);
            });
        });
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortProducts(this.value);
        });
    }
}

function filterProducts(category) {
    const products = document.querySelectorAll('.product-card');
    
    products.forEach(product => {
        const productCategory = product.getAttribute('data-category');
        
        if (category === 'all' || productCategory === category) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}

function sortProducts(sortBy) {
    const container = document.querySelector('.products-grid-large') || document.querySelector('.products-grid');
    if (!container) return;
    
    const products = Array.from(container.querySelectorAll('.product-card'));
    
    products.sort((a, b) => {
        const priceA = parseFloat(a.getAttribute('data-price'));
        const priceB = parseFloat(b.getAttribute('data-price'));
        
        switch (sortBy) {
            case 'price-low':
                return priceA - priceB;
            case 'price-high':
                return priceB - priceA;
            case 'newest':
            case 'featured':
            default:
                return 0;
        }
    });
    
    products.forEach(product => container.appendChild(product));
}

// ==================== MOBILE MENU ====================
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking links
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
            });
        });
    }
}

// ==================== SEARCH ====================
function initSearch() {
    const searchBtn = document.querySelector('.search-btn');
    const searchOverlay = document.querySelector('.search-overlay');
    const searchClose = document.querySelector('.search-close');
    
    if (searchBtn && searchOverlay) {
        searchBtn.addEventListener('click', function() {
            searchOverlay.classList.add('active');
            document.querySelector('.search-input')?.focus();
        });
        
        if (searchClose) {
            searchClose.addEventListener('click', function() {
                searchOverlay.classList.remove('active');
            });
        }
        
        searchOverlay.addEventListener('click', function(e) {
            if (e.target === searchOverlay) {
                searchOverlay.classList.remove('active');
            }
        });
    }
}

// ==================== PRODUCT DETAIL PAGE ====================
function initProductDetail() {
    // Thumbnail gallery
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.getElementById('mainImage');
    
    if (thumbnails.length > 0 && mainImage) {
        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', function() {
                thumbnails.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                const img = this.querySelector('img');
                mainImage.src = img.src.replace('w=200', 'w=800');
            });
        });
    }
    
    // Size selection
    const sizeOptions = document.querySelectorAll('.size-option');
    sizeOptions.forEach(option => {
        option.addEventListener('click', function() {
            sizeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Color selection
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            colorOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Quantity controls
    const qtyDecrease = document.querySelector('.qty-decrease');
    const qtyIncrease = document.querySelector('.qty-increase');
    const qtyInput = document.querySelector('.qty-input');
    
    if (qtyDecrease && qtyIncrease && qtyInput) {
        qtyDecrease.addEventListener('click', function() {
            const currentValue = parseInt(qtyInput.value);
            if (currentValue > 1) {
                qtyInput.value = currentValue - 1;
            }
        });
        
        qtyIncrease.addEventListener('click', function() {
            const currentValue = parseInt(qtyInput.value);
            const maxValue = parseInt(qtyInput.max) || 10;
            if (currentValue < maxValue) {
                qtyInput.value = currentValue + 1;
            }
        });
    }
    
    // Add to cart from detail page
    const addToCartBtn = document.querySelector('.add-to-cart-detail');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            const selectedSize = document.querySelector('.size-option.active')?.getAttribute('data-size');
            const selectedColor = document.querySelector('.color-option.active')?.getAttribute('data-color');
            const quantity = parseInt(qtyInput?.value || 1);
            const priceElement = document.querySelector('.product-details .product-price');
            const price = priceElement?.getAttribute('data-price') || '189.99';
            const name = document.querySelector('.product-details h1')?.textContent || 'Product';
            
            const product = {
                id: new URLSearchParams(window.location.search).get('id') || '1',
                name: name,
                price: price,
                size: selectedSize,
                color: selectedColor,
                quantity: quantity,
                image: mainImage?.src || ''
            };
            
            addToCart(product);
        });
    }
}

// ==================== QUICK ADD TO CART ====================
function initQuickAdd() {
    const quickAddButtons = document.querySelectorAll('.quick-add');
    
    quickAddButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const productCard = this.closest('.product-card');
            const product = {
                id: productCard.getAttribute('data-id'),
                name: productCard.getAttribute('data-name'),
                price: productCard.getAttribute('data-price'),
                image: productCard.querySelector('img')?.src || '',
                quantity: 1
            };
            
            addToCart(product);
        });
    });
}

// ==================== NEWSLETTER FORM ====================
function initNewsletter() {
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            showToast(
                currentLang === 'en' 
                    ? 'Thanks for subscribing!' 
                    : 'Ευχαριστούμε για την εγγραφή!',
                'success'
            );
            
            this.reset();
        });
    }
}

// ==================== CONTACT FORM ====================
function initContactForm() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            showToast(
                currentLang === 'en' 
                    ? 'Message sent successfully!' 
                    : 'Το μήνυμα στάλθηκε επιτυχώς!',
                'success'
            );
            
            this.reset();
        });
    }
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing LuxeWear E-commerce');
    
    // Initialize language
    const savedLang = localStorage.getItem('luxewear_lang') || 'en';
    currentLang = savedLang;
    
    // Set active language button
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        if (btn.getAttribute('data-lang') === savedLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Language switching
    langButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            
            langButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            applyLanguage(lang);
        });
    });
    
    // Apply initial language
    applyLanguage(savedLang);
    
    // Initialize all features
    initMobileMenu();
    initSearch();
    initFilters();
    initQuickAdd();
    initProductDetail();
    initNewsletter();
    initContactForm();
    
    // Update cart count on page load
    updateCartCount();
    
    // Render cart if on cart page
    if (document.getElementById('cartContent')) {
        renderCart();
    }
    
    console.log('Initialization complete');
});

// Make functions available globally
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;
window.handleCheckout = handleCheckout;
