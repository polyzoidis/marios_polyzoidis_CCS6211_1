import cities from "./cities"

const cardsContainer = document.getElementById("cardsContainer")

const cityList = Object.values(cities)

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
	}
}

async function renderCards() {
	const results = await Promise.all(cityList.map((city) => getWeather(city)))

	cardsContainer.innerHTML = ""

	cityList.forEach((city, index) => {
		const data = results[index]

		const temp = data.current_weather.temperature
		const wind = data.current_weather.windspeed

		const card = document.createElement("div")
		card.classList.add("card")

		card.innerHTML = `
            <h3>${city.name}</h3>
            <p class="temp">${temp}°C</p>
            <p class="wind">Wind: ${wind} km/h</p>
        `

		cardsContainer.appendChild(card)
	})
}

renderCards()
