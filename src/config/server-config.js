const dotenv=require("dotenv");
dotenv.config();

module.exports={
    PORT:process.env.PORT,
    Flight_Service:process.env.FLIGHT_SERVICE
}