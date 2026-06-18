// =====================================
// WEATHERWISE AI - PREMIUM SCRIPT
// Enhanced with Animated Backgrounds & Premium UX
// =====================================

// ==========================================
// API CONFIGURATION
// ==========================================

const API_KEY = "17a90a1a1280e99aa17180a784d9b521";
const DASHBOARD_CITIES = ["London", "Tokyo", "Dubai", "New York"];

// ==========================================
// DOM ELEMENTS - ORGANIZED
// ==========================================

// Core Elements
const app = {
    // Controls
    controls: {
        cityInput: document.getElementById("cityInput"),
        searchBtn: document.getElementById("searchBtn"),
        locationBtn: document.getElementById("locationBtn"),
        favoriteBtn: document.getElementById("favoriteBtn"),
        voiceBtn: document.getElementById("voiceBtn"),
        themeToggle: document.getElementById("themeToggle"),
    },
    
    // UI Feedback
    feedback: {
        loader: document.getElementById("loader"),
        errorMessage: document.getElementById("errorMessage"),
        animatedBg: document.getElementById("animatedBg"),
    },
    
    // Weather Display
    weather: {
        card: document.getElementById("weatherCard"),
        cityName: document.getElementById("cityName"),
        currentDate: document.getElementById("currentDate"),
        weatherIcon: document.getElementById("weatherIcon"),
        temperature: document.getElementById("temperature"),
        weatherDescription: document.getElementById("weatherDescription"),
        feelsLike: document.getElementById("feelsLike"),
        humidity: document.getElementById("humidity"),
        windSpeed: document.getElementById("windSpeed"),
        pressure: document.getElementById("pressure"),
        visibility: document.getElementById("visibility"),
        sunrise: document.getElementById("sunrise"),
        sunset: document.getElementById("sunset"),
    },
    
    // Forecast
    forecast: {
        section: document.getElementById("forecastSection"),
        hourly: document.getElementById("hourlyForecast"),
        weekly: document.getElementById("weeklyForecast"),
    },
    
    // AI Insights
    ai: {
        section: document.getElementById("aiSection"),
        summary: document.getElementById("weatherSummary"),
        wear: document.getElementById("wearSuggestion"),
        activities: document.getElementById("activitySuggestion"),
        travel: document.getElementById("travelScore"),
    },
    
    // Health & Environment
    health: {
        section: document.getElementById("healthSection"),
        aqi: document.getElementById("aqiCard"),
        uv: document.getElementById("uvCard"),
        comfort: document.getElementById("comfortCard"),
        advice: document.getElementById("healthCard"),
    },
    
    // Multi-City
    multiCity: {
        section: document.getElementById("multiCitySection"),
        dashboard: document.getElementById("multiCityDashboard"),
    },
    
    // History & Favorites
    history: {
        container: document.getElementById("searchHistory"),
        favorites: document.getElementById("favoriteCities"),
    },
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

const state = {
    currentWeatherData: null,
    isDarkMode: localStorage.getItem("theme") === "dark",
};

// ==========================================
// INITIALIZATION
// ==========================================

function init() {
    setupEventListeners();
    initializeTheme();
    renderHistory();
    renderFavorites();
    loadDashboard();
    getCurrentLocation();
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function setupEventListeners() {
    app.controls.searchBtn.addEventListener("click", handleSearch);
    app.controls.cityInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleSearch();
    });
    app.controls.locationBtn.addEventListener("click", getCurrentLocation);
    app.controls.themeToggle.addEventListener("click", toggleTheme);
    app.controls.favoriteBtn.addEventListener("click", saveCurrentCity);
    app.controls.voiceBtn.addEventListener("click", startVoiceSearch);
}

// ==========================================
// SEARCH HANDLING
// ==========================================

function handleSearch() {
    const city = app.controls.cityInput.value.trim();
    if (city) {
        getWeatherByCity(city);
    }
}

async function getWeatherByCity(city) {
    try {
        showLoader();
        
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "City not found");
        }
        
        const data = await response.json();
        state.currentWeatherData = data;
        
        updateWeatherUI(data);
        saveSearch(city);
        updateAnimatedBackground(data.weather[0].main);
        
        // Fetch extended data
        getForecast(data.coord.lat, data.coord.lon);
        getAQI(data.coord.lat, data.coord.lon);
        
        speakWeather(data);
        hideLoader();
        
    } catch (error) {
        showError(error.message);
        hideLoader();
    }
}

// ==========================================
// GEOLOCATION
// ==========================================

