import cities from "./cities"

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
	}
}

async function renderCards() {
	const container = document.getElementById("cardsContainer")

	for (const key in cities) {
		const city = cities[key]

		const data = await getWeather(city)

		const temp = data.current_weather.temperature
		const wind = data.current_weather.windspeed

		const card = document.createElement("div")
		card.classList.add("card")

		card.innerHTML = `
                        <h3>${city.name}</h3>
                        <h4>${city.country}</h4>
                        <p>${temp}°C</p>
                        <p>Wind: ${wind} km/h</p>
                    `

		container.appendChild(card)
	}
}

renderCards()
