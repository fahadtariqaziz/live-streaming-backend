const Order = require ("../models/orderModels");
const Product = require ('../models/productModel');     //product ka model bhi chaheye he hoga ref ke liye
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

// Create new Order
exports.newOrder = catchAsyncErrors( async (req,res,next) => {

    const {shippingInfo , orderItems , paymentInfo , itemsPrice , taxPrice, shippingPrice , totalPrice} = req.body;   //ye sab insomnia men khud likhe ge json men

    const order = await Order.create( {shippingInfo , orderItems , paymentInfo , itemsPrice , taxPrice, shippingPrice , totalPrice , paidAt : Date.now() , user : req.user._id,});  //paidAt bhi add kare ge    or  current user jo login waha se user bhi le aye ge kyu login hai tou phir he kar skta hai   req.user  auth.js   men hai matlb login user ka data req.user men save kara diya

    res.status(201).json({
        success: true,
        order,
    })
});



//getSingle Order

exports.getSingleOrder = catchAsyncErrors( async (req,res,next) => {

    const order = await Order.findById(req.params.id).populate("user" ,"name email" );  //jab mene order create kiya tha tou user ki id bhi mil jaye gi    tou    user ko kare ge populate name or email tou user wali field ki id ko use karke user wale database men jaye ga or is id ka name or email le lega  id ki jaga 

    if(!order){
        return next(new ErrorHandler ("Order not found with this Id" , 404));
    }

    res.status(200).json({
        success : true,
        order
    });
});



//getloggedIn Order

exports.myOrder = catchAsyncErrors( async (req,res,next) => {

    const orders = await Order.find({user : req.user._id})

    

    res.status(200).json({
        success : true,
        orders
    });
});




//get All Orders  --admin                   jese avg pe for each loop aese yaha bhi total Amount ke liye     mongoDB men orders ke andar field hai totalPrice

exports.getAllOrders = catchAsyncErrors( async (req,res,next) => {

    const orders = await Order.find();

    let totalAmount = 0;      //taake admin ko show kar ske dashboard men

    orders.forEach (order => {                         //ek order ko order keh dete  ye wo hai variable ka nam rakh dete forEach men   warna peeche orders or aage totalParice mongodb se dekha 
        totalAmount = totalAmount + order.totalPrice;
    });


    res.status(200).json({
        success : true,
        totalAmount,
        orders,
    });
});



//Update Order status  --admin                   

exports.updateOrder = catchAsyncErrors( async (req,res,next) => {

    const order = await Order.findById(req.params.id);

    if(!order) {
        return next(new ErrorHandler ("Order not found with this Id" , 404));
    }

    if(order.orderStatus === "Delivered"){
        return next ( new ErrorHandler("You have already delivered this order" , 404));
    }

    order.orderItems.forEach(async (order) => {          // mongoDb men order Items ke name se array hai  usme quantity  or us product ki id bhi hai or mongo db men is array ki id bhi generate kardi     deliver ke sath jo stock men quantity pari wo bhi kam karni
    //for (const order of order.orderItems) {
        await updateStock(order.product, order.quantity);      //is function ko bna lete //jitne bhi orders hen us sab ke stock update karde ga   wo baad men dekh ge kaise kare ga
    });

    order.orderStatus = req.body.status;   //jo bhi hum json men bheje ge

    if(req.body.status === "Delivered"){
        order.deliveredAt = Date.now();
    }

    await order.save({ validateBeforeSave : false});

    res.status(200).json({
        success : true,
    });
});


async function updateStock (id , quantity) {         //parameter kuch bhi rakh do  argument kuch bhi dedo    wo tou placement ke hisab se hota first wala parameter id hai tou  product bhejne pe wohi mile ga
    const product = await Product.findById(id)  //product import kar chuke hen      //id pass kare ge tou product mil jaye gi ye faida hota product ka ref save karne ka order men

    product.stock = product.stock - quantity ; //jo oper se ayi quantity       hamara stock ka s chota he hai

    await product.save({ validateBeforeSave : false });
}



//delete order -- admin
exports.deleteOrder = catchAsyncErrors( async (req,res,next) => {

    const order = await Order.findById(req.params.id);

    if(!order) {
        return next(new ErrorHandler ("Order not found with this Id" , 404));
    }

    await order.deleteOne(order);


    res.status(200).json({
        success : true,
        
    });
});