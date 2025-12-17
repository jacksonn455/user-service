import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { JWTPayload, InternalJWTPayload } from '../types';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'ILIACHALLENGE';
const JWT_INTERNAL_SECRET: Secret =
  process.env.JWT_INTERNAL_SECRET || 'ILIACHALLENGE_INTERNAL';

const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ||
  '24h') as SignOptions['expiresIn'];
const JWT_INTERNAL_EXPIRES_IN = (process.env.JWT_INTERNAL_EXPIRES_IN ||
  '1h') as SignOptions['expiresIn'];

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};

export const generateInternalToken = (service: string): string => {
  const payload: InternalJWTPayload = { service };

  return jwt.sign(payload, JWT_INTERNAL_SECRET, {
    expiresIn: JWT_INTERNAL_EXPIRES_IN,
  });
};

export const verifyInternalToken = (token: string): InternalJWTPayload => {
  return jwt.verify(token, JWT_INTERNAL_SECRET) as InternalJWTPayload;
};
