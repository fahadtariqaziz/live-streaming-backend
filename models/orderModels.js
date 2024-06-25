const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({       //chaheye kia kia sab se pehle shiping info or usme kia chaheye
    shippingInfo : {
        address : { type : String , required : true},
        city : { type : String , required : true},
        state : { type : String , required : true},
        country : { type : String , required : true},
        pinCode : { type : Number , required : true},
        phoneNo : { type : Number , required : true},
        
    },

    orderItems : [      //uske baad ye hogi ek array   kyu items zada ho skte    shippingInfo ek he hogi
        {
            name : {type : String , required : true},
            price : {type : Number , required : true},
            quantity : {type : Number , required : true},
            image : {type : String , required : true},
            product : {type : mongoose.Schema.ObjectId , reF : "Product" , required : true},      //product ka reference bhi hona chaheye kia cheeze order ki hai

        },
    ],

    user :{       //ye product wale model se he copy karlete
                    //taake partner ko pta chal jaye kisne banaye hai product
            type : mongoose.Schema.ObjectId,
            ref : "User",
            required : true,
    },
   
    paymentInfo : {
        id : {type : String , required : true},
        status : {type : String , required : true},
    },

    paidAt : {type : Date , required : true},
        
    itemsPrice : {type : Number , default : 0 , required : true},       //ye sab frontend men calculate kare ge   1 laptop = 50k  we order 2 laptop then itemPrice = 100k

    taxPrice : {type : Number , default : 0 , required : true},      // 18% add

    shippingPrice : {type : Number , default : 0 , required : true},  // 500

    totalPrice : {type : Number , default : 0 , required : true},   // ye sab add

    orderStatus : {type : String , required : true , default : "Processing"},

    deliveredAt : Date,

    createdAt : {type : Date , deafult : Date.now},
});


module.exports = mongoose.model("Order" , orderSchema);