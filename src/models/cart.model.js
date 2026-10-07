import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      max: [50, 'Cannot exceed 50 units per item']
    },
    priceSnapshot: {
      type: Number,
      required: true // Price at the time of adding
    }
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    items: {
      type: [cartItemSchema],
      default: []
    },
    subtotal: {
      type: Number,
      default: 0
    },
    totalItems: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Cart calculation helper method
cartSchema.methods.recalculateTotals = function () {
  let subtotal = 0;
  let totalItems = 0;

  this.items.forEach((item) => {
    subtotal += item.priceSnapshot * item.quantity;
    totalItems += item.quantity;
  });

  this.subtotal = subtotal;
  this.totalItems = totalItems;
};

export const Cart = mongoose.model('Cart', cartSchema);