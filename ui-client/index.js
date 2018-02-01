const path = require('path');
const express = require('express');
const history = require('connect-history-api-fallback');

const app = express();
const port = process.env.PORT || 5001;
const staticFileMiddleware = express.static('./');
app.use(staticFileMiddleware);
app.use(history({
  verbose: true
}));

app.get('/index.html', (req, res) => {
  return res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`APP running on: ${port}`);
});
