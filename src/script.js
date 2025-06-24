document.addEventListener("DOMContentLoaded", () => {
  showDefaultForecast();
});

// ==================== 🌐 API SETUP ====================
const apiKey = "c84008e0396553d21a7ee88e80f882e1";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";

// ==================== 🏷️ DOM Elements ====================
const form = document.getElementById("search-form");
const input = document.getElementById("location-input");
const cityNameEl = document.getElementById("city-name");
const tempValueEl = document.getElementById("temperature-value");
const weatherIconEl = document.getElementById("weather-icon");
const dayNameEl = document.getElementById("day-name");
const medievalTimeEl = document.getElementById("medieval-time");
const descriptionEl = document.getElementById("weather-description");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind-speed");
const feelsLikeEl = document.getElementById("feels-like");
const forecastListEl = document.getElementById("forecast-list");

// ==================== 📅 MEDIEVAL DAY NAMES ====================
const medievalDays = [
  "Sun's Day",
  "Moonday",
  "Tiw’s Day",
  "Woden’s Day",
  "Thor’s Day",
  "Frigg’s Day",
  "Saturn’s Day",
];

// ==================== 📝 MEDIEVAL STYLE PHRASES ====================
const poeticPhrases = [
  "The skies were calm and the breeze gentle.",
  "Clouds meandered like sheep across the heavens.",
  "A drizzle did grace the land with coolness.",
  "Thunder roared like distant dragons.",
  "The sun did shine with regal brilliance.",
  "Winds whispered secrets of the north.",
  "Dark clouds threatened but broke no storm.",
];

// ==================== 🏙️ DEFAULT VALUES ====================
const DEFAULT_CITY = "Tokyo";
const DEFAULT_TEMP = 28;
const DEFAULT_HUMIDITY = 52;
const DEFAULT_WIND = 9;
const DEFAULT_FEELS_LIKE = 30;

// ==================== ⏳ MEDIEVAL TIME FORMATTER ====================
function getMedievalTime(date) {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const hourNames = [
    "Midnight",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Noon",
  ];
  if (minute === 0) return `the ${hourNames[hour % 12]} hour`;
  if (minute === 15) return `a Quarter past ${hourNames[hour % 12]}`;
  if (minute === 30) return `Half past ${hourNames[hour % 12]}`;
  if (minute === 45) return `a Quarter to ${hourNames[(hour + 1) % 12]}`;
  return minute < 30
    ? `${minute} minutes past ${hourNames[hour % 12]}`
    : `${60 - minute} minutes to ${hourNames[(hour + 1) % 12]}`;
}

// ==================== 🌦️ WEATHER ICON MAPPING ====================
const weatherIconMap = {
  clear: "brightness_5",
  cloud: "cloud",
  rain: "rainy",
  thunder: "thunderstorm",
  snow: "ac_unit",
  mist: "foggy",
  fog: "foggy",
};

function getWeatherIcon(desc) {
  const d = desc.toLowerCase();
  for (const key in weatherIconMap) {
    if (d.includes(key)) return weatherIconMap[key];
  }
  return "help";
}

// ==================== 🧙‍♂️ DEFAULT FORECAST ====================
function showDefaultForecast() {
  // Main weather section defaults
  cityNameEl.textContent = DEFAULT_CITY;
  tempValueEl.textContent = `${DEFAULT_TEMP}°C`;
  weatherIconEl.textContent = "brightness_5";
  dayNameEl.textContent = medievalDays[new Date().getDay()];
  medievalTimeEl.textContent = getMedievalTime(new Date());
  descriptionEl.textContent = "clear skies";
  humidityEl.textContent = DEFAULT_HUMIDITY;
  windEl.textContent = DEFAULT_WIND;
  feelsLikeEl.textContent = DEFAULT_FEELS_LIKE;

  // WEEKLY FORECAST DEFAULTS
  forecastListEl.innerHTML = "";
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const day = medievalDays[date.getDay()];
    const min = 15 + i;
    const max = 22 + i;
    const icon = i % 2 === 0 ? "brightness_5" : "cloud";
    const phrase = poeticPhrases[i % poeticPhrases.length];

    const box = document.createElement("li");
    box.className = "forecast-box";
    box.innerHTML = `
<span class="material-symbols-outlined">${icon}</span>
    <span class="day-name">${day}</span>
    <p class="forecast-paragraph">${phrase}</p>
    <span class="temp">${min}°C / ${max}°C</span>
  `;
    forecastListEl.appendChild(box);
  }
}

// ==================== 🌡️ UPDATE MAIN WEATHER ====================
function updateMainWeather(data) {
  const now = new Date();
  cityNameEl.textContent = data.name;
  tempValueEl.textContent = `${Math.round(data.main.temp)}°C`;
  weatherIconEl.textContent = getWeatherIcon(data.weather[0].description);
  dayNameEl.textContent = medievalDays[now.getDay()];
  medievalTimeEl.textContent = getMedievalTime(now);
  descriptionEl.textContent = data.weather[0].description;
  humidityEl.textContent = data.main.humidity;
  windEl.textContent = Math.round(data.wind.speed * 3.6);
  feelsLikeEl.textContent = Math.round(data.main.feels_like);
}

// ==================== 📆 UPDATE FORECAST BOXES ====================
function updateForecastBoxes(data) {
  forecastListEl.innerHTML = "";
  const daily = data.list.filter((i) => i.dt_txt.includes("12:00:00"));

  daily.forEach((item, index) => {
    const date = new Date(item.dt * 1000);
    const day = medievalDays[date.getDay()];
    const min = Math.round(item.main.temp_min);
    const max = Math.round(item.main.temp_max);
    const icon = getWeatherIcon(item.weather[0].description);
    const phrase = poeticPhrases[index % poeticPhrases.length];

    const box = document.createElement("li");
    box.className = "forecast-box";
    box.innerHTML = `
  <span class="material-symbols-outlined">${icon}</span>
  <span class="day-name">${day}</span>
  <p class="forecast-paragraph">${phrase}</p>
  <span class="temp">${min}°C / ${max}°C</span>
`;
    forecastListEl.appendChild(box);
  });
}

// ==================== 🔍 SEARCH HANDLER ====================
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = input.value.trim();
  if (!city) return;

  try {
    const [weatherRes, forecastRes] = await Promise.all([
      fetch(`${apiUrl}?q=${city}&units=metric&appid=${apiKey}`),
      fetch(`${forecastUrl}?q=${city}&units=metric&appid=${apiKey}`),
    ]);

    const weatherData = await weatherRes.json();
    const forecastData = await forecastRes.json();

    if (weatherData.cod !== 200 || forecastData.cod !== "200") {
      alert("⚠️ Alas! That place could not be found.");
      return;
    }

    updateMainWeather(weatherData);
    updateForecastBoxes(forecastData);
  } catch (err) {
    alert(
      "⚡ The scroll crackled – something went wrong. Try again, brave one."
    );
    console.error(err);
  }
});
