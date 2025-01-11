import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { AuthService } from '../services/auth.service';
import { AppError } from './error.middleware';

declare global {
  namespace Express {
    interface User {
      id: string;
    }
  }
}

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const result = await AuthService.handleGoogleAuth(profile);
        done(null, { id: result.user.id });
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: Express.User, done) => {
  done(null, user);
});

export const authenticateGoogle = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

export const authenticateGoogleCallback = passport.authenticate('google', {
  session: false,
  failureRedirect: '/login',
});

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new AppError('No token provided', 401);
    }

    const decoded = AuthService.verifyToken(token);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    next(new AppError('Invalid or expired token', 401));
  }
}; 