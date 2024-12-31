

const { default: axios } = require("axios");
const {BookingRepository}=require("../repositories")
const {serverConfig}=require("../config")
const db=require("../models");
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");
const {ENUMS} = require('../utils/common');
const { BOOKED, CANCELLED } = ENUMS.BOOKING_STATUS;


const bookingrepository=new BookingRepository();




async function createBooking(data) {
    const transaction = await db.sequelize.transaction();
    try {
        const flight = await axios.get(`${serverConfig.Flight_Service}/api/v1/flights/${data.flightId}`);
        const flightData = flight.data.data;
        if(data.noOfSeats > flightData.totalSeats) {
            throw new AppError('Not enough seats available', StatusCodes.BAD_REQUEST);
        }
        const totalBillingAmount = data.noOfSeats * flightData.price;
        const bookingPayload = {...data, totalCost: totalBillingAmount};
        const booking = await bookingrepository.create(bookingPayload, transaction);

        await axios.patch(`${serverConfig.Flight_Service}/api/v1/flights/${data.flightId}/seats`, {
            seats: data.noOfSeats
        });

        await transaction.commit();
        return booking;
    } catch(error) {
        await transaction.rollback();
        throw error;
    }
    
}

async function makePayment(data) {
    const transaction = await db.sequelize.transaction();
    try {
        const bookingDetails = await bookingrepository.get(data.bookingId, transaction);
        if(bookingDetails.status == CANCELLED) {
            throw new AppError('The booking has expired', StatusCodes.BAD_REQUEST);
        }
        console.log(bookingDetails);
        const bookingTime = new Date(bookingDetails.createdAt);
        const currentTime = new Date();
        if(currentTime - bookingTime > 300000) {
            await cancelBooking(data.bookingId);
            throw new AppError('The booking has expired', StatusCodes.BAD_REQUEST);
        }
        if(bookingDetails.totalCost != data.totalCost) {
            throw new AppError('The amount of the payment doesnt match', StatusCodes.BAD_REQUEST);
        }
        if(bookingDetails.userId != data.userId) {
            throw new AppError('The user corresponding to the booking doesnt match', StatusCodes.BAD_REQUEST);
        }
        // we assume here that payment is successful
         await bookingrepository.update(data.bookingId, {status: BOOKED}, transaction);
        await transaction.commit();
    } catch(error) {
        await transaction.rollback();
        throw error;
    }
}

    async function cancelBooking(bookingId) {
        const transaction = await db.sequelize.transaction();
        try {
            const bookingDetails = await bookingrepository.get(bookingId, transaction);
            console.log(bookingDetails);
            if(bookingDetails.status == CANCELLED) {
                await transaction.commit();
                return true;
            }
            await axios.patch(`${serverConfig.Flight_Service}/api/v1/flights/${bookingDetails.flightId}/seats`, {
                seats: bookingDetails.noOfSeats,
                dec: 0
            });
            await bookingrepository.update(bookingId, {status: CANCELLED}, transaction);
            await transaction.commit();
    
        } catch(error) {
            await transaction.rollback();
            throw error;
        }
    }
    
    async function cancelOldBookings() {
        try {
            console.log("Inside service")
            const time = new Date( Date.now() - 1000 * 300 ); // time 5 mins ago
            const response = await bookingrepository.cancelOldBookings(time);
            
            return response;
        } catch(error) {
            console.log(error);
        }
}



module.exports={
    createBooking,
    makePayment,
    cancelOldBookings
}
