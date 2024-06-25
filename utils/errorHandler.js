class ErrorHandler extends Error{

    constructor(message,statusCode)
    {
        //super matlb extends Error se message le rhe
        super(message);
        this.statusCode = statusCode

        //extend kiya error tou uske methods bhi use kar skte
        Error.captureStackTrace(this,this.constructor);
    }
}

module.exports = ErrorHandler;