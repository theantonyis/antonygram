document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const regNew = document.getElementById('reg-new');

    // Helper function for making POST requests
    const postRequest = async (url, data) => {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(errorMessage);
            }

            return await response.text();
        } catch (error) {
            alert(`Error: ${error.message}`);
            throw error;
        }
    };

    // Handle registration form submission
    registerForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const { login, password, passwordRepeat } = registerForm;

        if (password.value !== passwordRepeat.value) {
            return alert('Паролі не співпадають');
        }

        try {
            const message = await postRequest('/api/register', {
                login: login.value,
                password: password.value,
            });
            alert(message);
            window.location.assign('/');
        } catch (error) {
            console.error('Registration error:', error);
        }
    });

    // Handle login form submission
    loginForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const { login, password } = loginForm;

        try {
            const token = await postRequest('/api/login', {
                login: login.value,
                password: password.value,
            });

            document.cookie = `token=${token}; path=/`;
            window.location.assign('/');
        } catch (error) {
            console.error('Login error:', error);
        }
    });

    // Redirect to registration page on button click
    regNew?.addEventListener('click', () => {
        window.location.assign('/register');
    });
});
