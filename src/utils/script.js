const socket = io("http://localhost:5000", {
    auth: {
        cookie: document.cookie
    }
});

// Access DOM elements
const messages = document.getElementById('messages');
const form = document.getElementById('form');
const input = document.getElementById('input');
const logout = document.getElementById('logout');
const clear = document.getElementById('clear');

// Log document cookies for debugging
console.log(document.cookie);

// Fetch weather data
fetch('https://api.weatherapi.com/v1/current.json?key=b3561c41d0154b909ff135649231806&q=Kyiv&aqi=no')
    .then(response => response.json())
    .then(weather => {
        console.log(weather);
        console.log(weather.current);

        // Update the weather details in the UI
        document.getElementById('icon').src = "https:" + weather.current.condition.icon;
        document.getElementById('city').textContent = `${weather.location.country}, ${weather.location.name}`;
        document.getElementById('temp').textContent = `${weather.current.temp_c}°C`;
    })
    .catch(() => {
        alert("There was an error fetching the weather data.");
    });

// Show the "clear" button only if the cookie contains "antony"
if (document.cookie.includes("antony")) {
    clear.style.visibility = 'visible';
}

// Logout functionality
logout.addEventListener('click', () => {
    document.cookie = 'token=; Max-Age=0';
    location.assign('/login');
});

// Clear messages functionality
clear.addEventListener('click', () => {
    if (document.cookie.includes("antony")) {
        socket.emit('clear_messages');  // Send event to server
        messages.innerHTML = '';  // Clear the messages from the DOM
    } else {
        alert("Access denied!");
    }
});

// Send a new message when the form is submitted
form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value.trim()) {
        socket.emit('new_message', { message: input.value });  // Emit message to server
        input.value = '';  // Clear the input field
    }
});

// Listen for incoming messages from the server
socket.on('message', (msg) => {
    const item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);  // Auto-scroll to the bottom
});

// Listen for all messages event from the server and display them
socket.on('all_messages', (msgArray) => {
    msgArray.forEach(msg => {
        const item = document.createElement('li');
        item.textContent = `${msg.login}: ${msg.content}`;
        messages.appendChild(item);
    });
    window.scrollTo(0, document.body.scrollHeight);  // Auto-scroll to the bottom
});
