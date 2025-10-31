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
    
    if (sectionId === 'cart') {
        displayCartItems();
    }
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
                checkAdminStatus();
            } else {
                localStorage.removeItem('token');
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        }
    }
}

// Check admin status
function checkAdminStatus() {
    if (currentUser && currentUser.isAdmin) {
        document.getElementById('adminLink').style.display = 'block';
    } else {
        document.getElementById('adminLink').style.display = 'none';
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    currentUser = null;
    cart = [];
    document.getElementById('authLink').textContent = 'Login';
    document.getElementById('authLink').onclick = () => showSection('auth');
    document.getElementById('adminLink').style.display = 'none';
    updateCartCount();
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
            <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400'">
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
}

// Display cart items
function displayCartItems() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">Your cart is empty. Add some products!</p>';
        cartTotal.textContent = '0';
        return;
    }
    
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
    displayCartItems();
}

// Remove from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
    displayCartItems();
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
    displayCartItems();
    showSection('products');
}

// Admin: Add product
async function addAdminProduct(event) {
    event.preventDefault();
    
    const productData = {
        name: document.getElementById('adminProductName').value,
        description: document.getElementById('adminProductDesc').value,
        price: parseInt(document.getElementById('adminProductPrice').value),
        category: document.getElementById('adminProductCategory').value,
        image: document.getElementById('adminProductImage').value,
        brand: document.getElementById('adminProductBrand').value,
        stock: 10,
        rating: 4.5
    };

    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('http://localhost:5000/api/admin/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            alert('Product added successfully!');
            event.target.reset();
            loadProducts();
        } else {
            alert('Failed to add product');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Error adding product');
    }
}

// Auth functions
async function registerUser(event) {
    event.preventDefault();
    
    const userData = {
        name: document.getElementById('registerName').value,
        email: document.getElementById('registerEmail').value,
        password: document.getElementById('registerPassword').value
    };

    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            document.getElementById('authLink').textContent = 'Logout';
            document.getElementById('authLink').onclick = logout;
            checkAdminStatus();
            showSection('products');
            alert('Registration successful!');
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Registration failed:', error);
        alert('Registration failed. Please try again.');
    }
}

async function loginUser(event) {
    event.preventDefault();
    
    const userData = {
        email: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value
    };

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            document.getElementById('authLink').textContent = 'Logout';
            document.getElementById('authLink').onclick = logout;
            checkAdminStatus();
            showSection('products');
            alert('Login successful!');
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Login failed:', error);
        alert('Login failed. Please try again.');
    }
}