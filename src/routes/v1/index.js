const express=require("express");

const {infoController}=require("../../controllers/index");
const bookingRoutes=require("./booking-routes")

const router=express.Router();

router.get("/info",infoController.info);
router.use("/bookings",bookingRoutes);

module.exports=router;