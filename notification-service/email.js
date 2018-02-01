const querystring = require('querystring');
const axios = require('axios');

const logger = require('./logger');

const MAILGUN_KEY = process.env.MAILGUN_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
const MAILGUN_SENDER = process.env.MAILGUN_SENDER;

module.exports = (subject, content, to, from = MAILGUN_SENDER) => {
  
  const body = {
    from,
    to,
    subject,
    text: content
  };
  const config = {
    method: 'post',
    url: `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`,
    auth: {
      username: 'api',
      password: MAILGUN_KEY
    },
    data: querystring.stringify(body)
  }
  // send mail with defined transport object
  return axios(config).then(response => {
    logger.info('Mail successfully sent', response.data);
  }).catch(error => {
    logger.error('Issue sending mail', error);
    logger.error(error.response.data);
  })
};