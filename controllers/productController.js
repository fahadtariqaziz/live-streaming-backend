const Product = require ('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ApiFeatures = require('../utils/apifeatures');

//Create Product -- Admin

//exports.createProduct = async (req,res,next) => {
exports.createProduct = catchAsyncErrors(async (req,res,next) => {  

    req.body.user = req.user.id;        //req.body.user mongodb wali user ki collection hai waha se id access kre ge

    const product = await Product.create(req.body);

    res.status(201).json({
        success : true,
        product
    });

});

//getAllProducts
/*
exports.getAllProducts = catchAsyncErrors(async (req,res) => {

    const apiFeatures = new ApiFeatures(Product.find() , req.query).search();
    //const products = await Product.find();
    const products = await apiFeatures.query;

    res.status(200).json({
        success : true,
        products
    });
});
*/

// getAllProducts
exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
    try {
        //paging ke liye 100 product tou ek page pe 5 ya 10 products
        const resultPerPage = 8;
        const productCount = await Product.countDocuments();   //isse bhi neeche json men pass kardein ge
        const apiFeatures = new ApiFeatures(Product.find(), req.query)
        .search()
        .filter()
        .pagination(resultPerPage) // iski jaga ye neeche 4 lines likhi
        .sort('-createdAt')  //abhi tak jo 3 function banaye usme bs yehi ek argument receive kar rha hai
        //const products = await Product.find({name : "samosa"});    //samosamosa ye ni dhoond ke dega   amazon men aese he kaam ho rha pattern se dhoond dega
        
        //let products = await apiFeatures.query;
        //let filteredProductsCount = products.length;
        //apiFeatures.pagination(resultPerPage);

        const products = await apiFeatures.query;

        if (!products || products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No products found"
            });
        }

        res.status(200).json({
            success: true,
            products,
            productCount,
            resultPerPage,
            //filteredProductsCount,
        });
    } catch (error) {
        return next(new ErrorHandler(400, error.message));
    }
});

//update Product -- Admin

exports.updateProduct = catchAsyncErrors(async (req,res,next) => {

    //let iss liye liya kyu ke issi ko change karne wale hen
    //await aye ga warna dhoond he nae paye ga
    let product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler("Product not found , 404") )
    }

    product = await Product.findById(req.params.id, req.body, {new:true , runValidators: true , useFindAndModify : false});
    
    res.status(200).json({
        success : true,
        product
    });
});


exports.deleteProduct = catchAsyncErrors(async (req,res,next) => {

    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler("Product not found , 404") )
    }

    await product.deleteOne();

    res.status(200).json({
        success : true,
        message : "Product deleted successfully"
    });
});


exports.getProductDetails = catchAsyncErrors(async(req,res,next) => {
    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler("Product not found , 404") )     //ye next  callback function hai
        //return res.status(500).json({
        //    success:false,
        //    message : "Product not found"
        //})
    }

    res.status(200).json({
        success : true,
        product,
    });
});


//create new review or update the review

exports.createProductReview = catchAsyncErrors( async (req,res,next) => {

    const {rating , comment , productId} = req.body
   const review = {            //review nam ka object bna liya      ab review wali array men ye add kardein ge push karke
    user : req.user._id,     //user nam ki koi cheeze ni chaheye thi model men phir wo bhi neeche se copy kar ke le aye ab chaheye isko user
    name : req.user.name,
    //rating : req.body.rating,
    rating : Number(rating),
    comment,
   };

   const product = await Product.findById(productId);   //product dhoondi jispe review dena

   const isReviewed = product.reviews.find( (rev) => rev.user.toString() === req.user._id.toString())   //in short rev.user men id mil jaye gi jisne bhi review banaya hoga          req.user._id matlb jisne login kar rkha uski id

   if(isReviewed){
    product.reviews.forEach( (rev) => {
        if(rev => rev.user.toString() === req.user._id.toString())
        (rev.rating = rating),  //rating wo hai jo oper se ayi
        (rev.comment = comment); //yaha semi colon ana
    });
   }
   else{
    product.reviews.push(review);   //add element to the end of array      Product ke model men reviews nam ki array hai
    product.numOfReviews = product.reviews.length     //num of reviews ko bhi update karna  oper ni kare ge kyu ke wo tou porane wale ko he update kar rhe 
    }

    let avg = 0;
    product.ratings = product.reviews.forEach( rev => {      //oper wali rating product ke andar wali rating hai ek overall rating ye wo hai  average nikalenge     reviews ke andar rating hai or alag se ratings hai

        avg += rev.rating;
    }) 
    product.ratings = avg 
    / product.reviews.length;
    

    await product.save({validateBeforeSave : false});

    res.status(200).json({
        success : true,
    })
});


//Get all reviews of a product
exports.getProductReviews = catchAsyncErrors( async (req,res,next) => {

    const product = await Product.findById(req.query.id);        //find by id karke dhoond len ge    or id query se de dein ge   query ka matlb parameter men add karke key men name or value insomnia men   tou wo khudi url men add ho jaye ga ? ke baad

    if(!product){
        return next (new ErrorHandler ("Product not found" , 404));
    }

    res.status(200).json({
        success : true,
        reviews : product.reviews,         //reviews wese he yaha variable jese success hai usme product.reviews  product ke model men reviews
    });

});


//Delete Review
exports.deleteReview = catchAsyncErrors( async (req,res,next) => {

    const product = await Product.findById(req.query.productId);        //find by id karke dhoond len ge    or id query se de dein ge  matlb json ni parameters men key men name or value men insomnia ke

    if(!product){
        return next (new ErrorHandler ("Product not found" , 404));
    }

    //ERROR yaha neeche review likha tha or line 207 men bracket men reviews likha tha   tou    reviews is not defined
    const reviews = product.reviews.filter( rev => rev._id.toString() !== req.query.id.toString());   //id wo den ge jo delete karna          //yaha tou wo review rakh len ge jo chahye tou reviews ki array men banate he id aati insomnia men wo pakar len ge   ya    tou jo nae chahye wo delete karden  

    //reviews naye aye tou rating bhi update karni pare gi
    let avg = 0;
   
    //product.reviews.forEach( rev => {      //oper wali rating product ke andar wali rating hai ek overall rating ye wo hai  average nikalenge     reviews ke andar rating hai or alag se ratings hai
    reviews.forEach( rev => {
        avg += rev.rating;
    }) 
    const ratings = avg / reviews.length;
        
    const numOfReviews = reviews.length;

    //ERROR neeche product ka p chota likh dia tha  findByIdAndUpdate is not a function
    await Product.findByIdAndUpdate(req.query.productId , { reviews , ratings, numOfReviews} ,{ new : true , runValidators : true , useFindAndModify : false,});

    res.status(200).json({
        success : true,
        });

});

