// Dark Mode Triggered by Click
const themeToggle = document.querySelector('#flexSwitchCheckChecked');
themeToggle.addEventListener('click', changeTheme);

// User Theme Preference
const userTheme = localStorage.getItem('theme');
if (userTheme === 'dark') {
	themeToggle.click();
}

// Dark Mode Theme Change
function changeTheme() {
	const body = document.querySelector('body');

	body.classList.toggle('dark');

	if (body.classList.contains('dark')) {
		localStorage.setItem('theme', 'dark');
	} else {
		localStorage.setItem('theme', 'light');
	}
}

// Variables for API & Location Heading
const apiKey = 'OPENWEATHERAPI-KEY';
const apiWeather = 'https://api.openweathermap.org/data/2.5/weather';
const apiOneCall = 'https://api.openweathermap.org/data/2.5/onecall';
let units = 'imperial';
const locationHeading = document.querySelector('#location');
const geolocationButton = document.querySelector('#geolocation-btn');

// User Location Preference
const userLocation = localStorage.getItem('location');
if (userLocation) {
	updateWeatherByName(userLocation);
} else {
	updateWeatherByName('New York');
}

// Call API by City Name
function updateWeatherByName(location) {
	axios
		.get(`${apiWeather}?q=${location}&appid=${apiKey}&units=${units}`)
		.then(displayCurrentTemperature, function () {
			alert(
				'There was a problem with your request! Try again or check back later.'
			);
		});
}

// Call API for Daily Forecast
function getForecast(coordinates) {
	axios
		.get(
			`${apiOneCall}?lat=${coordinates.lat}&lon=${coordinates.lon}&exclude=minutely,hourly,alerts&appid=${apiKey}&units=${units}`
		)
		.then(displayForecast);
}

// Call API by Geolocation
geolocationButton.addEventListener('click', function () {
	navigator.geolocation.getCurrentPosition(getLocation);
});

function getLocation(position) {
	const lon = position.coords.longitude;
	const lat = position.coords.latitude;

	axios
		.get(`${apiWeather}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`)
		.then(displayCurrentTemperature);
}

// Call API by Search Functionality
function searchCity(event) {
	event.preventDefault();
	const searchInput = document.querySelector('#search-input').value;
	if (searchInput) {
		updateWeatherByName(searchInput);
	}
}

const searchBtn = document.querySelector('.search-form');
searchBtn.addEventListener('submit', searchCity);

// Change Temperature Type & Formula to Toggle Between C & F Values
const allTemps = document.querySelectorAll('#temp-now, .temps, .faded-temp');
const fahrenheit = document.querySelectorAll('.fahrenheit');
const celsius = document.querySelector('.celsius');
const windUnit = document.querySelector('#wind-unit');

function toggleTemp(event) {
	event.preventDefault();
	if (celsius.innerHTML === 'C') {
		celsius.innerHTML = 'F';
		fahrenheit.forEach(el => (el.innerHTML = 'C'));
		allTemps.forEach(
			el => (el.textContent = Math.round((el.innerHTML - 32) * (5 / 9)))
		);
		windUnit.innerHTML = `km/h`;
		units = 'metric';
	} else if (celsius.innerHTML === 'F') {
		celsius.innerHTML = 'C';
		fahrenheit.forEach(el => (el.innerHTML = 'F'));
		allTemps.forEach(
			el => (el.textContent = Math.round(el.innerHTML * (9 / 5) + 32))
		);
		windUnit.innerHTML = `mph`;
		units = 'imperial';
	}
	// Update Data to Reflect Celsius or Fahrenheit Change
	updateWeatherByName(locationHeading.textContent);
}

celsius.addEventListener('click', toggleTemp);

// Variables for Elements Representing Data
const currentTemp = document.querySelector('#temp-now');
const highTemp = document.querySelector('#high-temp');
const lowTemp = document.querySelector('#low-temp');
const feelsLikeTemp = document.querySelector('#feels-like');
const tempDescription = document.querySelector('#description-temp');
const wind = document.querySelector('#wind');
const humidity = document.querySelector('#humidity');
const visibility = document.querySelector('#visibility');
const clouds = document.querySelector('#clouds');
const sunrise = document.querySelector('#sunrise-time');
const sunset = document.querySelector('#sunset-time');
const scenery = document.querySelector('#scenery');
const conditionMsg = document.querySelector('#condition-msg');
const todaysDate = document.querySelector('#today');

