import express from 'express';

import { authenticate } from '../../middlewares/auth.js';
import { requirePermission } from '../../middlewares/permission.js';
import { validate } from '../../middlewares/validate.js';

import * as productController from './product.controller.js';
import { productSchema, productUpdateSchema } from './product.validator.js';

const router = express.Router();

// Categories & Brands (Publicly accessible for both frontend catalog and admin hub)
router.get('/categories', productController.getCategories);
router.post('/categories', productController.createCategory);
router.delete('/categories/:id', productController.deleteCategory);

router.get('/brands', productController.getBrands);
router.post('/brands', productController.createBrand);
router.delete('/brands/:id', productController.deleteBrand);

router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);

// Admin routes
router.use(authenticate);

router.post(
  '/',
  requirePermission('products:write'),
  validate(productSchema),
  productController.createProduct
);
router.put(
  '/:id',
  requirePermission('products:write'),
  validate(productUpdateSchema),
  productController.updateProduct
);
router.delete('/:id', requirePermission('products:delete'), productController.deleteProduct);

export default router;
