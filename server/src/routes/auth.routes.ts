import express from 'express';
import {
  signup,
  signin,
  verifyToken,
  verifyEmail,
  tokenValid,
  deleteUser,
  forgetPassword,
  resetPassword,
  getUser,
} from '../controller/auth.controller';
import { auth } from '../middleware/auth';

export const authRouter = express.Router();

// post
authRouter.post('/signup', signup);
authRouter.post('/signin', signin);
authRouter.post('/verifyToken', verifyToken);
authRouter.post('/verifyEmail', verifyEmail);
authRouter.post('/tokenValid', tokenValid);
authRouter.post('/forgetPassword', forgetPassword);
authRouter.post('/resetPassword', resetPassword);

// get
authRouter.get('/getUser', auth, getUser, );
// delete
authRouter.delete('/deleteUser', deleteUser);