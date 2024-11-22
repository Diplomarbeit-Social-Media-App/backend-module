import express, { json, urlencoded } from 'express';
import cors from 'cors';
import allRoutes from './routes';
import { convertError, handleError } from './middlewares/error';
import { notFound } from './middlewares/404';
import morgan from './middlewares/morgan';
import passport from 'passport';
import JwtStrategy from './middlewares/auth';

const app = express();

app.use(cors());
app.use(urlencoded({ extended: false }));
app.use(json({ limit: '900kb', strict: true }));
app.use(morgan);
app.use(passport.initialize());
passport.use(JwtStrategy);
app.use(allRoutes);
app.use(notFound);
app.use(convertError);
app.use(handleError);

export default app;
