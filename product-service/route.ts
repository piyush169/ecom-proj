import  express  from "express";
import {createProduct, getProducts ,getOneProduct, updateProduct, deleteProduct} from './controllers';
import {requireAdmin} from './checkAdmin'

const router = express.Router();

//public route
router.get("/" , getProducts);
router.get("/:id", getOneProduct);

//admin-only route
router.post("/", requireAdmin(), createProduct);
router.put("/:id", requireAdmin(), updateProduct);
router.delete("/:id", requireAdmin(), deleteProduct);

export default router;
