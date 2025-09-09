import { error } from "console";
import { createClient } from "redis";

const redisClient = createClient({url: "redis://localhost:6379 "});

redisClient.on("error" , (err) => console.error("redis client error",err));

const connectRedis = async () => {
    await redisClient.connect();
}

connectRedis();
export default redisClient;