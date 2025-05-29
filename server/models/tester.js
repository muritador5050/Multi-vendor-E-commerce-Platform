const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

//Person schema
const peopleSchema = new mongoose.Schema({
  name: String,
  balance: { type: Number },
});

const People = mongoose.model('People', peopleSchema);

//Pdt schema
const pdtSchema = new mongoose.Schema({
  name: String,
  price: Number,
  stock: Number,
});

const Pdt = mongoose.model('Pdt', pdtSchema);

//Odr schema
const odrSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'People' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pdt' },
  qty: Number,
  total: Number,
});

const Odr = mongoose.model('Odr', odrSchema);

//Transaction schema
const transactionSchema = new mongoose.Schema({
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'People' },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'People' },
  amount: Number,
});

const Transaction = mongoose.model('Transaction', transactionSchema);

//Controller
class TesterController {
  //Create user
  static async createPerson(req, res) {
    const { name, balance } = req.body;

    const people = await People.insertMany({ name, balance });

    if (!people) {
      return res.status(400).json({ message: 'Invalid user' });
    }

    res.status(201).json({ people: people });
  }

  //Update person
  static async updatePerson(req, res) {
    const person = await People.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
      },
      { new: true }
    );

    if (!person) {
      return res.status(400).json({ message: 'Error in updating' });
    }

    res.json({ message: 'Updated', values: person });
  }

  //Create product
  static async createPdt(req, res) {
    const { name, price, stock } = req.body;
    const pdt = await Pdt.insertMany({ name, price, stock });
    if (!pdt) {
      return res.status(400).json({ message: 'Invalid product' });
    }

    res.status(201).json({ product: pdt });
  }

  //Update pdt
  static async updateProduct(req, res) {
    const pdt = await Pdt.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
      },
      { new: true }
    );

    if (!pdt) {
      return res.status(400).json({ message: 'Error in updating' });
    }

    res.json({ message: 'Updated', values: pdt });
  }

  //Placeorder transaction
  static async placeOrder(req, res) {
    const { userId, productId, qty } = req.body;
    const session = await mongoose.startSession();

    try {
      session.startTransaction();
      const user = await People.findById(userId).session(session);
      const pdt = await Pdt.findById(productId).session(session);

      // Check for missing user or product
      if (!user) throw new Error('User not found');
      if (!pdt) throw new Error('Product not found');

      const total = pdt.price * qty;

      if (pdt.stock < qty) throw new Error('Not enough stock');
      if (user.balance < total) throw new Error('Insufficient balance');

      pdt.stock -= qty;
      user.balance -= total;

      await user.save({ session });
      await pdt.save({ session });

      const order = await Odr.create(
        [{ user: userId, pdt: productId, qty, total }],
        {
          session,
        }
      );

      // COMMIT - All operations succeed together (Atomicity)
      await session.commitTransaction();

      res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        order: {
          id: order[0]._id,
          product: pdt.name,
          qty,
          total,
          remainingStock: pdt.stock,
          balanceAfter: user.balance,
          orderedAt: Date.now(),
        },
      });
    } catch (err) {
      await session.abortTransaction();
      res.status(400).json({
        error: err.message,
        success: false,
      });
    } finally {
      await session.endSession();
    }
  }

  //Start transfer
  static async transferFund(req, res) {
    const session = await People.startSession();

    try {
      await session.withTransaction(async () => {
        const { fromUser, toUser, amount } = req.body;
        const from = await People.findById(fromUser).session(session);
        const to = await People.findById(toUser).session(session);

        if (!from || !to) throw new Error('One of the user not found');

        //Cosistency
        if (from.balance < amount) throw new Error('Insufficient balance');

        from.balance -= amount;
        to.balance += amount;

        const transaction = await Transaction.create(
          [{ fromUser, toUser, amount }],
          { session }
        );

        await from.save({ session });
        await to.save({ session });

        res.json({
          success: true,
          message: 'Transaction successful',
          transactionId: transaction[0]._id,
          From: from.name,
          To: to.name,
          amount: `#${amount}`,
        });
      });
    } finally {
      await session.endSession();
    }
  }
}

router.post('/user', TesterController.createPerson);
router.post('/product', TesterController.createPdt);
router.post('/order', TesterController.placeOrder);
router.post('/transfer', TesterController.transferFund);

//id's
router.put('/user/:id', TesterController.updatePerson);
router.put('/product/:id', TesterController.updateProduct);
module.exports = router;
