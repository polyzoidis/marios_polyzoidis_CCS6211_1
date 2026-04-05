import cities from "./cities"

const cardsContainer = document.getElementById("cardsContainer")

const cityList = Object.values(cities)

function getWeatherCondition(code) {
	if (code === 0) return { label: "Clear sky", icon: "☀️" }
	if (code === 1) return { label: "Mainly clear", icon: "🌤️" }
	if (code === 2) return { label: "Partly cloudy", icon: "⛅" }
	if (code === 3) return { label: "Overcast", icon: "☁️" }
	if (code <= 9) return { label: "Foggy", icon: "🌫️" }
	if (code <= 19) return { label: "Drizzle", icon: "🌦️" }
	if (code <= 29) return { label: "Thunderstorm", icon: "⛈️" }
	if (code <= 39) return { label: "Blowing snow", icon: "🌨️" }
	if (code <= 49) return { label: "Fog", icon: "🌫️" }
	if (code <= 59) return { label: "Drizzle", icon: "🌦️" }
	if (code <= 69) return { label: "Rain", icon: "🌧️" }
	if (code <= 79) return { label: "Snow", icon: "❄️" }
	if (code <= 84) return { label: "Rain showers", icon: "🌦️" }
	if (code <= 86) return { label: "Snow showers", icon: "🌨️" }
	if (code <= 94) return { label: "Thunderstorm", icon: "⛈️" }
	if (code <= 99) return { label: "Thunderstorm with hail", icon: "🌩️" }
	return { label: "Unknown", icon: "🌡️" }
}

function showSkeletons() {
	cardsContainer.innerHTML = ""

	for (let i = 0; i < cityList.length; i++) {
		const skeleton = document.createElement("div")
		skeleton.classList.add("card", "skeleton-card")

		skeleton.innerHTML = `
            <div class="line title"></div>
            <div class="line temp"></div>
            <div class="line wind"></div>
        `

		cardsContainer.appendChild(skeleton)
	}
}

showSkeletons()

async function getWeather(city) {
	try {
		const response = await fetch(
			`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true`,
		)

		if (!response.ok) {
			throw new Error("Failed to fetch weather data")
		}

		const data = await response.json()

		console.log(`${city.name} weather data:`, data)

		return data
	} catch (error) {
		console.error("Error:", error)
		return null
	}
}

async function renderSingleCard(city, data, index) {
	const card = document.createElement("div")
	card.classList.add("card")

	if (data === null) {
		card.classList.add("error-card")
		card.innerHTML = `
            <img class="city-image" src="${city.cityPicSrc}" alt="${city.name}" />
			<div class="city-info-section">
				<div class="city-and-temp-container">
					<div class="city-and-country-container">
						<p class="city-name">${city.name}</p>

						<div class="country-name-icon">
							<p class="country-name">${city.country}</p>
							<img class="country-icon" src="${city.countryIconSrc}" alt="${city.country} flag icon" />
						</div>
					</div>
				</div>

				<hr class="card-divider" />

				<p class="error-message">Couldn't load weather data</p>
				<button class="retry-btn">Retry</button>
			</div>
        `

		card.querySelector(".retry-btn").addEventListener("click", async () => {
			card.classList.add("skeleton-card")
			card.innerHTML = `
				<div class="line title"></div>
				<div class="line temp"></div>
				<div class="line wind"></div>
			`

			const result = await getWeather(city)
			const newCard = await renderSingleCard(city, result, index)
			card.replaceWith(newCard)
		})
	} else {
		const { temperature: temp, windspeed: wind } = data.current_weather
		const condition = getWeatherCondition(data.current_weather.weathercode)

		card.innerHTML = `
            <img class="city-image" src="${city.cityPicSrc}" alt="${city.name}" />
			<div class="city-info-section">
				<div class="city-and-temp-container">
					<div class="city-and-country-container">
						<p class="city-name">${city.name}</p>

						<div class="country-name-icon">
							<p class="country-name">${city.country}</p>
							<img class="country-icon" src="${city.countryIconSrc}" alt="${city.country} flag icon" />
						</div>
					</div>

					<div class="temp-outer-container">
						<img class="temp-icon" src="${temp > 20 ? "../assets/svgs/thermometer-hot.svg" : "../assets/svgs/thermometer-cold.svg"}" alt="Temperature icon" />

						<div class="temp-container">
							<p class="temp">${temp}</p>
							<p class="temp-label">°C</p>
						</div>
					</div>
				</div>

				<hr class="card-divider" />

				<div class="condition-wind-container">
					<div class="condition-name-icon-container">
						<p class="condition-name">${condition.label}</p>
						<span class="condition-icon">${condition.icon}</span>
					</div>

					<div class="wind-container">
						<img class="wind-icon" src="../assets/svgs/wind-icon.svg" alt="Wind icon" />
						<p class="wind-label">${wind}</p>
						<p class="wind-unit">km/h</p>
					</div>
				</div>
			</div>
        `
	}

	return card
}

async function renderCards() {
	const results = await Promise.all(cityList.map((city) => getWeather(city)))

	cardsContainer.innerHTML = ""

	const cards = await Promise.all(
		cityList.map((city, index) =>
			renderSingleCard(city, results[index], index),
		),
	)

	cards.forEach((card) => cardsContainer.appendChild(card))
}

renderCards()
