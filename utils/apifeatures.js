class ApiFeatures {
    constructor (query , queryStr){
        this.query = query;               //query in url means anything after
        this.queryStr = queryStr;         //query str array hai matlb hum add karke keyword value phir add karke category value
    }

/*    search(){      //querystr yaha oper se mil jaye ga jo hum de rhe productController men new ApiFeature ke andar 2nd parameter wo keyword hai like sammosa  lakin hamei pattern follow karna agar usse aage bhi kuch hai phir bhi recognize karle ga
        
        const keyword = this.queryStr.keyword ? {
            name : {
                $regex : this.queryStr.keyword,
                $options : "i",       //matlb case insensitive captitle diya tou small bhi find karle ga
            },
        } 
        : 
        {};

        console.log(keyword);

        //this.query ka matlb Product.find() or ussi ko ko change kar rhe hum usme keyword bhej rhe jo regex se bnaya
        this.query = this.query.find({...keyword});

        return this;    //ye function hai ye return kare ga this  yehi class wapis se return  or iss function ko call karein ge productController men search()
    }
*/

search() {
    let keyword = {};
    if (Array.isArray(this.queryStr.keyword)) {
        // If this.queryStr.keyword is an array, take the first element as the keyword
        keyword = {
            name: {      //name banana pare ga kia dhoondna uske liye mongodb ka operator regex regular expression
                $regex: this.queryStr.keyword[0], // Take the first element
                $options: "i",
            },
        };
    } else if (typeof this.queryStr.keyword === "string") {
        // If this.queryStr.keyword is a string, use it as the keyword
        keyword = {
            name: {
                $regex: this.queryStr.keyword,
                $options: "i",
            },
        };
    }

    console.log(keyword);

    this.query = this.query.find({ ...keyword });

    return this;
}



//category ke liye filter
filter(){
    //const queryCopy = this.queryStr   //ye value ni mile gi usse refrence mila hai kyu ke javascript men jitne bhi object wo as a reference pas hote hen   tou agar queryCopy men change karo tou usme bhi ho jaye ga   tou dot operator use kare ge ab reference ni mila ab copy ban chuki hai
    const queryCopy = {...this.queryStr}

    console.log(queryCopy);   //queryCopy object hai queryStr string hai
    //removing some field for category    ek tou keyword remove karna
    const removeFields = ["keyword" , "page" , "limit"];

    removeFields.forEach( key => delete queryCopy[key]);      //removeFields wali array ke element ko ek element ko key keh dete or queryCopy ki array se key element delete kar dete

    //Filter for Price and Rating   agar aese he insomia men dein price[gt] price[lt] tou yaha neeche object banke ajaye ga lakin mongodb operator ke sath $ lagta hai wo lagana pare ga
    console.log(queryCopy);
    //sab se pehle object queryCopy ko string men convert kare ge let
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g,key => `$${key}`);
    //ab wapis object men replace JSON.parse karke
    console.log(queryCopy);
    //this.query = this.query.find(queryCopy);   //ye return kardi warna internal Server error  // jab ye likha ho iska matlb product.find method       or  query.str  ka matlb  req.query   ye productController men jo constructor men value di usse pta chala
    this.query = this.query.find(JSON.parse(queryStr));
    console.log(queryStr);
    return this;

}


    pagination(resultPerPage){
        const currentPage = Number(this.queryStr.page) || 1; //queryStr ka ab pta chal gya hogya dobara bta deta matlb url men jitni bhi query aye gi  queryStr.keyword kiya tha tou keyword mil gya tha   aese he page ki bhi ek query de dete waha page 2  agar kisi ne page ni diya tou 1 bydefault   Str string or hamei chaheye number tou number men wrap kardien ge

        const skip = resultPerPage * (currentPage - 1) //2nd page pe jaane ke liye 10 product skip agar ek page pe 10 hen    hum 1 page pe hen tou 1-1=0 10*0=0  tou 0 skip karni
    
        this.query = this.query.limit(resultPerPage).skip(skip);  //this.query  find method hai  find method karte he saare product dikhne lage gi   lakin limit lagte he starting ki 5 product    agar 2nd page khola tou skip karde ga sath 10 products 

        return this;
    }

    sort(sortBy) {
        if (sortBy) {
            this.query = this.query.sort(sortBy);
        }
        return this;
    }


}

module.exports = ApiFeatures;