function getCurrentLocation() {
    if (!navigator.geolocation) {
        showError("Geolocation is not supported by your browser");
        return;
    }
    
    showLoader();
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            fetchWeatherByCoords(latitude, longitude);
        },
        () => {
            showError("Unable to access your location. Please enable location permission.");
            hideLoader();
        }
    );
}

async function fetchWeatherByCoords(lat, lon) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        
        if (!response.ok) throw new Error("Unable to fetch weather");
        
        const data = await response.json();
        state.currentWeatherData = data;
        
        updateWeatherUI(data);
        updateAnimatedBackground(data.weather[0].main);
        
        // Fetch extended data
        getForecast(lat, lon);
        getAQI(lat, lon);
        
        hideLoader();
        
    } catch (error) {
        showError(error.message);
        hideLoader();
    }
}

// ==========================================
// THEME MANAGEMENT
// ==========================================

function toggleTheme() {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    
    // Animate theme toggle button
    app.controls.themeToggle.style.transform = "rotate(180deg)";
    setTimeout(() => {
        app.controls.themeToggle.style.transform = "";
    }, 300);
}

function initializeTheme() {
    if (state.isDarkMode) {
        document.body.classList.add("dark");
    }
}

// ==========================================
// ANIMATED BACKGROUND
// ==========================================

function updateAnimatedBackground(condition) {
    const bg = app.feedback.animatedBg;
    condition = condition.toLowerCase();
    
    // Clear previous classes
    bg.className = "animated-bg";
    
    if (condition.includes("clear") || condition.includes("sunny")) {
        bg.classList.add("bg-sunny");
        document.body.style.background = "linear-gradient(135deg, #56ccf2, #2f80ed)";
    } else if (condition.includes("cloud")) {
        bg.classList.add("bg-cloudy");
        document.body.style.background = "linear-gradient(135deg, #757f9a, #d7dde8)";
    } else if (condition.includes("rain")) {
        bg.classList.add("bg-rainy");
        document.body.style.background = "linear-gradient(135deg, #232526, #414345)";
    } else if (condition.includes("snow")) {
        bg.classList.add("bg-snow");
        document.body.style.background = "linear-gradient(135deg, #e6dada, #274046)";
    } else if (condition.includes("night")) {
        bg.classList.add("bg-night");
        document.body.style.background = "linear-gradient(135deg, #0a0e27, #1a1f3a)";
    }
}

// ==========================================
// WEATHER UI UPDATE
// ==========================================

function updateWeatherUI(data) {
    // Show/Hide sections
    app.weather.card.classList.remove("hidden");
    app.forecast.section.classList.remove("hidden");
    app.ai.section.classList.remove("hidden");
    app.health.section.classList.remove("hidden");
    app.multiCity.section.classList.remove("hidden");
    app.feedback.errorMessage.classList.add("hidden");
    
    // Update city info
    app.weather.cityName.textContent = `${data.name}, ${data.sys.country}`;
    app.weather.currentDate.textContent = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric"
    });
    
    // Update temperature
    app.weather.temperature.textContent = Math.round(data.main.temp);
    app.weather.weatherDescription.textContent = data.weather[0].description;
    app.weather.feelsLike.textContent = `Feels like ${Math.round(data.main.feels_like)}°C`;
    
    // Update icon
    app.weather.weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    app.weather.weatherIcon.alt = data.weather[0].description;
    
    // Update stats
    app.weather.humidity.textContent = `${data.main.humidity}%`;
    app.weather.windSpeed.textContent = `${data.wind.speed.toFixed(1)} m/s`;
    app.weather.pressure.textContent = `${data.main.pressure} hPa`;
    app.weather.visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    
    // Update sun times
    app.weather.sunrise.textContent = formatTime(data.sys.sunrise);
    app.weather.sunset.textContent = formatTime(data.sys.sunset);
    
    // Generate AI insights
    generateWeatherInsights(data);
}

// ==========================================
// FORECAST
// ==========================================

