const express = require('express');
const fs = require('fs');
const router = express.Router();

const DATA_FILE = './data/tasks.json';

// Get all tasks
router.get('/', (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  res.json(data);
});

// Create task
router.post('/', (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE));

  const newTask = {
    id: Date.now(),
    title: req.body.title,
    description: req.body.description,
    technician: req.body.technician,
    status: 'pending'
  };

  data.push(newTask);
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

  res.json(newTask);
});

// Update status
router.put('/:id', (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE));

  const task = data.find(t => t.id == req.params.id);
  if (task) {
    task.status = req.body.status;
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json(task);
  } else {
    res.status(404).json({ message: 'Not found' });
  }
});

module.exports = router;