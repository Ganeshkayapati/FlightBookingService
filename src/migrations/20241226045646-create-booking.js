'use strict';
/** @type {import('sequelize-cli').Migration} */

const {ENUMS}=require("../utils/common");
const {BOOKED,CANCELLED,INITIATED,PENDING}=ENUMS.BOOKING_STATUS;
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Bookings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      flightId: {
        type: Sequelize.INTEGER,
        allowNull:false
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull:false
      },
      status: {
        type: Sequelize.ENUM,
        values:[BOOKED,CANCELLED,INITIATED,PENDING],
        default:INITIATED,
        allowNull:false
      },
      noOfSeats:{
        type:Sequelize.INTEGER,
        default:1,
        allowNull:false,
      },
      totalCost: {
        type: Sequelize.INTEGER,
        allowNull:false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Bookings');
  }
};