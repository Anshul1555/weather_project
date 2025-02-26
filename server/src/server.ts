import dotenv from 'dotenv';
import express from 'express';
import { fileURLToPath } from 'url';  
import { dirname } from 'path'; 
dotenv.config();

// Import the routes
import routes from './routes/index.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3001;

// Serve static files from the client dist folder
app.use(express.static('../client/dist'));

// Parse JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect routes
app.use(routes);


// Start the server
app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));
