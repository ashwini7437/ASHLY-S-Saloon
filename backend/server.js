const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: "ASHLY's Saloon Backend is running smoothly."
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
