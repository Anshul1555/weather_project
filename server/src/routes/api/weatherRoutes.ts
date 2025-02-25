import { Router, type Request, type Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// POST Request with city name to retrieve weather data
router.post('/', async (req: Request, res: Response) => {
  const city = req.body.cityName; 
  if (!city) {
    return res.status(400).json({ error: 'City name is required' });
  }

  try {
    console.log('Received city:', city);
    const response = await WeatherService.getWeatherForCity(city); // Pass city correctly

    // console.log('Current Weather:', response.currentWeather);
    // console.log('Forecast Weather:', response.forecast);

    res.json(response);

    await HistoryService.addCity(city);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'Error fetching weather data' });
  }
});

// GET search history
router.get('/history', async (_req: Request, res: Response) => {
  try {
    const cities = await HistoryService.getCities();
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching search history' });
  }
});

// DELETE city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    const success = await HistoryService.removeCity(id);
    if (success) {
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error deleting city from history' });
  }
});

export default router;