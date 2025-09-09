import mongoose, { model , Document} from "mongoose";
import { describe } from "node:test";
import mongoosePaginate from "mongoose-paginate-v2"; 


interface IProduct extends Document {
    name: String;
    description?: string;
    price: number;
    category?: string;
    brand?: string;
    stock: number;
    imgUrl?: string[];
    createdAt: Date;
    updatedAt: Date;
 }

const ProductSchema = new mongoose.Schema<IProduct>({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String
    },
    category: {
        type: String
    },
    imgUrl: {
        type: String
    },
    stock: {
        type: Number,
        required: true
    }
},{
    timestamps: true
});

ProductSchema.plugin(mongoosePaginate);
export default model('Product' ,ProductSchema);