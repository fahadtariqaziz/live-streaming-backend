const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const {STRIPE_SECRET_KEY, STRIPE_API_KEY} = require("../config/index");
const stripe = require("stripe")(STRIPE_SECRET_KEY);

exports.processPayment = catchAsyncErrors(async (req,res,next) => {

    const myPayment = await stripe.paymentIntents.create({        //create method hai isme sab se pehle amount deni
        amount : req.body.amount,
        currency: "pkr" ,
        metadata: {
            company : "FahaD EC",
        },
    });

    res
        .status(200)
        .json({
            success : true,
            client_secret: myPayment.client_secret
        });
});



exports.sendStripeApiKey = catchAsyncErrors(async (req,res,next) => {

    
    res
        .status(200)
        .json({
            stripeApiKey : STRIPE_API_KEY
        });
});

