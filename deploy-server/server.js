const express = require('express');
const { exec } = require('child_process');

const app = express();
app.use(express.json());

app.post('/deploy', (req, res) => {
  if (req.headers['x-github-event'] !== 'push') {
    return res.status(403).send('Forbidden');
  }

  console.log('🚀 Deploy triggered');

  exec('cd ~/apps/shota-site && git pull && docker compose up --build -d', (err, stdout, stderr) => {
    if (err) {
      console.error('❌ ERROR:', err);
      return res.status(500).send('Deploy failed');
    }

    console.log('✅ OUTPUT:', stdout);
    res.send('Deploy success');
  });
});

app.listen(9000, () => {
  console.log('Deploy server running on port 9000');
});
