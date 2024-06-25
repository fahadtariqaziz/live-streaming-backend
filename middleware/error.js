const ErrorHandler = require ('../utils/errorHandler');

module.exports = (err,req,res,next) => {

    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal server Error";

    //wrong MongoDb Id error     agar err.stack kare neeche tou CastError men stack ati pori location tou ye object hai castError
    if(err.name === "CastError" ){
        const message = `Resource not found . Invalid ${err.path}`;
        err = new ErrorHandler(message, 400);
    }


    //register ke liye message send agar dobara wohi register kare  "success": false,	"message": "E11000 duplicate key error collection: ecommerce.users index: email_1 dup key: { email: \"fahadtariq78659@gmail.com\" }"}  mongoose duplicate key error
    if(err.code === 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`     //ERROR object is not defined    capital O likhna tha
        err = new ErrorHandler(message, 400);
    }


    //wrong JWT error jsonweb token
    if(err.name === "JsonWebTokenError" ){
        const message = `Json web Token is invalid , try again`;
        err = new ErrorHandler(message, 400);
    }

    
    //JWT EXPIRE error
    if(err.name === "JsonWebTokenError" ){
        const message = `Json web Token is Expire , try again`;
        err = new ErrorHandler(message, 400);
    }



    res.status(err.statusCode).json({
        success : false,
        message : err.message,
    })

}