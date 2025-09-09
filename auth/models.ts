import mongoose, { model } from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    pass: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin','customer'],
        default: 'customer'
    }
});

export default model('User', UserSchema);