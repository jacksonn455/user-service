import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { getUserFinancialData } from '../services/wallet-communication.service';
import { AuthRequest } from '../types';
import logger from '../utils/logger';

export class UserController {
  private service: UserService;

  constructor() {
    this.service = new UserService();
  }

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, name } = req.body;

      const result = await this.service.register({ email, password, name });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error: any) {
      logger.error('Error in register controller', { error });

      if (error.message === 'User already exists') {
        res.status(409).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      const result = await this.service.login({ email, password });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error: any) {
      logger.error('Error in login controller', { error });

      if (error.message === 'Invalid credentials' || error.message === 'User is inactive') {
        res.status(401).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ success: false, message: 'User not authenticated' });
        return;
      }

      const user = await this.service.getUserProfile(userId);

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      logger.error('Error in getProfile controller', { error });
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  getProfileWithFinancialData = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ success: false, message: 'User not authenticated' });
        return;
      }

      const [user, financialData] = await Promise.all([
        this.service.getUserProfile(userId),
        getUserFinancialData(userId),
      ]);

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          user,
          wallet: financialData,
        },
      });
    } catch (error) {
      logger.error('Error in getProfileWithFinancialData controller', { error });
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const users = await this.service.getAllUsers();

      res.status(200).json({
        success: true,
        data: users,
        count: users.length,
      });
    } catch (error) {
      logger.error('Error in getAllUsers controller', { error });
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
}