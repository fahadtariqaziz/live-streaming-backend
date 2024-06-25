const dotenv = require('dotenv').config();

const PORT = process.env.PORT;
const MONGODB_CONNECTION_STRING = process.env.MONGODB_CONNECTION_STRING;

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE; 

const COOKIE_EXPIRE = process.env.COOKIE_EXPIRE;

const SMPT_SERVICE = process.env.SMPT_SERVICE; 
const SMPT_MAIL = process.env.SMPT_MAIL;
const SMPT_PASSWORD = process.env.SMPT_PASSWORD; 
const SMPT_HOST = process.env.SMPT_HOST; 

const CLOUDINARY_NAME = process.env.CLOUDINARY_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET  = process.env.CLOUDINARY_API_SECRET;

const FRONTEND_URL = process.env.FRONTEND_URL;

const STRIPE_API_KEY = process.env.STRIPE_API_KEY;

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

module.exports = {
    PORT,
    MONGODB_CONNECTION_STRING,
    JWT_SECRET,
    JWT_EXPIRE,
    COOKIE_EXPIRE,
    SMPT_SERVICE,
    SMPT_MAIL,
    SMPT_PASSWORD,
    SMPT_HOST,
    CLOUDINARY_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    FRONTEND_URL,
    STRIPE_API_KEY,
    STRIPE_SECRET_KEY,
}