// Display Temperature
function displayCurrentTemperature(response) {
	if (response.status == 200) {
		const data = response.data;

		// Update Weather Details
		displayWeatherDetails(data);

		// Render Icon for Main Card
		renderIcons(
			document,
			data.weather[0].id,
			data.weather[0].icon,
			`.default-main-icon`
		);

		// Weather Condition Message Indicator
		displayWeatherCondition(data.weather[0].main);

		// Daily Forecast Function
		getForecast(response.data.coord);

		// Current Time/Date to Location
		const localDateObject = new Date().getTime();
		displayLocalDate(data, localDateObject);

		// Sunset/Sunrise
		const apiSunrise = data.sys.sunrise * 1000;
		const apiSunset = data.sys.sunset * 1000;
		displaySunsetSunriseTime(data, localDateObject, apiSunrise, apiSunset);

		// Local Storage
		localStorage.setItem('location', `${data.name}`);
	}
}

// Get Local Date Object for Searched Cities
function localDate(unix, timezone) {
	const date = new Date();
	const timestamp = unix;
	const offset = date.getTimezoneOffset() * 60000;
	const utc = timestamp + offset;
	const updatedDate = new Date(utc + 1000 * timezone);
	return updatedDate;
}

// Format Local Date Objects to Strings
function formatDate(object, options, method) {
	if (method === 'toLocaleString') {
		return object.toLocaleString([], options);
	}

	if (method === 'toLocaleDateString') {
		return object.toLocaleDateString([], options);
	}
}

// Display Local Date
function displayLocalDate(data, dateObject) {
	const localDateString = formatDate(
		localDate(dateObject, data.timezone),
		{
			weekday: 'long',
			month: 'long',
			day: 'numeric',
		},
		'toLocaleDateString'
	);
	const localTimeString = localDate(dateObject, data.timezone).toLocaleString(
		[],
		{
			hour: '2-digit',
			minute: '2-digit',
			hour12: true,
		}
	);
	todaysDate.innerHTML = `${localTimeString} at ${localDateString}`;
}

// Handle sunset/sunrise
function displaySunsetSunriseTime(
	data,
	localDateObject,
	sunriseTime,
	sunsetTime
) {
	sunrise.innerHTML = formatDate(
		localDate(sunriseTime, data.timezone),
		{
			hour: '2-digit',
			minute: '2-digit',
			hour12: true,
		},
		'toLocaleString'
	);
	sunset.innerHTML = formatDate(
		localDate(sunsetTime, data.timezone),
		{
			hour: '2-digit',
			minute: '2-digit',
			hour12: true,
		},
		'toLocaleString'
	);

	const sunriseHour = localDate(sunriseTime, data.timezone).getHours();
	const sunsetHour = localDate(sunsetTime, data.timezone).getHours();

	if (
		localDate(localDateObject, data.timezone).getHours() < sunriseHour ||
		localDate(localDateObject, data.timezone).getHours() >= sunsetHour
	) {
		scenery.src = '/assets/night-landscape.png';
		scenery.alt = 'Night landscape';
	} else {
		scenery.src = '/assets/day-landscape.png';
		scenery.alt = 'Day landscape';
	}
}

function displayWeatherDetails(data) {
	locationHeading.innerHTML = `${data.name}, ${data.sys.country}`;
	currentTemp.innerHTML = `${Math.round(data.main.temp)}`;
	highTemp.innerHTML = `${Math.round(data.main.temp_max)}`;
	lowTemp.innerHTML = `${Math.round(data.main.temp_min)}`;
	feelsLikeTemp.innerHTML = `${Math.round(data.main.feels_like)}`;
	tempDescription.innerHTML = `${data.weather[0].description}`;
	wind.innerHTML = `${Math.round(data.wind.speed)}`;
	humidity.innerHTML = `${data.main.humidity}`;
	visibility.innerHTML = `${Math.round(data.visibility / 1000)}`;
	clouds.innerHTML = `${data.clouds.all}`;
}

function displayWeatherCondition(data) {
	const weatherType = data;

	switch (weatherType) {
		case 'Rain':
		case 'Drizzle':
		case 'Clouds':
			conditionMsg.innerHTML = `<i class="fa-solid fa-umbrella"></i> Umbrella Required`;
			break;
		case 'Thunderstorm':
		case 'Tornado':
			conditionMsg.innerHTML = `<i class="fa-solid fa-cloud-bolt"></i> Stay Indoors`;
			break;
		case 'Snow':
			conditionMsg.innerHTML = `<i class="fa-solid fa-snowflake"></i> Dress Warm`;
			break;
		case 'Clear':
			conditionMsg.innerHTML = `<i class="fa-solid fa-circle-check"></i> Ideal Conditions`;
			break;
		case 'Mist':
		case 'Fog':
		case 'Haze':
			conditionMsg.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Poor Visibility`;
			break;
		default:
			conditionMsg.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Poor Air Quality`;
	}
}

