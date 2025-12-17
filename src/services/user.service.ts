import { UserRepository } from '../repositories/user.repository';
import { RegisterDTO, LoginDTO, AuthResponse, UserResponse } from '../types';
import { generateToken } from '../utils/jwt';
import { getRedisClient } from '../config/redis';
import { publishMessage } from '../config/rabbitmq';
import { notifyWalletService } from './wallet-communication.service';
import logger from '../utils/logger';

export class UserService {
  private repository: UserRepository;

  constructor() {
    this.repository = new UserRepository();
  }

  async register(data: RegisterDTO): Promise<AuthResponse> {
    try {
      const existingUser = await this.repository.findByEmail(data.email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      const user = await this.repository.create(data);

      const token = generateToken({
        userId: user.id,
        email: user.email,
      });

      await publishMessage({
        event: 'USER_REGISTERED',
        data: {
          userId: user.id,
          email: user.email,
          name: user.name,
        },
        timestamp: new Date().toISOString(),
      });

      await notifyWalletService('user-created', {
        userId: user.id,
        email: user.email,
        name: user.name,
      });

      logger.info('User registered', { userId: user.id, email: user.email });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    } catch (error) {
      logger.error('Error registering user', { error });
      throw error;
    }
  }

  async login(data: LoginDTO): Promise<AuthResponse> {
    try {
      const user = await this.repository.findByEmail(data.email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      if (!user.isActive) {
        throw new Error('User is inactive');
      }

      const isPasswordValid = await user.comparePassword(data.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      const token = generateToken({
        userId: user.id,
        email: user.email,
      });

      const redis = getRedisClient();
      await redis.setEx(`user:${user.id}`, 3600, JSON.stringify(user.toJSON()));

      await publishMessage({
        event: 'USER_LOGGED_IN',
        data: {
          userId: user.id,
          email: user.email,
        },
        timestamp: new Date().toISOString(),
      });

      logger.info('User logged in', { userId: user.id, email: user.email });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    } catch (error) {
      logger.error('Error logging in', { error });
      throw error;
    }
  }

  async getUserById(id: string): Promise<UserResponse | null> {
    try {
      const redis = getRedisClient();
      const cached = await redis.get(`user:${id}`);

      if (cached) {
        logger.info('User found in cache', { userId: id });
        return JSON.parse(cached);
      }

      const user = await this.repository.findById(id);

      if (user) {
        const userData = user.toJSON();
        await redis.setEx(`user:${id}`, 3600, JSON.stringify(userData));
        return userData as UserResponse;
      }

      return null;
    } catch (error) {
      logger.error('Error getting user', { error, userId: id });
      throw error;
    }
  }

  async getUserProfile(userId: string): Promise<UserResponse | null> {
    return await this.getUserById(userId);
  }

  async getAllUsers(): Promise<UserResponse[]> {
    try {
      const users = await this.repository.findAll();
      return users.map((user) => user.toJSON() as UserResponse);
    } catch (error) {
      logger.error('Error getting all users', { error });
      throw error;
    }
  }
}
