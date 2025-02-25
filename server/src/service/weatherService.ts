import dotenv from 'dotenv';
dotenv.config();

// Interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// Class for the Weather object
class Weather {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  humidity: number;
  windSpeed: number;
  

  constructor(
    city: string,
    date: string,
    icon: string,
    iconDescription: string,
    tempF: number,
    humidity: number,
    windSpeed: number
  ) {
    this.city = city;
    this.date = date;
    this.icon = icon;
    this.iconDescription = iconDescription;
    this.tempF = tempF;
    this.humidity = humidity;
    this.windSpeed = windSpeed;
  }
}

// Interface for forecast entry data
interface ForecastEntry {
  date: string;
  tempF: number;
  humidity: number;
  weather: string;
  windSpeed: number;
}

// Type for the forecast data returned from the API
interface ForecastAPIResponse {
  list: {
    dt: number;
    main: {
      temp: number;
      humidity: number;
    };
    weather: {
      description: string;
    }[];
    wind: {
      speed: number;
    };
    dt_txt: string;
  }[];
}

// WeatherService class
class WeatherService {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = 'https://api.openweathermap.org/data/2.5';
    this.apiKey = process.env.API_KEY || '';

    if (!this.apiKey) {
      throw new Error('API_KEY is not defined in .env file');
    }
  }

  // Fetch data from the API
  private async fetchData(query: string) {
    try {
      const response = await fetch(query);
      if (!response.ok) {
        throw new Error('City not found or invalid API request');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }

  // Fetch coordinates for a city
  private async fetchCoordinates(city: string): Promise<Coordinates> {
    const query = `${this.baseURL}/weather?q=${city}&appid=${this.apiKey}`;
    console.log('Fetching coordinates with query:', query);

    const data = await this.fetchData(query);
    if (!data.coord) {
      throw new Error('Coordinates not found in API response');
    }

    return { lat: data.coord.lat, lon: data.coord.lon };
  }

  // Fetch current weather data
  private async fetchCurrentWeather(coordinates: Coordinates) {
    const query = `${this.baseURL}/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}`;
    console.log('Fetching current weather with query:', query);

    return await this.fetchData(query);
  }

  // Fetch forecast data
  private async fetchForecast(coordinates: Coordinates): Promise<ForecastAPIResponse> {
    const query = `${this.baseURL}/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&units=metric&appid=${this.apiKey}`;
    console.log('Fetching forecast with query:', query);
  
    const data = await this.fetchData(query);
    if (!data || !Array.isArray(data.list)) {
      throw new Error('Invalid forecast response from API');
    }
    return data;
  }

  // Parse current weather data
  private parseCurrentWeather(data: any): Weather {
    console.log('Parsing current weather data:', data); // Debugging log

    if (!data || !data.name || !data.main || !data.weather) {
      throw new Error('Invalid current weather data structure');
    }

    const { name: cityName, dt: timestamp } = data;
    const { temp: tempF, humidity: humidity } = data.main;
    const { speed: windSpeed } = data.wind;
    const { iconDescription, icon } = data.weather[0];

    const temperature = this.convertKelvinToCelsius(tempF || 0); // Default to 0 if temp is missing
    const wind = windSpeed || 0; // Default to 0 if wind speed is missing
    const iconUrl = icon ? `http://openweathermap.org/img/wn/${icon}@2x.png` : ''; // Default to empty if icon is missing

    return new Weather(
      cityName,
      new Date(timestamp * 1000).toLocaleString(),
      icon,
      iconDescription || 'No description', // Default description if missing
      tempF,
      humidity || 0, // Default humidity if missing
      windSpeed || 0 // Default wind speed if missing
      
    );
  }

  // Parse forecast data
  private parseForecast(forecastData: ForecastAPIResponse): ForecastEntry[] {
    console.log('Parsing forecast data:', forecastData); // Debugging log

    if (!forecastData || !forecastData.list || !Array.isArray(forecastData.list)) {
      throw new Error("Invalid forecast data structure");
    }

    const numberOfDays = 5; // Limit to 5 days
    const forecastEntries: ForecastEntry[] = [];
    const groupedByDay: { [key: string]: ForecastEntry } = {};
    console.log("Forecast:", forecastData.list);
    // Process each forecast entry
    for (const forecast of forecastData.list) {
      const forecastDate = new Date(forecast.dt_txt);
      const dateString = forecastDate.toLocaleDateString(); // Use date string to group by day

      // Only process a new day if it hasn't been processed yet
      if (!(dateString in groupedByDay)) {
        // Add the forecast entry for this day to the groupedByDay object
        groupedByDay[dateString] = {
          date: forecast.dt_txt,
          tempF: forecast.main.temp,
          humidity: forecast.main.humidity,
          weather: forecast.weather[0].description,
          windSpeed: forecast.wind.speed,
        };
      }
      // wind: { speed: 2.99, deg: 289, gust: 7.4 },

      // Stop processing once we have data for 5 days
      if (Object.keys(groupedByDay).length >= numberOfDays) {
        break;
      }
    }

    // Convert the grouped data into an array and return it
    return Object.values(groupedByDay);
  }

  // Convert temperature from Kelvin to Celsius
  private convertKelvinToCelsius(kelvin: number): number {
    return Math.round(kelvin - 273.15);
  }

  // Get weather data for a city
  async getWeatherForCity(cityName: string): Promise<any[]> {
    try {
      console.log(`🔵 Fetching coordinates for city: ${cityName}`);
      const coordinates = await this.fetchCoordinates(cityName);

      
      const currentWeatherData = await this.fetchCurrentWeather(coordinates);

     
      const forecastData = await this.fetchForecast(coordinates);

      

      
      const currentWeather = await this.parseCurrentWeather(currentWeatherData);

      
      const forecast = await this.parseForecast(forecastData);

      // ✅ Convert object response to array format
      return [currentWeather, ...forecast];

    } catch (error) {
      console.error(`❌ Error in getWeatherForCity:`, error);
      throw new Error("Failed to fetch weather data");
    }
  }
}

export default new WeatherService();
