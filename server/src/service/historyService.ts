import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

// Get the directory name in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Define a City class with name and id properties
class City {
  name: string;
  id: string;
  constructor(name: string, id: string) {
    this.name = name;
    this.id = id;
  }
}

// HistoryService class
class HistoryService {
  // Read method that reads from the searchHistory.json file
  private async read() {
    const filePath = path.join(__dirname, 'searchHistory.json');
    try {
      // Check if the file exists; if not, create it with an empty array
      if (!fs.existsSync(filePath)) {
        await fs.promises.writeFile(filePath, JSON.stringify([]));
      }
      const data = await fs.promises.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading the file:', error);
      return [];
    }
  }

  // Write method that writes the updated cities array to the searchHistory.json file
  private async write(cities: City[]) {
    const filePath = path.join(__dirname, 'searchHistory.json');
    await fs.promises.writeFile(filePath, JSON.stringify(cities, null, 2));
  }

  // Get cities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
  async getCities() {
    const cities = await this.read();
    return cities.map((city: any) => {
      if (typeof city === 'object' && city.name && city.id) {
        return new City(city.name, city.id); // Create a City object with the correct structure
      } else {
        console.warn('Invalid city object format:', city);
        return null;
      }
    }).filter((city: any) => city !== null); // Remove any invalid city objects
  }

  // Add city method that adds a city to the searchHistory.json file
  async addCity(cityName: string) {
    const cities = await this.read();
    const newCity = new City(cityName, uuidv4()); // Create a new City object with the name and id
    cities.push(newCity);
    await this.write(cities);
    return newCity;
  }

  // Remove city method that removes a city from the searchHistory.json file
  async removeCity(id: string) {
    const cities = await this.read();
    const index = cities.findIndex((city: any) => city.id === id);
    if (index === -1) {
      return false;
    }
    cities.splice(index, 1);
    await this.write(cities);
    return true;
  }
}

export default new HistoryService();
