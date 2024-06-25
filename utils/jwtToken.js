const {COOKIE_EXPIRE} = require('../config/index');

//creating token and saving in cookie     create tou ni kiya  balke create he kiya user ke sath getJWTToken wo create karta

const sendToken = (user,statusCode,res) => {

    const token = user.getJWTToken();      //token access kar rhe    user kaha se mila oper parameter se agya  tou token mil jaye ga

    //options for cookie     cookie men bhejna token tou uske liye kuch options hote

    const options = {      //options jo ke object hai   isme http true   or expiryTime

        expires : new Date(
            Date.now() + COOKIE_EXPIRE * 24 * 60 * 60 * 1000    //ye milisecond men convert kar liya time     7 dein ge tou 7 din baad expire ho jaye ga 
        ),
        httpOnly: true,
    };

    res.status(statusCode).cookie('token', token , options).json({ //ab wohi karna respose jese login register men kiya    response/res  oper se mil jaye ga  login men 200 register men 201 tou parameter wale statusCode se mil jaye ga        cookie men pehle keyword wese he phir actual token phir options
        success : true,
        user,
        token,
    });

};

module.exports = sendToken;