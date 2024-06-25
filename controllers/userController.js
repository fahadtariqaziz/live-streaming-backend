const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const User = require("../models/userModel");
const sendToken = require('../utils/jwtToken');
const sendEmail = require("../utils/sendEmail");
const crypto = require('crypto');
const cloudinary = require("cloudinary");
const {FRONTEND_URL} = require('../config/index');

//Register a User

exports.registerUser = catchAsyncErrors( async (req,res,next) => {

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {  
        folder: "avatars",
        width: 150,
        crop: "scale",
    })

    const {name , email , password } = req.body;

    const user = await User.create({
        name ,email,password,
        avatar : {
            //public_id : "this is a sample id",
            public_id : myCloud.public_id,
            //url : "profilePicUrl"
            url : myCloud.secure_url,
        },
    });

    //const token = user.getJWTToken();

    //res.status(201).json({
    //    success : true,
    //    //user,
    //    token,
    //});

    sendToken(user , 201 , res);
});



//login User

exports.loginUser = catchAsyncErrors( async (req,res,next) => {

    const {email , password } = req.body;//login karne ke liye kia chaheye controller sath email , password
    
    if(!email || !password){
        return next( new ErrorHandler (" Please Enter Email & Password" , 400))
    }

    // ERROR(user.comparePassword is not a function)  const user = User.findOne({ email }).select("+password") ;  //phir database men dhonde ge   peeche password select ko false kiya hua isliye yaha add kare ge     isse user mil jaye ga  agar ni milta tou neeche wali line
    const user = await User.findOne({ email }).select("+password") ;  //phir database men dhonde ge   peeche password select ko false kiya hua isliye yaha add kare ge     isse user mil jaye ga  agar ni milta tou neeche wali line

    if(!user){
        return next(new ErrorHandler ("Invalid email or password" , 401));
    }

    const isPasswordMatched = user.comparePassword(password);       //user mil gya tou password match kare ge argument men password denge jo destructure kiya matlb jo khud likha abhi    ye comparePassword banaye ge userModel men

    if(!isPasswordMatched){
        return next(new ErrorHandler ("Invalid email or password" , 401));
    }

    //const token = user.getJWTToken();        ye sab jwtToken.js men karliya or cookie men store bhi karwa diya with options or response men cookie bhi di json se pehle

    //res.status(200).json({
    //    success : true,
    //    //user,
    //    token,
    //});

    sendToken(user , 200 , res);  //res aese he bhej den ge


})


//logout user

exports.logout = catchAsyncErrors( async (req,res,next) =>{

    //ERROR req.cookie is not a function    tou res.cookie hoga 
    res.cookie("token" , null , {         //token keyword phir token ki value thi usko null likh diya     cookie jab response men json ke sath send ki thi jwtToken.js in utils men tou ye kiya tha
        expires : new Date(Date.now()),
        httpOnly : true,
    })  

    res.status(200).json({
        success:true,
        message : "Logged Out ",
    });
});



//when click on forgot password

exports.forgotPassword = catchAsyncErrors( async (req,res,next) => {

    const user = await User.findOne({email: req.body.email});  //email ke through user dhoonde ge req.body.email matlb mongodb men men email hai

    if(!user){
        return next( new ErrorHandler("User not found" , 404));
    }

    //get resetPssword token
    const resetToken = user.getResetPasswordToken();     //jese userSchema.methods men likha hua  ye kuch return kar rha   tou isko kisi cheeze men save bhi karna pare ga
    //const resetToken = 'bf9450a3768a7f9c949d1903fc822f335896bf15'


    await user.save({validateBeforeSave : false});     //hamei password mil gya save bhi karliya

    //const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;        //hamei jo link bhejna usko tayar karte    http ya https    localhost  ya koi or
    const resetPasswordUrl = `${FRONTEND_URL}/password/reset/${resetToken}`;

    const message = `Your very new password reset token is :- \n\n  ${resetPasswordUrl}  \n\n  If you have not requested this email then, please ignore it`;   //jo bheje ge email men

    try{
        await sendEmail({             //abhi ye banaye ge jisme pora object diya hua hai

            email : user.email,   //user.email ko email bhejni
            subject : `FAHAD Ecommerce Website Password Recovery`,   //title yehi hai
            message,  //ye oper wala message
        });

        res.status(200).json({
            success:true,
            message : `Email send to ${user.email} successfully`,
        })
    }
    catch(error){
        user.resetPasswordToken = undefined;    //kyu ke oper humne save wale method ko call karke  usse pehle token generate karke  in dono cheezon ko database men save karliya   tou undefined karke dobara save
        user.resetPasswordExpire = undefined;
    
        await user.save({validateBeforeSave : false});

        return next(new ErrorHandler (error.message , 500));
    }
});