// Display Daily Forecast Data
function displayForecast(response) {
	// Added Dew Point // Original API Call Does Not Support
	const dewPoint = document.querySelector('#dew-point');
	dewPoint.innerHTML = `${Math.round(response.data.current.dew_point)}`;

	// Daily Forecast
	const forecastData = response.data.daily;
	const forecastContainer = document.querySelector('.full-forecast');
	let forecastHTML = '';

	forecastData.forEach(function (day, index) {
		if (index < 7) {
			forecastHTML += `
			<div class="daily m-2 m-md-0">
				<p>${formatDay(day.dt)}</p>
					<img
						src="/assets/loading.svg"
						class="weather-icon forecast-icon mb-2"
						height="45"
						width="50"
						alt="Loading icon"
						id="icon-${index}"
					/>
				<p>
					<span class="temps">${Math.round(day.temp.max)}</span>°
					<span class="fahrenheit">${units === 'metric' ? 'C' : 'F'} 
					</span><br />
					<span class="daily-low">
						<span class="forecast-low temps">${Math.round(
							day.temp.min
						)}</span>°<span class="fahrenheit">${units === 'metric' ? 'C' : 'F'}
					</span>
					</span>
				</p>
			</div>`;
			forecastContainer.innerHTML = forecastHTML;

			renderIcons(
				forecastContainer,
				day.weather[0].id,
				day.weather[0].icon,
				`#icon-${index}`
			);
		}
	});
}

// Format Daily Forecast Unix Timestamps
function formatDay(unix) {
	const date = new Date(unix * 1000);
	const day = date.getDay();
	const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
	return days[day];
}

// Display Temperatures for Global Forecast (Default)
const cityTemps = document.querySelectorAll('.global-temps');
const cityWeatherDesc = document.querySelectorAll('.global-descriptions');
const cityNames = document.querySelectorAll('.global-name');
const countryNames = document.querySelectorAll('.country-name');
const countryRows = document.querySelectorAll('.global-item');
const cities = [
	'Seattle',
	'Rabat',
	'London',
	'Paris',
	'Delhi',
	'Jakarta',
	'Manila',
	'Shanghai',
	'Tokyo',
	'Cairo',
	'Dhaka',
	'New York',
	'Istanbul',
	'Los Angeles',
	'Munich',
	'Dubai',
	'Chile',
	'Florida',
	'Sydney',
];

// Shuffle Array for Randomized Cities
cities.sort(() => Math.random() - 0.5);

// Default Information for Global Forecast Section
function displayGlobalTemperatures() {
	countryRows.forEach(async (item, i) => {
		const response = await axios.get(
			`${apiWeather}?q=${cities[i]}&appid=${apiKey}&units=${units}`
		);
		const data = response.data;

		cityNames[i].innerHTML = `${data.name}`;
		countryNames[i].innerHTML = `${data.sys.country}`;
		cityTemps[i].innerHTML = Math.round(data.main.temp);
		cityWeatherDesc[i].innerHTML = `${data.weather[0].description}`;

		renderIcons(item, data.weather[0].id, data.weather[0].icon, '.global-icon');
	});
}

displayGlobalTemperatures();

const globalContainer = document.querySelector('.global-items-wrapper');
globalContainer.addEventListener('click', event => {
	const clickedEl = event.target.closest('.global-item');
	const clickedCountry = clickedEl.querySelector('.global-name').textContent;
	updateWeatherByName(clickedCountry);
	window.scrollTo({
		top: 0,
		behavior: 'smooth',
	});
});

async function renderIcons(location, dataId, dataIcon, imgEl) {
	const response = await axios.get('icons.json');
	const customIcons = response.data;

	const iconMatch = customIcons.find(
		icon => icon.id === dataId && icon.icon === dataIcon
	);

	if (iconMatch) {
		const icon = location.querySelector(imgEl);
		icon.setAttribute('src', iconMatch.src);
		icon.setAttribute('alt', iconMatch.alt);
	}
}
