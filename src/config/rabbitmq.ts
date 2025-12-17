import * as amqp from 'amqplib';
import { Connection, Channel } from 'amqplib';

let connection: Connection;
let channel: Channel;

export const initializeRabbitMQ = async (): Promise<Channel> => {
  try {
    const url = process.env.RABBITMQ_URL || 'amqp://localhost:5673';
    
    connection = await amqp.connect(url);
    console.log('RabbitMQ connected successfully');

    channel = await connection.createChannel();
    
    const queueName = process.env.RABBITMQ_QUEUE || 'user_events';
    await channel.assertQueue(queueName, {
      durable: true,
    });

    console.log(`RabbitMQ queue "${queueName}" ready`);
    
    return channel;
  } catch (error) {
    console.error('RabbitMQ connection failed:', error);
    throw error;
  }
};

export const publishMessage = async (message: any): Promise<void> => {
  try {
    if (!channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    const queueName = process.env.RABBITMQ_QUEUE || 'wallet_transactions';
    const messageBuffer = Buffer.from(JSON.stringify(message));

    channel.sendToQueue(queueName, messageBuffer, {
      persistent: true,
    });

    console.log('📤 Message published to RabbitMQ:', message);
  } catch (error) {
    console.error('❌ Failed to publish message:', error);
    throw error;
  }
};

export const getRabbitMQChannel = (): Channel => {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized');
  }
  return channel;
};

export const closeRabbitMQ = async (): Promise<void> => {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    console.log('RabbitMQ connection closed');
  } catch (error) {
    console.error('❌ Error closing RabbitMQ:', error);
  }
};