//ResetPassword after getting link on gmail

exports.resetPassword = catchAsyncErrors( async (req,res,next) => {

    //this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");               
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");          //req.params.url karkek access karle ge email wala token   us token ko use karke apne user ko database men dhonde ge  tou pehle jo token aye ga usko hash karle ge
    //const resetPasswordToken = crypto.createHash("sha256").put(req.params.token).digest("hex");          //req.params.url karkek access karle ge email wala token   us token ko use karke apne user ko database men dhonde ge  tou pehle jo token aye ga usko hash karle ge


    const user = await User.findOne({      //resetPasswordToken se user dhoonde ge
        resetPasswordToken,
        resetPasswordExpire : { $gt : Date.now()}
    });

    if(!user){
        return next(new ErrorHandler ("Reset Password Token is invalid or has been expired" , 400));
    }

    //ab user mil gya tou  password badalna hai lakin usme new password jo dala hai wo or confirm unequal diye aqalmand
    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("password does not match" ,400));
    }

    //ab agar wo bhi theek tou user ka password badal dein ge

    user.password = req.body.password;
    user.resetPasswordToken = undefined;  //indono ka koi matlb nae banta ab tou undefined  //kyu ke oper humne save wale method ko call karke  usse pehle token generate karke  in dono cheezon ko database men save karliya   tou undefined karke dobara save
    user.resetPasswordExpire = undefined;
   
    
    await user.save();

    //tou ab login bhi karde ge

    sendToken(user,200,res);  //login ho jaye ga     ye response he hai isko short kar diya tha
});





//get user details    aese he product men bhi banaya tha product details    ye apni details ke liye hai   user ki details ke liye neeche banaye ge
exports.getUserDetails = catchAsyncErrors( async (req,res,next) => {       

    const user = await User.findById(req.user.id);        //ye wala route wohi access kar skta jisne login kar rkha hai    auth.js men humne kiya hai ke agar user login hai matlb isAuthenticated hai tou req.user men pora user save ho jata hai

    res.status(200).json({
        success : true,
        user,
    });

});



//update User password
exports.updatePassword = catchAsyncErrors( async (req,res,next) => {       

    const user = await User.findById(req.user.id).select("+password");        //ye wala route wohi access kar skta jisne login kar rkha hai    auth.js men humne kiya hai ke agar user login hai matlb isAuthenticated hai tou req.user men pora user save ho jata hai

    const isPasswordMatched = user.comparePassword(req.body.oldPassword);       //user mil gya tou password match kare ge argument men password denge jo destructure kiya matlb jo khud likha abhi    ye comparePassword banaye ge userModel men

    if(!isPasswordMatched){
        return next(new ErrorHandler ("Old password is incorrect" , 400));
    }
    
    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler ("Password doesnot match" , 400));    
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user,200,res);

    //res.status(200).json({
    //    success : true,
    //    user,
    //});

});



