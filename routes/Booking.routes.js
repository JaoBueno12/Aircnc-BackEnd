const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/Booking.controller');

// POST /bookings/:spot_id/spots
router.post('/:spot_id/spots', BookingController.store);

// POST /bookings/:booking_id/approvals
router.post('/:booking_id/approvals', BookingController.storeApproval);

// POST /bookings/:booking_id/rejections
router.post('/:booking_id/rejections', BookingController.storeRejection);

module.exports = router;
