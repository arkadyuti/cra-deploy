const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = 3000;

// MongoDB Connection URL
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/myapp';

// Connect to MongoDB
async function connectToMongo() {
  try {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db('myapp');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return null;
  }
}

// Initialize database and collections
let db;
let visitors;

// Setup routes
app.get('/', async (req, res) => {
  // Track visit
  if (db) {
    try {
      await visitors.updateOne(
        { page: 'home' },
        { $inc: { count: 1 } },
        { upsert: true }
      );
    } catch (err) {
      console.error('Error updating visit count:', err);
    }
  }

  // Get visit count
  let visitCount = 0;
  if (db) {
    try {
      const result = await visitors.findOne({ page: 'home' });
      if (result) {
        visitCount = result.count;
      }
    } catch (err) {
      console.error('Error fetching visit count:', err);
    }
  }

  // Send HTML response
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Node.js App with MongoDB</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 20px;
          background-color: #f4f4f4;
          color: #333;
        }
        .container {
          max-width: 800px;
          margin: 20px auto;
          padding: 20px;
          background: white;
          border-radius: 5px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        h1 {
          color: #2c3e50;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        .card {
          background: #f9f9f9;
          border-left: 4px solid #3498db;
          padding: 15px;
          margin-bottom: 20px;
        }
        .visit-count {
          font-size: 18px;
          font-weight: bold;
          color: #3498db;
          margin: 10px 0;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 0.9em;
          color: #7f8c8d;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Welcome to My Node.js App!</h1>
        
        <div class="card">
          <h2>App Status</h2>
          <p>This app is running with:</p>
          <ul>
            <li>Node.js (Express)</li>
            <li>MongoDB</li>
            <li>Docker Compose</li>
          </ul>
        </div>
        
        <div class="card">
          <h2>Visit Counter</h2>
          <p>This page has been viewed:</p>
          <div class="visit-count">${visitCount} times</div>
          <p>Each refresh increments the counter in MongoDB.</p>
        </div>
        
        <div class="footer">
          <p>Running on a DigitalOcean Droplet with Docker Compose</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// API endpoint to get visit stats
app.get('/api/stats', async (req, res) => {
  if (!db) {
    return res.status(500).json({ error: 'Database not connected' });
  }

  try {
    const result = await visitors.findOne({ page: 'home' });
    res.json({
      page: 'home',
      visits: result ? result.count : 0,
      serverTime: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
async function startServer() {
  // Connect to MongoDB
  db = await connectToMongo();
  if (db) {
    visitors = db.collection('visitors');
  }

  // Start Express server
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`MongoDB connection status: ${db ? 'Connected' : 'Failed'}`);
  });
}

startServer();
