import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import 'express';
import dotenv from 'dotenv';
dotenv.config();

interface JwtPayload {
  _id: unknown;
  username: string;
  email: string;
}

// Module augmentation for Express Request interface to include user property
declare global {
  namespace Express {
    interface User {
      _id: unknown;
      username: string;
      email: string;
    }
  }
}

/**
 * Helper function to verify a JWT token.
 * Returns the decoded user payload if valid, or null if invalid.
 */
export const getUserFromToken = (token?: string): JwtPayload | null => {
  if (!token) return null;
  const secretKey = process.env.JWT_SECRET_KEY || '';
  try {
    const user = jwt.verify(token, secretKey) as JwtPayload;
    return user;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

/**
 * Express middleware to authenticate a token.
 * For GraphQL, call getUserFromToken in your Apollo Server context function.
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Unauthorized: No token provided' });
    return;
  }

  const user = getUserFromToken(token);
  if (!user) {
    res.status(403).json({ message: 'Forbidden: Invalid token' });
    return;
  }

  // Attach the verified user to the request
  req.user = user;
  next();
};

/**
 * Signs a new JWT token with the provided user information.
 */
export const signToken = (
  username: string,
  email: string,
  _id: unknown
): string => {
  const payload = { username, email, _id };
  const secretKey = process.env.JWT_SECRET_KEY || '';
  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};

// export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
//   const authHeader = req.headers.authorization;

//   if (authHeader) {
//     const token = authHeader.split(' ')[1];

//     const secretKey = process.env.JWT_SECRET_KEY || '';

//     jwt.verify(token, secretKey, (err, user) => {
//       if (err) {
//         return res.sendStatus(403); // Forbidden
//       }

//       req.user = user as JwtPayload;
//       return next();
//     });
//   } else {
//     res.sendStatus(401); // Unauthorized
//   }
// };

// export const signToken = (username: string, email: string, _id: unknown) => {
//   const payload = { username, email, _id };
//   const secretKey = process.env.JWT_SECRET_KEY || '';

//   return jwt.sign(payload, secretKey, { expiresIn: '1h' });
// };
