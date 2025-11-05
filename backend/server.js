const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
let db;
const client = new MongoClient(process.env.MONGODB_URI);

async function connectDB() {
  try {
    await client.connect();
    db = client.db('predictive_maintenance');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

connectDB();

// API Routes

// Get all machines
app.get('/api/machines', async (req, res) => {
  try {
    const machines = await db.collection('machines').find({}).toArray();
    res.json(machines);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching machines' });
  }
});

// Get single machine by ID
app.get('/api/machines/:id', async (req, res) => {
  try {
    const machine = await db.collection('machines').findOne({ _id: req.params.id });
    res.json(machine);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching machine' });
  }
});

// Add new machine (optional)
app.post('/api/machines', async (req, res) => {
  try {
    const result = await db.collection('machines').insertOne(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error adding machine' });
  }
});

// Update machine (optional)
app.put('/api/machines/:id', async (req, res) => {
  try {
    const result = await db.collection('machines').updateOne(
      { _id: req.params.id },
      { $set: req.body }
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error updating machine' });
  }
});

// Delete machine (optional)
app.delete('/api/machines/:id', async (req, res) => {
  try {
    const result = await db.collection('machines').deleteOne({ _id: req.params.id });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error deleting machine' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});