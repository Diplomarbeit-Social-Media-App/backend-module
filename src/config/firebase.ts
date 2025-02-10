import fs from 'fs';
import firebase from 'firebase-admin';
import config from './config';
import { ApiError } from '../utils/apiError';
import { INTERNAL_SERVER_ERROR } from 'http-status';
import logger from '../logger';

const env = config.NODE_ENV;
let app: firebase.app.App;

const credentials = () => {
  try {
    if (env === 'production') {
      if (!config.FIREBASE_ADMIN) {
        throw new Error(
          'Missing FIREBASE_ADMIN environment variable in production.',
        );
      }
      return JSON.parse(config.FIREBASE_ADMIN);
    } else {
      if (!fs.existsSync(config.FIREBASE_ADMIN)) {
        throw new ApiError(
          INTERNAL_SERVER_ERROR,
          `Missing or invalid path to service account file: ${config.FIREBASE_ADMIN}`,
        );
      }
      return JSON.parse(fs.readFileSync(config.FIREBASE_ADMIN, 'utf-8'));
    }
  } catch (_e) {
    throw new ApiError(
      INTERNAL_SERVER_ERROR,
      'Failed to load Firebase credentials',
    );
  }
};

export default () => {
  if (!app) {
    app = firebase.initializeApp({
      credential: firebase.credential.cert(credentials()),
    });
    logger.info('🔥 Firebase initialized');
  }
  return app;
};
