import { Request, Response, NextFunction } from 'express';
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();


const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
    throw new Error("FATAL ERROR: JWT_SECRET is not defined.");
}

// 1. Define an interface for your token's payload
interface TokenPayload extends JwtPayload {
    id: string;
    role: string;
}

// Extend the base Request type to include our custom user payload
interface AuthRequest extends Request {
    user?: TokenPayload;
}

/**
 * Middleware to ensure a user is an admin.
 */
export function requireAdmin() { // Renamed for clarity as it's hardcoded for 'admin'
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Not authorized, no token provided' });
        }

        // Use a try...catch block to handle invalid tokens
        try {
            const token = authHeader.split(' ')[1];
            
            // Verify the token and cast it to your specific payload type
            const decoded = jsonwebtoken.verify(token, JWT_SECRET) as TokenPayload;
            
            // Check if the role is 'admin'
            if (decoded.role !== 'admin') {
                return res.status(403).json({ message: 'Forbidden: You do not have admin permissions' });
            }

            // (Optional but good practice) Attach the decoded user to the request
            req.user = decoded;

            next(); // All checks passed, proceed to the controller
        } catch (error) {
            // This block will catch errors from an invalid/expired token
            return res.status(401).json({ message: 'Not authorized, token is invalid or has expired' });
        }
    };
}
