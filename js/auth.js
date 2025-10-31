// Register user
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

// Login user
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