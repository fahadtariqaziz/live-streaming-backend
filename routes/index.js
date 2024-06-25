//productRoute.js

const express = require('express');
const { getAllProducts, createProduct, updateProduct, deleteProduct, getProductDetails, createProductReview, getProductReviews, deleteReview } = require('../controllers/productController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');


const router = express.Router();


//router.route('/products').get(getAllProducts);
router.route('/products').get( getAllProducts);
router.route('/product/new').post(isAuthenticatedUser ,authorizeRoles("admin"), createProduct);    //same admin insomnia route men add kiya   http://localhost:4000/api/v1/admin/product/new

router
.route('/product/:id')
.put(isAuthenticatedUser ,authorizeRoles("admin"),updateProduct)       
.delete(isAuthenticatedUser ,authorizeRoles("admin"),deleteProduct)
//.get(getProductDetails);    isme admin ni lagana tou iska or route bana len ge

router.route("/product/:id").get(getProductDetails);

router.route("/review").put(isAuthenticatedUser , createProductReview);


router.route("/reviews")
.get(getProductReviews)   //agar sirf dekhna hai review tou uske liye login hone ki zarorat ni
.delete(isAuthenticatedUser , deleteReview);     //delete review karne ke login hona zarori hai  


module.exports = router;