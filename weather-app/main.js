import cities from "./cities"

const cardsContainer = document.getElementById("cardsContainer")

const cityList = Object.values(cities)

function getWeatherCondition(code) {
	if (code === 0) return "Clear sky"
	if (code === 1) return "Mainly clear"
	if (code === 2) return "Partly cloudy"
	if (code === 3) return "Overcast"
	if (code <= 9) return "Foggy"
	if (code <= 19) return "Drizzle"
	if (code <= 29) return "Thunderstorm"
	if (code <= 39) return "Blowing snow"
	if (code <= 49) return "Fog"
	if (code <= 59) return "Drizzle"
	if (code <= 69) return "Rain"
	if (code <= 79) return "Snow"
	if (code <= 84) return "Rain showers"
	if (code <= 86) return "Snow showers"
	if (code <= 94) return "Thunderstorm"
	if (code <= 99) return "Thunderstorm with hail"
	return "Unknown"
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
				<div class="city-country-icon-line">
					<p class="city-name">${city.name}</p>

					<div class="country-name-icon">
						<p class="country-name">${city.country}</p>
					</div>
				</div>

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
				<div class="city-country-icon-line">
					<p class="city-name">${city.name}</p>

					<div class="country-name-icon">
						<p class="country-name">${city.country}</p>
						<img class="country-icon" src="${city.countryIconSrc}" alt="${city.country} flag icon" />
					</div>
				</div>

				<p class="temp">${temp}°C</p>
				<p class="condition">${condition}</p>
				<p class="wind">Wind: ${wind} km/h</p>
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
