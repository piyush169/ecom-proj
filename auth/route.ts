import express from 'express';
import authController from './controllers';
import {verifyToken} from './auth';

const router = express.Router();

router.post('/register' , authController.register);
router.post('/login' , authController.login);
router.post('/me',verifyToken, authController.me);
router.post('/admin/register' , authController.registerAdmin);


export default router;
