const express = require('express');
const NodeCache = require('node-cache');
const uniqid = require('uniqid');
const body = require('body-parser');
const cors = require('cors');

const Producer = require('./producer');
const logger = require('./logger');

const port = process.env.PORT || 3006;
const env = process.env.NODE_ENV || 'development';

const store = new NodeCache();
const app = express();

app.use(cors());
app.use(body.json());
app.use(body.urlencoded({ extended: true }));

const kafka = new Producer();
let uid = 0;

app.post('/api/register', (req, res) => {
  logger.info('body', req.body);
  uid++;
  const user = req.body;
  user.id = uid;
  const code = uniqid();
  user.code = code;
  const success = store.set(user.id, user);
  const data = Object.assign({}, user);
  delete data.code;
  const response = {
    status: true,
    message: 'User account created',
    data
  };

  if (success) {
    kafka.sendMessage('user_account_created', user);
    return res.json(response).end();
  }

  response.status = false;
  response.message = 'Issue creating user account';
  return res
    .status(500)
    .json(response)
    .end();
});

app.post('/api/verify', (req, res) => {
  const uid = req.body.uid;
  const code = req.body.code;
  const response = {
    status: true,
    message: 'User account verified'
  };
  const user = store.get(uid);
  logger.info('user', user, uid, code);
  if (user && user.code === code) {
    kafka.sendMessage('user_account_verified', user);
    return res.json(response).end();
  }

  response.status = false;
  response.message = 'Issue verifying user account';
  return res
    .status(400)
    .json(response)
    .end();
});

app.listen(port, () => {
  logger.info(`User-service-${env} running on port: ${port}`);
});
module.exports = app;
