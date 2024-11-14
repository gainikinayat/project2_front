const openWeatherApiKey = '1a2f4d4a125c8ccef71c47411aaf8f26';

// Function to fetch current weather data for a given city
async function fetchCurrentWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${openWeatherApiKey}&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        displayCurrentWeather(data); // Call a function to display weather data
    } catch (error) {
        console.error('Error fetching current weather data:', error);
        alert('Error fetching current weather data. Please try again.');
    }
}



// Function to display current weather data
function displayCurrentWeather(data) {
    const tempDiv = document.getElementById('temp-div');
    const weatherInfoDiv = document.getElementById('weather-info');
    const weatherIcon = document.getElementById('weather-icon');

    // Clear previous content
    tempDiv.innerHTML = '';
    weatherInfoDiv.innerHTML = '';

    if (data.cod === '404') {
        weatherInfoDiv.innerHTML = `<p>${data.message}</p>`;
    } else {
        const temperature = Math.round(data.main.temp);
        const humidity = data.main.humidity;
        const windSpeed = data.wind.speed;
        const description = data.weather[0].description;
        const iconCode = data.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

        // Populate data
        tempDiv.innerHTML = `<p>${temperature}°C</p>`;
        weatherInfoDiv.innerHTML = `
            <p>Condition: ${description}</p>
            <p>Humidity: ${humidity}%</p>
            <p>Wind Speed: ${windSpeed} m/s</p>
        `;
        weatherIcon.src = iconUrl;
        weatherIcon.alt = description;
        weatherIcon.style.display = 'block'; // Make the icon visible
    }
}



// Event listener to fetch weather data when a city is selected
document.getElementById('city').addEventListener('change', function() {
    const city = this.value;
    if (city) {
        fetchCurrentWeather(city);
        fetchFiveDayForecast(city);
    }
});
