import { request } from "http";
import Product from "./model";
import { Request, response, Response } from "express";
import { error } from "console";
import redisClient from "./redisClient";


async function createProduct(req: Request, res: Response) {
    try{
        const {name , price , description, category, imgUrl, stock, rating, createdAt} = req.body;

        const product = await Product.create({
            name,
            price,
            description,
            category,
            imgUrl,
            stock,
            rating,
            createdAt
        })

       

        return res.status(201).json({
            message: 'Product saved',
            product: product
        });

    } catch(error) {
        console.error(error);
        return res.status(500).json({error: `Error creating product, ${error}`});
    }
}

async function getProducts(req:Request, res: Response) {
    try{
        const {
            page = 1,
            limit = 10,
            sortBy = "createdAt:desc",
            category,
            search,
            minPrice,
            maxPrice
        } = req.query as {
            page?: string,
            limit?: string,
            sortBy: string,
            category: string,
            search: string,
            minPrice: string,
            maxPrice: string,
        };

        const filter: any = {};

        if(category){
            filter.category = category;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        if(minPrice || maxPrice){
            filter.price = {};
            if(minPrice) filter.price.$gte = Number(minPrice);
            if(maxPrice) filter.price.$lte = Number(maxPrice);
        }
 
        const sort: {[key: string]: 1 | -1} = {};
        if(sortBy){
            const parts = sortBy.split(':')
            const field = parts[0];
            const direction = parts[1] === 'desc' ? -1 : 1;
            sort[field] = direction;
        }

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);

        const products = await Product.find(filter)
            .sort(sort)
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum);
        
        const totalDocs = await Product.countDocuments(filter);
        
        const response = {
            docs: products,
            totalDocs: totalDocs,
            limit: limitNum,
            totalPages: Math.ceil(totalDocs / limitNum),
            page: pageNum,
            hasPrevPage: pageNum > 1,
            hasNextPage: pageNum * limitNum < totalDocs,
            prevPage: pageNum > 1 ? pageNum - 1 : null,
            nextPage: pageNum * limitNum < totalDocs ? pageNum + 1 : null,
        };

        return res.status(200).json(response);
    } catch(error){
        console.error(error);
        return res.status(500).json({error: 'Error fetching products'});
    }
}

async function getOneProduct(req:Request, res: Response) {
    try{
        const productId = req.params.id;
        const cacheKey = `product:${productId}`;

        const cachedProduct = await redisClient.get(cacheKey);
        if(cachedProduct){
            console.log('Cache hit');
            return res.json(JSON.parse(cachedProduct));
        }

        const product = await Product.findById(req.params.id);
        if(!product) return res.status(404).json({error: 'Product not found'});

        await redisClient.setEx(cacheKey, 3600, JSON.stringify(product));
        console.log("Cache miss - fetched from MongoDB");
        res.json(product);
    } catch(error){
        res.status(500).json({message: 'server error'});
    }
};

async function updateProduct(req:Request, res:Response) {
    try{
        const {id} = req.params;
        const newData = req.body;

        const updatedProduct = await Product.findByIdAndUpdate(id, newData, {
            new: true,
        });

        if(!updatedProduct){
            return res.status(404).json({ message: 'Product not found'});
        }

        const redisKey = `product:${id}`;
        const cacheExist = await redisClient.exists(redisKey);

        if(cacheExist){
            await redisClient.set(redisKey, JSON.stringify(updatedProduct), {
                EX: 3600,
            });
        }

        return res.json(updatedProduct);
    } catch(error){
        console.error(error);
    }
}

async function deleteProduct(req:Request , res: Response) {
    try{
        const {id} = req.params;

        const removeProduct = await Product.findByIdAndDelete(id);
        if(!removeProduct){
            res.status(404).json({message: 'Product could not be deleted'});
        }

        const redisKey = `product:${id}`;
        const cacheExist = await redisClient.exists(redisKey);
        if(cacheExist){
            await redisClient.del(redisKey);
        }
        
        return res.status(200).json({message: 'Item deleted successfully'})
    } catch(error){
        console.error(error)
    }
}

export {createProduct ,getProducts, getOneProduct, updateProduct, deleteProduct};