async function getForecast(lat, lon) {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min&forecast_days=7&timezone=auto`
        );
        
        const data = await response.json();
        renderHourlyForecast(data);
        renderWeeklyForecast(data);
        
    } catch (error) {
        console.error("Forecast error:", error);
    }
}

function renderHourlyForecast(data) {
    app.forecast.hourly.innerHTML = "";
    const hours = data.hourly.time.slice(0, 24);
    const temps = data.hourly.temperature_2m.slice(0, 24);
    
    hours.forEach((hour, index) => {
        const card = document.createElement("div");
        card.className = "forecast-card";
        card.innerHTML = `
            <h4>${hour.split("T")[1]}</h4>
            <p>${Math.round(temps[index])}°C</p>
        `;
        card.setAttribute("role", "listitem");
        app.forecast.hourly.appendChild(card);
    });
}

function renderWeeklyForecast(data) {
    app.forecast.weekly.innerHTML = "";
    
    data.daily.time.forEach((day, index) => {
        const card = document.createElement("div");
        card.className = "forecast-card";
        const date = new Date(day).toLocaleDateString("en-US", { weekday: "short" });
        card.innerHTML = `
            <h4>${date}</h4>
            <p>${Math.round(data.daily.temperature_2m_max[index])}°C</p>
            <small>${Math.round(data.daily.temperature_2m_min[index])}°C</small>
        `;
        card.setAttribute("role", "listitem");
        app.forecast.weekly.appendChild(card);
    });
}

// ==========================================
// AI WEATHER INSIGHTS
// ==========================================

function generateWeatherInsights(data) {
    const temp = data.main.temp;
    const humidity = data.main.humidity;
    const wind = data.wind.speed;
    const condition = data.weather[0].main;
    
    // Summary
    app.ai.summary.innerHTML = `
        Today in <strong>${data.name}</strong>, expect <strong>${condition.toLowerCase()}</strong> 
        conditions with a temperature around <strong>${Math.round(temp)}°C</strong>. 
        ${temp > 25 ? "It's a warm day!" : temp < 5 ? "Quite cold out!" : "Pleasant weather ahead!"}
    `;
    
    // What to Wear
    let wear = "";
    if (temp > 30) {
        wear = `<div>👕 Light cotton clothing</div>
                <div>🕶️ Sunglasses</div>
                <div>🧢 Hat or cap</div>
                <div>💧 Sunscreen & water</div>`;
    } else if (temp > 20) {
        wear = `<div>👕 Comfortable light clothing</div>
                <div>👟 Casual shoes</div>
                <div>😎 Optional sunglasses</div>`;
    } else if (temp > 10) {
        wear = `<div>🧥 Light jacket</div>
                <div>👖 Long pants</div>
                <div>🧣 Optional scarf</div>`;
    } else {
        wear = `<div>🧥 Warm coat/jacket</div>
                <div>🧣 Scarf & gloves</div>
                <div>👢 Warm shoes</div>
                <div>🎩 Beanie or hat</div>`;
    }
    app.ai.wear.innerHTML = wear;
    
    // Activities
    let activities = `<div>✅ Walking</div><div>✅ Photography</div>`;
    
    if (temp < 32 && humidity < 80 && wind < 15) {
        activities += `<div>✅ Running/Cycling</div><div>✅ Outdoor sports</div>`;
    }
    
    if (condition.toLowerCase().includes("rain")) {
        activities += `<div>❌ Hiking</div><div>❌ Beach activities</div>`;
    } else if (temp > 20 && temp < 30) {
        activities += `<div>✅ Hiking</div><div>✅ Picnic</div>`;
    }
    
    app.ai.activities.innerHTML = activities;
    
    // Travel Score
    let score = 10;
    if (temp > 35 || temp < 0) score -= 2;
    if (humidity > 85) score -= 2;
    if (wind > 12) score -= 1;
    if (condition.toLowerCase().includes("rain")) score -= 2;
    
    score = Math.max(1, score);
    app.ai.travel.textContent = `${score}/10`;
}

// ==========================================
// AIR QUALITY & HEALTH
// ==========================================

async function getAQI(lat, lon) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );
        
        const data = await response.json();
        const aqi = data.list[0].main.aqi;
        
        const labels = {
            1: "🟢 Good",
            2: "🟡 Fair",
            3: "🟠 Moderate",
            4: "🔴 Poor",
            5: "🟣 Very Poor"
        };
        
        app.health.aqi.textContent = labels[aqi] || "N/A";
        generateHealthInsights(aqi);
        
    } catch (error) {
        console.error("AQI Error:", error);
    }
}

function generateHealthInsights(aqi) {
    const advice = {
        1: "🌿 Excellent air quality. Perfect for outdoor exercise and activities.",
        2: "😊 Air quality is acceptable. You can safely enjoy outdoor activities.",
        3: "⚠️ Sensitive groups should reduce prolonged outdoor exposure.",
        4: "🚨 Poor air quality. Avoid outdoor activities if sensitive.",
        5: "🚨 Very poor air quality. Stay indoors and use air purifiers."
    };
    
    app.health.advice.innerHTML = advice[aqi] || "Air quality data unavailable";
}

// ==========================================
// MULTI-CITY DASHBOARD
// ==========================================

async function loadDashboard() {
    if (!app.multiCity.dashboard) return;
    
    app.multiCity.dashboard.innerHTML = "";
    
    for (const city of DASHBOARD_CITIES) {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
            );
            
            if (!response.ok) continue;
            
            const data = await response.json();
            const card = document.createElement("div");
            card.className = "city-card";
            card.innerHTML = `
                <h4>${data.name}</h4>
                <div class="city-card-temp">${Math.round(data.main.temp)}°</div>
                <div class="city-card-condition">${data.weather[0].main}</div>
            `;
            card.setAttribute("role", "listitem");
            card.addEventListener("click", () => getWeatherByCity(city));
            app.multiCity.dashboard.appendChild(card);
            
        } catch (error) {
            console.log(`Could not load ${city}`);
        }
    }
}

// ==========================================
// FAVORITES & HISTORY
// ==========================================

function saveSearch(city) {
    let history = JSON.parse(localStorage.getItem("history")) || [];
    
    if (!history.includes(city)) {
        history.unshift(city);
    }
    
    history = history.slice(0, 5);
    localStorage.setItem("history", JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const history = JSON.parse(localStorage.getItem("history")) || [];
    app.history.container.innerHTML = "";
    
    if (history.length === 0) {
        app.history.container.innerHTML = '<p style="color: var(--text-lighter); font-size: 0.9rem;">No search history yet</p>';
        return;
    }
    
    history.forEach(city => {
        const btn = document.createElement("button");
        btn.className = "history-btn";
        btn.textContent = city;
        btn.setAttribute("role", "listitem");
        btn.addEventListener("click", () => getWeatherByCity(city));
        app.history.container.appendChild(btn);
    });
}

function saveCurrentCity() {
    const city = app.weather.cityName.textContent.split(",")[0];
    
    if (city && city !== "City Name") {
        saveFavorite(city);
        showNotification("Added to favorites! ⭐");
    }
}

function saveFavorite(city) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    
    if (!favorites.includes(city)) {
        favorites.push(city);
    }
    
    localStorage.setItem("favorites", JSON.stringify(favorites));
    renderFavorites();
}

function renderFavorites() {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    app.history.favorites.innerHTML = "";
    
    if (favorites.length === 0) {
        app.history.favorites.innerHTML = '<p style="color: var(--text-lighter); font-size: 0.9rem;">No favorites yet. Add one by clicking ⭐</p>';
        return;
    }
    
    favorites.forEach(city => {
        const btn = document.createElement("button");
        btn.className = "favorite-btn";
        btn.textContent = city;
        btn.setAttribute("role", "listitem");
        btn.addEventListener("click", () => getWeatherByCity(city));
        app.history.favorites.appendChild(btn);
    });
}

// ==========================================
// VOICE SEARCH
// ==========================================

function startVoiceSearch() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        showError("Speech recognition is not supported in your browser");
        return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    
    try {
        recognition.start();
        app.controls.voiceBtn.style.opacity = "0.5";
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            app.controls.cityInput.value = transcript;
            getWeatherByCity(transcript);
        };
        
        recognition.onend = () => {
            app.controls.voiceBtn.style.opacity = "1";
        };
        
    } catch (error) {
        console.error("Voice search error:", error);
    }
}

function speakWeather(data) {
    if (!window.speechSynthesis) return;
    
    const text = `The weather in ${data.name} is ${Math.round(data.main.temp)} degrees Celsius with ${data.weather[0].description}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    
    speechSynthesis.speak(utterance);
}

// ==========================================
// UI HELPERS
// ==========================================

function showLoader() {
    app.feedback.loader.classList.remove("hidden");
}

function hideLoader() {
    app.feedback.loader.classList.add("hidden");
}

function showError(message) {
    app.weather.card.classList.add("hidden");
    app.forecast.section.classList.add("hidden");
    app.ai.section.classList.add("hidden");
    app.health.section.classList.add("hidden");
    app.multiCity.section.classList.add("hidden");
    
    app.feedback.errorMessage.classList.remove("hidden");
    app.feedback.errorMessage.textContent = message;
}

function showNotification(message) {
    const notification = document.createElement("div");
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--accent-green);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        font-weight: 600;
        animation: slideDown 0.3s ease-out;
        z-index: 1000;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = "slideUp 0.3s ease-out";
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

function formatTime(unixTime) {
    return new Date(unixTime * 1000).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
}

// ==========================================
// APP START
// ==========================================

window.addEventListener("load", init);

// Optional: Update every 30 minutes
setInterval(() => {
    if (state.currentWeatherData) {
        const city = state.currentWeatherData.name;
        getWeatherByCity(city);
    }
}, 30 * 60 * 1000);
