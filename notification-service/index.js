process.stdin.resume(); // keep process alive

require('dotenv').config();

const Kafka = require('node-rdkafka');

const logger = require('./logger');

const sendMail = require('./email');

const KAFKA_BROKER_LIST = process.env.KAFKA_BROKER_LIST;

const consumer = new Kafka.KafkaConsumer({
  //'debug': 'all',
  'metadata.broker.list': KAFKA_BROKER_LIST,
  'group.id': 'notification-service',
  'enable.auto.commit': false
});

const topics = [
  'test',
  'user_account_created',
  'user_account_verified'
];

//logging debug messages, if debug is enabled
consumer.on('event.log', function(log) {
  logger.info('event.log', log);
});

//counter to commit offsets every numMessages are received
let counter = 0;
let numMessages = 5;

consumer.on('ready', function(arg) {
  logger.info('consumer ready.' + JSON.stringify(arg));

  consumer.subscribe(topics);
  //start consuming messages
  consumer.consume();
});

consumer.on('data', function(metadata) {
  counter++;

  //committing offsets every numMessages
  if (counter % numMessages === 0) {
    logger.info('calling commit');
    consumer.commit(metadata);
  }

  // Output the actual message contents
  const data = JSON.parse(metadata.value.toString());
  logger.info('data value', data);

  if(metadata.topic === 'user_account_created'){
    const to = data.email;
    const subject = 'Verify Account';
    const content = `Hello ${data.first_name}, 
    Please use this code ${data.code} to complete your verification`;
    sendMail(subject, content,to);
  }else if(metadata.topic === 'user_account_verified') {
    const to = data.email;
    const subject = 'Account Verified';
    const content = `Hello ${data.first_name}, 
    You have successfully been verified`;
    sendMail(subject, content,to);
  }

});

consumer.on('disconnected', function(arg) {
  logger.info('consumer disconnected. ' + JSON.stringify(arg));
});

//logging all errors
consumer.on('event.error', function(err) {
  logger.error('Error from consumer', err, 'code: ', err.code);
});

//starting the consumer
consumer.connect();
