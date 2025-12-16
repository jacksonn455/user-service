import axios, { AxiosInstance } from 'axios';
import { generateInternalToken } from '../utils/jwt';
import logger from '../utils/logger';

const WALLET_SERVICE_URL = process.env.WALLET_SERVICE_URL || 'http://localhost:3001';
const WALLET_SERVICE_ENABLED = process.env.WALLET_SERVICE_ENABLED === 'true';

class WalletCommunicationService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: WALLET_SERVICE_URL,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add interceptor to add internal JWT token
    this.client.interceptors.request.use((config) => {
      const internalToken = generateInternalToken('user-service');
      config.headers.Authorization = `Bearer ${internalToken}`;
      return config;
    });
  }

  /**
   * Notify wallet service about events
   */
  async notifyEvent(event: string, data: any): Promise<void> {
    if (!WALLET_SERVICE_ENABLED) {
      logger.info('Wallet service communication disabled', { event });
      return;
    }

    try {
      await this.client.post('/api/internal/events', {
        event,
        data,
        timestamp: new Date().toISOString(),
      });

      logger.info('Event sent to wallet service', { event });
    } catch (error: any) {
      logger.error('Failed to notify wallet service', {
        error: error.message,
        event,
      });
      // Don't throw - this is not critical
    }
  }

  /**
   * Get user balance from wallet service
   */
  async getUserBalance(userId: string): Promise<any> {
    if (!WALLET_SERVICE_ENABLED) {
      return null;
    }

    try {
      const response = await this.client.get(`/api/internal/balance/${userId}`);
      return response.data;
    } catch (error: any) {
      logger.error('Failed to get user balance from wallet service', {
        error: error.message,
        userId,
      });
      return null;
    }
  }

  /**
   * Get user transactions from wallet service
   */
  async getUserTransactions(userId: string): Promise<any> {
    if (!WALLET_SERVICE_ENABLED) {
      return null;
    }

    try {
      const response = await this.client.get(`/api/internal/transactions/${userId}`);
      return response.data;
    } catch (error: any) {
      logger.error('Failed to get user transactions from wallet service', {
        error: error.message,
        userId,
      });
      return null;
    }
  }
}

const walletCommunicationService = new WalletCommunicationService();

/**
 * Notify wallet service about user events
 */
export const notifyWalletService = async (event: string, data: any): Promise<void> => {
  await walletCommunicationService.notifyEvent(event, data);
};

/**
 * Get user financial data from wallet service
 */
export const getUserFinancialData = async (userId: string): Promise<any> => {
  const [balance, transactions] = await Promise.all([
    walletCommunicationService.getUserBalance(userId),
    walletCommunicationService.getUserTransactions(userId),
  ]);

  return {
    balance,
    transactions,
  };
};