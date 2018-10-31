const express = require('express');

const {
  getProducts,
  getIndex,
  getCart,
  getChecktout,
  getOrders,
  getProduct,
  postCart,
  postCartDeleteProduct
} = require('../controllers/shop');

const router = express.Router();

router.get('/', getIndex);

router.get('/products', getProducts);

router.get('/products/:productId', getProduct);

router.get('/cart', getCart);

router.post('/cart', postCart);

router.get('/checkout', getChecktout);

router.get('/orders', getOrders);

router.post('/cart-delete-item', postCartDeleteProduct)

module.exports = router;
