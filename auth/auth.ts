import jwt from 'jsonwebtoken';
import { json } from 'stream/consumers';
import {Request, Response , NextFunction} from 'express';

export const verifyToken = (req:Request , res: Response , next: NextFunction) => {
    try{
        const token = req.cookies.token;

        if(!token){
            return res.redirect('/login');
        }

        const decode = jwt.verify(token , process.env.JWT_SECRET as string);
        (req as any).user = decode;
        next();
    } catch (err){
        return res.status(403).json({ message:'Inavlid token'});
    }
}

export const verifyAdmin = (req: Request, res: Response , next: NextFunction) => {
    if( (req as any).user.role !== "admin"){
        return res.status(403).json({message: "Access denied"})
    }
    next();
}