//update User profile     
exports.updateProfile = catchAsyncErrors( async (req,res,next) => {       

    const newUserData = {
        name : req.body.name,    //req.body wo hai jo hum insomnia men denge abhi usko ek variable men save kara rhe    req.user men current login user ka data hoga
        email : req.body.email,
    }
    //const user = await User.findById(req.user.id).select("+password");        //ye wala route wohi access kar skta jisne login kar rkha hai    auth.js men humne kiya hai ke agar user login hai matlb isAuthenticated hai tou req.user men pora user save ho jata hai

    //const isPasswordMatched = user.comparePassword(req.body.oldPassword);       //user mil gya tou password match kare ge argument men password denge jo destructure kiya matlb jo khud likha abhi    ye comparePassword banaye ge userModel men

    //we will add cloudinary later
    if(req.body.avatar !== ""){
        //khali ni tou user dhoondh lo
        const user = await User.findById(req.user.id);

        const imageId = user.avatar.public_id;

        await cloudinary.v2.uploader.destroy(imageId);  //porani image delete
    
        //ab again image upload karle ge
        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {  
            folder: "avatars",
            width: 150,
            crop: "scale",
        })

        //ab newuserData jo object banaya issi men oper isme name email tha tou ab avatar ki property bhi add kardi
        newUserData.avatar = {
            public_id : myCloud.public_id,
            url : myCloud.secure_url,
        }
    } // ye ni lagaya tou kehta user is already been declared condition band ni ki thi ye

    const user = await User.findByIdAndUpdate(req.user.id , newUserData,{
        new : true,
        runValidators : true,
        useFindAndModify : false,
    }); 



    //await user.save();

    //sendToken(user,200,res);   send token ki zarorat ni

    
    res.status(200).json({       //or bas ye update ho jaye ga khudi oper wale method se
        success : true,
        //user,
    });
});



//Get all users (admin)

exports.getAllUsers = catchAsyncErrors(async (req,res,next) => {

    const user = await User.find();      //bina kisi parameter ke sare dhoond dega

    res.status(200).json({
        success : true,
        user,
    });
});


//Get single users (admin)

exports.getSingleUser = catchAsyncErrors(async (req,res,next) => {

    const user = await User.findById(req.params.id);      //agar req.user.id karen ge tou login user matlb admin ki ajaye gi kyu ke req.user men sara user ka data save kara diya tha

    if(!user){
        return next(new ErrorHandler( `User does not exist with id : ${req.params.id}` , 400));
    };

    res.status(200).json({
        success : true,
        user,
    });
});



//update User  X(profile)   > Role    --admin
exports.updateUserRole = catchAsyncErrors( async (req,res,next) => {       

    const newUserData = {
        name : req.body.name,    //req.body wo hai jo hum insomnia men denge abhi usko ek variable men save kara rhe    req.user men current login user ka data hoga
        email : req.body.email,
        role : req.body.role
    }
    //const user = await User.findById(req.user.id).select("+password");        //ye wala route wohi access kar skta jisne login kar rkha hai    auth.js men humne kiya hai ke agar user login hai matlb isAuthenticated hai tou req.user men pora user save ho jata hai

    //const isPasswordMatched = user.comparePassword(req.body.oldPassword);       //user mil gya tou password match kare ge argument men password denge jo destructure kiya matlb jo khud likha abhi    ye comparePassword banaye ge userModel men

    //we will add cloudinary later   no cloudinary zarorat kyu ke tum kisi or ki profile thori badal doge
    

    const user = await User.findByIdAndUpdate(req.params.id , newUserData,{        //req.user.id ni karna warna admin khudi update ho jaye ga
        new : true,
        runValidators : true,
        useFindAndModify : false,
    }); 



    //await user.save();

    //sendToken(user,200,res);   send token ki zarorat ni

    
    res.status(200).json({       //or bas ye update ho jaye ga khudi oper wale method se
        success : true,
        //user,
    });
});



//delete user --admin
exports.deleteUser = catchAsyncErrors( async (req,res,next) => {

    const user = await User.findById(req.params.id);
    //we will remove cloudinary later

    if(!user){
        return next (new ErrorHandler( `user doen not exist with Id : ${req.params.id}` , 400) );
    }

    await user.deleteOne(user);

    res.status(200).json({
        success : true,
        message : "User Deleted Successfully "
    });
}); 



