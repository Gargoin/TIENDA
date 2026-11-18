import { Router } from "express";
import {
  getPrintfulProduct,
  getPrintfulProducts,
} from "../controllers/printful.controller.js";

const router = Router();

router.get("/products", getPrintfulProducts);
router.get("/products/:productId", getPrintfulProduct);

export default router;
