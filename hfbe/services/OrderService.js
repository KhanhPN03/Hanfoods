const Order = require('../models/Order');
const { v4: uuidv4 } = require('uuid');

function generateOrderCode(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const OrderService = {
  async createOrder(userId, orderData) {
    // Tạo orderId mới
    const orderId = 'ORD-' + uuidv4().substring(0, 8).toUpperCase();
    // Sinh orderCode 8 ký tự ngẫu nhiên
    const orderCode = generateOrderCode(8);
    // Tạo mới Order
    const newOrder = new Order({
      ...orderData,
      userId,
      orderId,
      orderCode
    });
    await newOrder.save();
    return newOrder;
  },
  async getUserOrders(userId) {
    try {
      const orders = await Order.find({ userId, deleted: false })
        .populate('addressId')
        .sort({ createdAt: -1 });
      return orders;
    } catch (error) {
      throw error;
    }
  },
  async getOrderById(orderId, userId = null) {
    try {
      const query = { _id: orderId, deleted: false };
      if (userId) {
        query.userId = userId;
      }
      const order = await Order.findOne(query)
        .populate('userId', 'username email')
        .populate('addressId');
      if (!order) {
        throw new Error('Order not found');
      }
      return order;
    } catch (error) {
      throw error;
    }
  },
  // ...có thể bổ sung các hàm khác nếu cần...
};

module.exports = OrderService;
