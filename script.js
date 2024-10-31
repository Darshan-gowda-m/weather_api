const apiKey = "ca2fe43d863ed51fe960d156027299b9";

async function findUserLocation() {
    const location = document.getElementById("user-location").value || "Bengaluru"; 
    const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`);

    if (!weatherResponse.ok) {
        alert("Location not found");
        return;
    }

    const weatherData = await weatherResponse.json();
    const { lon, lat } = weatherData.coord;

    // Display current weather
    displayCurrentWeather(weatherData);
  
    // Fetch UV Index
    fetchUVIndex(lat, lon);

    // Fetch 3-hour forecast for the next 5 days
    const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    const forecastData = await forecastResponse.json();

   
    displayForecast(forecastData);
}

// Function to fetch and display UV Index
async function fetchUVIndex(lat, lon) {
    try {
        const uvResponse = await fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`);
        const uvData = await uvResponse.json();

        document.getElementById("UVValue").innerText = uvData.value;
    } catch (error) {
        console.error("Error fetching UV index:", error);
        document.getElementById("UVValue").innerText = "N/A";
    }
}

// Function to convert temperatures
function convertTemperature(temp, unit) {
    return unit === 'Fahrenheit' ? Math.round((temp * 9 / 5) + 32) : Math.round(temp);
}

// Function to display current weather data in the UI
function displayCurrentWeather(data) {
    const unit = document.getElementById("convertor").value; 
    document.querySelector(".temperature").innerText = `${convertTemperature(data.main.temp, unit)}°${unit === 'Fahrenheit' ? 'F' : 'C'}`;
    document.querySelector(".feelsLike").innerText = `Feels like: ${convertTemperature(data.main.feels_like, unit)}°${unit === 'Fahrenheit' ? 'F' : 'C'}`;
    document.querySelector(".description").innerText = data.weather[0].description;
    document.querySelector(".city").innerText = `${data.name}, ${data.sys.country}`;
    document.getElementById("HValue").innerText = `${data.main.humidity}%`;
    document.getElementById("WValue").innerText = `${data.wind.speed} m/s`;
    document.getElementById("CValue").innerText = `${data.clouds.all}%`;
    document.getElementById("PValue").innerText = `${data.main.pressure} hPa`;

    
    const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById("SRValue").innerText = sunriseTime+"(IST)";
    document.getElementById("SSValue").innerText = sunsetTime+"(IST)";

   
    const weatherIcon = document.querySelector(".weatherIcon");
    weatherIcon.style.background = `url(https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png)`;
    weatherIcon.style.backgroundSize = 'cover';
}

// Function to display the daily forecast data
function displayForecast(data) {
    const forecastContainer = document.querySelector(".forecast");
    forecastContainer.innerHTML = "";

    const dailyForecasts = {};

    data.list.forEach(forecast => {
        const date = new Date(forecast.dt * 1000).toLocaleDateString();
        if (!dailyForecasts[date]) {
            dailyForecasts[date] = {
                maxTemp: -Infinity,
                minTemp: Infinity,
                description: forecast.weather[0].description, 
                icon: forecast.weather[0].icon 
            };
        }

        
        dailyForecasts[date].maxTemp = Math.max(dailyForecasts[date].maxTemp, forecast.main.temp_max);
        dailyForecasts[date].minTemp = Math.min(dailyForecasts[date].minTemp, forecast.main.temp_min);
    });

    // Create a forecast summary for each day
    const unit = document.getElementById("convertor").value; 
    for (const date in dailyForecasts) {
        const { maxTemp, minTemp, description, icon } = dailyForecasts[date];

        const forecastDiv = document.createElement("div");
        forecastDiv.classList.add("forecast-card");
        forecastDiv.innerHTML = `
            <h3>${date}</h3>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" />
            <p>Max Temp: ${convertTemperature(maxTemp, unit)}°${unit === 'Fahrenheit' ? 'F' : 'C'}</p>
            <p>Min Temp: ${convertTemperature(minTemp, unit)}°${unit === 'Fahrenheit' ? 'F' : 'C'}</p>
            <p>Weather: ${description}</p>
        `;

        forecastContainer.appendChild(forecastDiv);
    }
}



document.addEventListener("DOMContentLoaded", () => {
    findUserLocation();
});
