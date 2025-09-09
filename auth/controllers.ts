import User from './models';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express'; 
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  throw new Error("FATAL ERROR: JWT_SECRET is not defined in the environment variables.");
}

interface CustomJwtPayload extends JwtPayload {
    userId: string;
    email: string;
}


async function register(req: Request, res: Response) {
    try {
        const { name, email, password } = req.body;

        const existUser = await User.findOne({ email });
        if (existUser) {
            // Be consistent with sending JSON responses
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        const pass = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            pass
        });
        return res.status(201).json({ message: "User registered successfully", user });
    }
    catch (err) {
        console.error(err); // Log the actual error
        return res.status(500).json({ message: "Internal server error during registration." });
    }
}

async function login(req: Request, res: Response) {
    try {
        const { email, pass } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'No user found with that email.' });
        }

        const isMatch = await bcrypt.compare(pass, user.pass);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid Credentials' });
        }

        const token = jsonwebtoken.sign(
            {
                userId: user._id,
                email: user.email // Use 'email' consistently
            },
            JWT_SECRET,
            {
                expiresIn: '1d'
            }
        );

        return res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error during login.' });
    }
}

async function me(req: Request, res: Response) {
    try {
        // Assuming the token is passed in the Authorization header (more common)
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authentication token required.' });
        }
        const token = authHeader.split(' ')[1];

        // Safely verify and decode the token
        const decoded = jsonwebtoken.verify(token, JWT_SECRET) as CustomJwtPayload;

        // Now `decoded` is properly typed
        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        return res.status(200).json(user);

    } catch (err) {
        console.error(err);
        // Handle specific JWT errors
        if (err instanceof jsonwebtoken.JsonWebTokenError) {
            return res.status(401).json({ message: 'Invalid or expired token.' });
        }
        // Use standard response methods
        return res.status(500).json({ message: 'Internal server error.' });
    }
}

async function registerAdmin(req: Request, res: Response) {
    try {
        const { name, email, pass, adminCode } = req.body;

        if (adminCode !== process.env.ADMIN_CODE) {
            return res.status(403).json({ message: 'Incorrect adminCode' });
        }

        const existUser = await User.findOne({ email });
        if (existUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const hashedPass = await bcrypt.hash(pass, 10);

        const user = await User.create({
            name,
            email,
            pass: hashedPass,
            role: 'admin'
        });

        const token = jsonwebtoken.sign({ id: user._id, role: user.role }, JWT_SECRET, {
            expiresIn: '1d',
        });

        // Sending the token in the response body is often preferred over cookies for APIs
        return res.status(201).json({ message: "Admin registered successfully", token });

    }
    catch (err) {
        console.error(err);
        // Use standard response methods
        return res.status(500).json({ message: 'Internal server error during admin registration.' });
    }
}

export default { login, register, me, registerAdmin };
