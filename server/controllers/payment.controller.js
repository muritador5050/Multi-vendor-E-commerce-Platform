const Payment = require('../models/payment.model');
const { resSuccessObject } = require('../utils/responseObject');

//Payment controller
class PaymentController {
  //Create a new payment
  static async createPayment(req, res) {
    const {
      order,
      paymentProvider,
      paymentId,
      amount,
      currency,
      status,
      paidAt,
    } = req.body;

    const existingPayment = await Payment.findOne({ paymentId });
    if (existingPayment) {
      res.status(400).json({ message: 'Payment already exist!' });
    }

    const payment = await Payment.create({
      order,
      paymentProvider,
      paymentId,
      amount,
      currency: currency || 'USD',
      status: status || 'pending',
      paidAt,
    });

    res.json(resSuccessObject({ results: payment }));
  }

  //Get all payments
  static async getAllPayments(req, res) {
    const {
      status,
      orderId,
      paidAt,
      paymentProvider,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (orderId) filter.orderId = orderId;
    if (paidAt) filter.paidAt = paidAt;
    if (paymentProvider) filter.paymentProvider = paymentProvider;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const payment = await Payment.find(filter)
      .populate('order')
      .skip(skip)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const totalPayments = await Payment.countDocuments(filter);
    const numOfPages = Math.ceil(totalPayments / parseInt(limit));

    res.json(
      resSuccessObject({
        results: payment,
        count: payment.length,
        totalPayments,
        numOfPages,
        currentPage: parseInt(page),
      })
    );
  }

  //Get payment by ID
  static async getPaymentById(req, res) {
    const payment = await Payment.findById(req.params.id).populate('order');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    res.json(resSuccessObject({ results: payment }));
  }

  //Update payment status
  static async updatePaymentStatus(req, res) {
    const { paidAt, status } = req.body;

    if (
      !status ||
      !['pending', 'completed', 'failed', 'refunded'].includes(status)
    ) {
      res.status(404).json({ message: 'Please provide a valid status' });
    }

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        paidAt,
        status,
      },
      { new: true, runValidators: true }
    ).populate('order');

    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(
      resSuccessObject({
        results: payment,
      })
    );
  }

  //Delete or Cancel payment
  static async deletePayment(req, res) {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment)
      return res.status(404).json({ message: 'Payment did not found' });

    res.json(
      resSuccessObject({
        message: 'Payment deleted successfully',
      })
    );
  }
}

module.exports = PaymentController;
