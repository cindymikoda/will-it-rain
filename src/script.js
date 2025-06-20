// 🌐 API Setup
const apiKey = "c84008e0396553d21a7ee88e80f882e1";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";

// 🧙 Elements
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

// 🕰️ Medieval Time Converter
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
  let suffix = "";

  if (minute === 0) suffix = `the ${hourNames[hour % 12]} hour`;
  else if (minute === 15) suffix = `a Quarter past ${hourNames[hour % 12]}`;
  else if (minute === 30) suffix = `Half past ${hourNames[hour % 12]}`;
  else if (minute === 45) suffix = `a Quarter to ${hourNames[(hour + 1) % 12]}`;
  else if (minute < 30)
    suffix = `${minute} minutes past ${hourNames[hour % 12]}`;
  else suffix = `${60 - minute} minutes to ${hourNames[(hour + 1) % 12]}`;

  return suffix;
}

// 🌦️ Icons
function getWeatherIcon(description) {
  const d = description.toLowerCase();
  if (d.includes("clear")) return "brightness_5";
  if (d.includes("cloud")) return "cloud";
  if (d.includes("rain")) return "rainy";
  if (d.includes("thunder")) return "thunderstorm";
  if (d.includes("snow")) return "ac_unit";
  if (d.includes("mist") || d.includes("fog")) return "foggy";
  if (d.includes("wind")) return "air";
  return "help";
}

// 📅 Medieval Day
const medievalDays = [
  "Sun's Day",
  "Moonday",
  "Tiw’s Day",
  "Woden’s Day",
  "Thor’s Day",
  "Frigg’s Day",
  "Saturn’s Day",
];

function updateMainWeather(data) {
  const now = new Date();

  cityNameEl.textContent = data.name;
  tempValueEl.textContent = `${Math.round(data.main.temp)}°C`;
  weatherIconEl.textContent = getWeatherIcon(data.weather[0].description);
  dayNameEl.textContent = medievalDays[now.getDay()];
  medievalTimeEl.textContent = getMedievalTime(now);
  descriptionEl.textContent = data.weather[0].description;
  humidityEl.textContent = data.main.humidity;
  windEl.textContent = data.wind.speed;
  feelsLikeEl.textContent = Math.round(data.main.feels_like);
}

function updateForecastBoxes(data) {
  // Clear previous content
  forecastListEl.innerHTML = "";

  // Filter one forecast per day
  const daily = data.list.filter((item) => item.dt_txt.includes("12:00:00"));

  daily.forEach((item, index) => {
    const date = new Date(item.dt * 1000);
    const day = medievalDays[date.getDay()];
    const min = Math.round(item.main.temp_min);
    const max = Math.round(item.main.temp_max);
    const icon = getWeatherIcon(item.weather[0].description);

    const box = document.createElement("li");
    box.className = "forecast-box";
    box.innerHTML = `
      <span class="day-name">${day}</span>
      <span class="material-symbols-outlined">${icon}</span>
      <span class="temp">${min}°C / ${max}°C</span>
    `;
    forecastListEl.appendChild(box);
  });
}

// 🧠 Form Submit
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

    updateMainWeather(weatherData);
    updateForecastBoxes(forecastData);
  } catch (err) {
    alert("The scroll crackled – something went wrong. Try again, brave one.");
    console.error(err);
  }
});
