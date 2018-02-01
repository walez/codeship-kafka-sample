
const kafka = require('node-rdkafka');
const Promise = require('bluebird');

let producer;
let producerReady;

const logger = require('./logger');

const KAFKA_BROKER_LIST = 'kafka:9092';

const closeProducer = function closeProducer() {
  producer.disconnect();
};

const bindListeners = function bindListeners() {
  
  producer.on('SIGTERM', () => {
    closeProducer();
  });

  producer.on('delivery-report', report => {
    logger.info('delivery report', report);
  });

  producerReady = new Promise((resolve, reject) => {
    producer.on('ready', () => {
      logger.info('producer ready');
      resolve(producer);
    });
    producer.on('error', err => {
      logger.error(err);
      closeProducer();
      producer.connect();
      reject(err);
    });
  });
};

const initializeProducer = function initializeProducer() {
  producer = new kafka.Producer({
    debug: 'all',
    'client.id': 'user-api',
    'metadata.broker.list': KAFKA_BROKER_LIST,
    'compression.codec': 'gzip',
    'retry.backoff.ms': 200,
    'message.send.max.retries': 10,
    'socket.keepalive.enable': true,
    'queue.buffering.max.messages': 100000,
    'queue.buffering.max.ms': 1000,
    'batch.num.messages': 1000000,
    dr_cb: true
  });

  producer.connect({}, err => {
    if (err) {
      logger.error('connect', err);
    }
  });

  bindListeners();
};

const KafkaService = function KafkaService() {
  initializeProducer();
};

KafkaService.prototype.sendMessage = function sendMessage(
  topic,
  payload,
  partition = 0
) {
  return producerReady
    .then(producer => {
      const message = Buffer.from(JSON.stringify(payload));
      producer.produce(topic, partition, message);
    })
    .catch(error => logger.error('unable to send message', error));
};

module.exports = KafkaService;
