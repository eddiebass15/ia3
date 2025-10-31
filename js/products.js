// Global variables
let currentUser = null;
let cart = [];
let products = [];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    loadProducts();
    updateCartCount();
});

// Section navigation
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

// Auth tab navigation
function showAuthTab(tabId) {
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
}

// Check authentication status
async function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await fetch('http://localhost:5000/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                currentUser = await response.json();
                document.getElementById('authLink').textContent = 'Logout';
                document.getElementById('authLink').onclick = logout;
            } else {
                localStorage.removeItem('token');
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        }
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    currentUser = null;
    document.getElementById('authLink').textContent = 'Login';
    document.getElementById('authLink').onclick = () => showSection('auth');
    showSection('home');
}

// Search products
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value;
    loadProducts(searchTerm);
}

// Load products
async function loadProducts(search = '') {
    try {
        let url = 'http://localhost:5000/api/products';
        const params = new URLSearchParams();
        
        if (search) params.append('search', search);
        if (document.getElementById('categoryFilter').value !== 'all') {
            params.append('category', document.getElementById('categoryFilter').value);
        }
        if (document.getElementById('sortFilter').value) {
            params.append('sort', document.getElementById('sortFilter').value);
        }
        if (document.getElementById('minPrice').value) {
            params.append('minPrice', document.getElementById('minPrice').value);
        }
        if (document.getElementById('maxPrice').value) {
            params.append('maxPrice', document.getElementById('maxPrice').value);
        }
        
        if (params.toString()) {
            url += '?' + params.toString();
        }

        const response = await fetch(url);
        products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Failed to load products:', error);
    }
}

// Display products
function displayProducts(products) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="product-category">${product.category}</div>
                <div class="product-price">₹${product.price}</div>
                <div class="product-rating">⭐ ${product.rating}/5</div>
                <button class="add-to-cart" onclick="addToCart('${product._id}')">
                    Add to Cart
                </button>
            </div>
        `;
        grid.appendChild(productCard);
    });
}

// Filter products by category
function filterProducts() {
    loadProducts();
}

// Sort products
function sortProducts() {
    loadProducts();
}

// Filter by price
function filterByPrice() {
    loadProducts();
}

// Add to cart
function addToCart(productId) {
    if (!currentUser) {
        alert('Please login to add items to cart');
        showSection('auth');
        return;
    }

    const product = products.find(p => p._id === productId);
    const existingItem = cart.find(item => item.product._id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            product: product,
            quantity: 1
        });
    }

    updateCartCount();
    alert('Product added to cart!');
}

// Update cart count
function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cartCount').textContent = totalItems;
    
    if (document.getElementById('cart').classList.contains('active')) {
        displayCartItems();
    }
}

// Display cart items
function displayCartItems() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.product.price * item.quantity;
        total += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.product.name}</h4>
                <div class="cart-item-price">₹${item.product.price}</div>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
            </div>
            <div class="cart-item-total">₹${itemTotal}</div>
            <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
        `;
        cartItems.appendChild(cartItem);
    });

    cartTotal.textContent = total;
}

// Update quantity
function updateQuantity(index, change) {
    cart[index].quantity += change;
    
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    
    updateCartCount();
}

// Remove from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
}

// Checkout
function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    alert(`Order placed successfully! Total: ₹${document.getElementById('cartTotal').textContent}`);
    cart = [];
    updateCartCount();
    showSection('products');
}