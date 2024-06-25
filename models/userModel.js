const mongoose = require('mongoose');
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {JWT_EXPIRE, JWT_SECRET} = require("../config/index");

const userSchema = new mongoose.Schema({
    
    name : {
        type : String,
        required : [true , "Please Enter your name"],
        maxLength : [30, "Name cannot exceed 30 characters"],
        minLength : [4, "Name should have more than 4 characters"]
    },
    email : {
        type : String,
        required : [true, "Please Enter Your Email"],
        unique : true,    //same ni honi chaheye
        validate : [validator.isEmail, "Please Enter a valid Email"]
    },
    password : {
        type : String,
        required : [true , "Please Enter Your Password"],
        minLength : [8, "Password should be greater than 8 characters "],
        select : false    //jab bhi call hoga like find() tou password ko chor ke baki sab mil jaye ga
    },
    avatar: {                  
        //productModel men bhi image men ye dala tha sab lakin waha array men kiya tha yaha object men
        public_id : {
            type : String,
            required: true
        },
        url : {
            type : String,
            required: true
        }
        
    },
    role:{          //admin hai ya user
        type : String,
        default : "user"
    },

    createdAt:{
        type: Date,
        default: Date.now
    },

    resetPasswordToken : String,
    resetPasswordExpire: Date,
})

userSchema.pre("save" , async function (next) {        //jab bhi save hoga tou pehle ye hoga
    
    if( !this.isModified("password")){         //ek condition lagae ge jab update kare ge tou name or email update kare ge bas tou tab bhi ye hashed password ko dobara hash karde ga
        next();
    }    
    this.password = await bcrypt.hash(this.password, 10)      //10 character ka password hoga
});



//JWT TOKEN :  generate and store in cookies taake server ko pta chal jaye ye user hai ye access kar skta routes   import karlete

userSchema.methods.getJWTToken = function (){
    return jwt.sign( {id : this._id} , JWT_SECRET ,{
        expiresIn : JWT_EXPIRE,     //ab ye method ban gya userSchema ka
    });      //isme token bna rahe hai uske liye _id jo mongodb generate karti automatically models men  or agar key ksi ke hath lag gye tou they create tons of fake id for admin
};



//compare Password

userSchema.methods.comparePassword = async function (enteredPassword){
    return await bcrypt.compare(enteredPassword , this.password);       //bcrypt ka method hai ye khudi compare karleta hai     this ka matlb ye userSchema khud jo mongodb men individual user hai tou uske password ka hash mil jaye ga   or ye return karde ga true ya false    or sath await bhi lga dete
};




//Reset Password Token generation
const crypto = require("crypto");

userSchema.methods.getResetPasswordToken = function(){
    //generate token
    const resetToken = crypto.randomBytes(20).toString("hex");         //234234eweddw234fdsfs32 aese ajaye gi abhi isko hash men karna  
    
    //Hashing and adding to userSchema   abhi tak oper resetPassword Token men value ni di jo string tha
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");           //sha 256 algorithm pass karen ge method men   update bhi likhna zarori or digest convert karde ga lambi string men   or agar hex hta den tou phir se buffer value 9c 85 9c 70 2d 1f

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000     //abhi jo time hua usme 15 minutes add sath multiply 1000 kyu ke milisec men hota

    return resetToken;
}


module.exports = mongoose.model("User" , userSchema);