const { JWT_SECRET } = require("../config");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");

//const isAuthenticatedUser = catchAsyncErrors( async (req,res,next) => {
exports.isAuthenticatedUser = catchAsyncErrors( async (req,res,next) => {

    //const token = req.cookies;  //login ke time pe cookie men store kar liya token tou cookie parser install karte or server.js men use karte
    const {token} = req.cookies;  //ab sirf token aye ga pehle object banke uske andar token araha tha //login ke time pe cookie men store kar liya token tou cookie parser install karte or server.js men use karte

    // console.log(token);

    if(!token){
        return next(new ErrorHandler("Please Loggin to access this resource" , 401));
    }

    //ab agar token mil gya tou
    const jwt = require('jsonwebtoken');

    const decodedData = jwt.verify(token , JWT_SECRET );    //phir token ko verify karna jwt ke method verify se    token mil gya sath secret key den ge

    //ab jese he decoded data mil jaye ga tou

    const User = require('../models/userModel');
    req.user = await User.findById(decodedData.id); //ERROR ._id ni hoga  //req.user men aewe store karwa liya iske bager bhi hojaye ga      //decoded data jwt token jo create kiya usme id di/assign thi waha se access karlen ge   isko req.user men save karlen ge

    //jab tak ye login rhe ga request men se kabhi bhi user ka data access kar skte hen    iske baad next ko call karden ge   callback function
    if (!req.user) {
        return next(new ErrorHandler("User not found", 404)); // Handle user not found
    }

    next();

    
} );


exports.authorizeRoles = (...roles) => {     //...roles men admin access ho jaye ga jo routes men admin diya   triple dot se neeche array ke methods ajaye ge  like includes

    return (req,res,next) => {

        
        if( !roles.includes(req.user.role))     //jese req.user men pora user ka data save karliya tha tou role bhi hai usme agar mongodb men dekhe tou uski value user hai role ki    agar hai tou true tou hum iska ulta karden ge not true      jese array men hamare pas admin hai jo route men diya or req.user.role men admin nhi hai user hai tou error
        {
           return next( new ErrorHandler(`Role : ${req.user.role} is not allowed to access this resource` , 403));
        }

        next();   //agar include hota tou simple next ko call kardo wapis function return kar jaye ga
    };
};