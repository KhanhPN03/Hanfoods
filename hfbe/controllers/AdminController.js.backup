const Order = require('../models/Order');
const Product = require('../models/Product');
const Account = require('../models/Account');
const moment = require('moment');

class AdminController {
  // Dashboard Statistics
  async getDashboardStats(req, res) {
    try {
      const { timeRange = '30d' } = req.query;
      const days = parseInt(timeRange.replace('d', '')) || 30;
      const startDate = moment().subtract(days, 'days').toDate();

      // Get basic stats
      const [totalProducts, totalUsers, totalOrders] = await Promise.all([
        Product.countDocuments({ isActive: true }),
        Account.countDocuments({ role: 'customer' }),
        Order.countDocuments({ createdAt: { $gte: startDate } })
      ]);

      // Calculate total revenue
      const revenueAgg = await Order.aggregate([
        { $match: { createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
      ]);

      const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

      // Get low stock products
      const lowStockCount = await Product.countDocuments({ 
        stock: { $lt: 10 }, 
        isActive: true 
      });

      // Get pending orders
      const pendingOrders = await Order.countDocuments({ 
        status: 'pending',
        createdAt: { $gte: startDate }
      });

      // Get active users (users who placed orders in timeRange)
      const activeUsers = await Order.distinct('customer', {
        createdAt: { $gte: startDate }
      });

      res.json({
        success: true,
        data: {
          products: {
            totalProducts,
            lowStockCount
          },
          orders: {
            totalOrders,
            pendingOrders,
            totalRevenue
          },
          users: {
            totalUsers,
            activeUsers: activeUsers.length
          }
        }
      });
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching dashboard statistics',
        error: error.message
      });
    }
  }

  // Revenue Statistics
  async getRevenueStats(req, res) {
    try {
      const { timeRange = '30d' } = req.query;
      const days = parseInt(timeRange.replace('d', '')) || 30;
      const startDate = moment().subtract(days, 'days').toDate();
      const monthStart = moment().startOf('month').toDate();
      const yearStart = moment().startOf('year').toDate();

      // Total revenue in timeRange
      const totalRevenueAgg = await Order.aggregate([
        { $match: { createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
      ]);

      // Monthly revenue
      const monthlyRevenueAgg = await Order.aggregate([
        { $match: { createdAt: { $gte: monthStart }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, monthlyRevenue: { $sum: '$total' } } }
      ]);

      // Yearly revenue
      const yearlyRevenueAgg = await Order.aggregate([
        { $match: { createdAt: { $gte: yearStart }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, yearlyRevenue: { $sum: '$total' } } }
      ]);

      // Average order value
      const avgOrderValueAgg = await Order.aggregate([
        { $match: { createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, avgOrderValue: { $avg: '$total' } } }
      ]);

      // Total orders and customers
      const totalOrders = await Order.countDocuments({
        createdAt: { $gte: startDate },
        status: { $ne: 'cancelled' }
      });

      const totalCustomers = await Order.distinct('customer', {
        createdAt: { $gte: startDate }
      });

      res.json({
        success: true,
        data: {
          totalRevenue: totalRevenueAgg[0]?.totalRevenue || 0,
          monthlyRevenue: monthlyRevenueAgg[0]?.monthlyRevenue || 0,
          yearlyRevenue: yearlyRevenueAgg[0]?.yearlyRevenue || 0,
          avgOrderValue: avgOrderValueAgg[0]?.avgOrderValue || 0,
          totalOrders,
          totalCustomers: totalCustomers.length
        }
      });
    } catch (error) {
      console.error('Revenue stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching revenue statistics',
        error: error.message
      });
    }
  }

  // Revenue Analytics
  async getRevenueAnalytics(req, res) {
    try {
      const { timeRange = '12m' } = req.query;
      const months = parseInt(timeRange.replace('m', '')) || 12;
      
      // Monthly revenue chart data
      const monthlyData = [];
      for (let i = months - 1; i >= 0; i--) {
        const monthStart = moment().subtract(i, 'months').startOf('month').toDate();
        const monthEnd = moment().subtract(i, 'months').endOf('month').toDate();
        
        const [revenueAgg, ordersCount] = await Promise.all([
          Order.aggregate([
            { 
              $match: { 
                createdAt: { $gte: monthStart, $lte: monthEnd },
                status: { $ne: 'cancelled' }
              }
            },
            { $group: { _id: null, revenue: { $sum: '$total' } } }
          ]),
          Order.countDocuments({
            createdAt: { $gte: monthStart, $lte: monthEnd },
            status: { $ne: 'cancelled' }
          })
        ]);

        monthlyData.push({
          month: moment(monthStart).format('MMM YY'),
          revenue: revenueAgg[0]?.revenue || 0,
          orders: ordersCount
        });
      }

      // Category revenue breakdown
      const categoryRevenue = await Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.product',
            foreignField: '_id',
            as: 'productInfo'
          }
        },
        { $unwind: '$productInfo' },
        {
          $group: {
            _id: '$productInfo.category',
            revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
          }
        },
        { $sort: { revenue: -1 } }
      ]);

      // Format monthly chart data
      const monthlyRevenue = {
        labels: monthlyData.map(d => d.month),
        datasets: [
          {
            label: 'Doanh thu (VNĐ)',
            data: monthlyData.map(d => d.revenue),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            yAxisID: 'y'
          },
          {
            label: 'Số đơn hàng',
            data: monthlyData.map(d => d.orders),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: false,
            yAxisID: 'y1'
          }
        ]
      };

      // Format category chart data
      const totalCategoryRevenue = categoryRevenue.reduce((sum, cat) => sum + cat.revenue, 0);
      const categoryChart = {
        labels: categoryRevenue.map(cat => cat._id || 'Khác'),
        datasets: [{
          data: categoryRevenue.map(cat => 
            totalCategoryRevenue > 0 ? ((cat.revenue / totalCategoryRevenue) * 100).toFixed(1) : 0
          ),
          backgroundColor: [
            '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
            '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#64748b'
          ]
        }]
      };

      res.json({
        success: true,
        data: {
          monthlyRevenue,
          categoryRevenue: categoryChart,
          rawCategoryData: categoryRevenue
        }
      });
    } catch (error) {
      console.error('Revenue analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching revenue analytics',
        error: error.message
      });
    }
  }

  // Detailed Revenue Report
  async getDetailedRevenue(req, res) {
    try {
      const { startDate, endDate, category, page = 1, limit = 50 } = req.query;
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      let matchCondition = {
        createdAt: { $gte: start, $lte: end },
        status: { $ne: 'cancelled' }
      };

      const pipeline = [
        { $match: matchCondition },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.product',
            foreignField: '_id',
            as: 'productInfo'
          }
        },
        { $unwind: '$productInfo' }
      ];

      // Add category filter if specified
      if (category) {
        pipeline.push({
          $match: { 'productInfo.category': category }
        });
      }

      pipeline.push(
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              productId: '$items.product',
              productName: '$productInfo.name',
              category: '$productInfo.category'
            },
            quantity: { $sum: '$items.quantity' },
            unitPrice: { $first: '$items.price' },
            totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
            // Assuming 15% profit margin on average
            profit: { $sum: { $multiply: ['$items.quantity', '$items.price', 0.15] } }
          }
        },
        {
          $project: {
            date: '$_id.date',
            category: '$_id.category',
            product: '$_id.productName',
            quantity: 1,
            unitPrice: 1,
            totalRevenue: 1,
            profit: 1,
            profitMargin: {
              $multiply: [
                { $divide: ['$profit', '$totalRevenue'] },
                100
              ]
            }
          }
        },
        { $sort: { date: -1 } }
      );

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const results = await Order.aggregate([
        ...pipeline,
        { $skip: skip },
        { $limit: parseInt(limit) }
      ]);

      // Get total count for pagination
      const totalCountPipeline = [...pipeline, { $count: "total" }];
      const totalResult = await Order.aggregate(totalCountPipeline);
      const total = totalResult[0]?.total || 0;

      res.json({
        success: true,
        data: results,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Detailed revenue error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching detailed revenue',
        error: error.message
      });
    }
  }

  // Export Revenue Report
  async exportRevenueReport(req, res) {
    try {
      const { startDate, endDate, format = 'excel' } = req.query;
      
      // For now, return JSON data that frontend can convert to Excel
      // In production, you might want to use libraries like ExcelJS
      const revenueData = await this.getDetailedRevenueForExport(startDate, endDate);
      
      if (format === 'excel') {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=revenue-report-${startDate}-${endDate}.xlsx`);
      }
      
      res.json({
        success: true,
        data: revenueData,
        meta: {
          startDate,
          endDate,
          exportedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Export revenue error:', error);
      res.status(500).json({
        success: false,
        message: 'Error exporting revenue report',
        error: error.message
      });
    }
  }

  // Helper method for export
  async getDetailedRevenueForExport(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $ne: 'cancelled' }
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orderNumber: '$orderNumber',
          customer: '$customer',
          category: '$productInfo.category',
          product: '$productInfo.name',
          quantity: '$items.quantity',
          unitPrice: '$items.price',
          totalRevenue: { $multiply: ['$items.quantity', '$items.price'] },
          status: '$status'
        }
      },
      { $sort: { date: -1 } }
    ]);
  }
  // Recent Orders for Dashboard
  async getRecentOrders(req, res) {
    try {
      const { limit = 10 } = req.query;
      
      const orders = await Order.find()
        .populate('userId', 'username email firstname lastname')
        .populate('items.productId', 'name')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .lean();

      const formattedOrders = orders.map(order => ({
        id: order._id,
        orderNumber: order.orderCode || order.orderId,
        customerName: order.userId ? 
          `${order.userId.firstname || ''} ${order.userId.lastname || ''}`.trim() || 
          order.userId.username || 
          order.userId.email : 'Unknown',
        products: order.items.map(item => 
          item.productId?.name || item.name || 'Unknown'
        ).join(', '),
        total: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt
      }));

      res.json({
        success: true,
        orders: formattedOrders
      });
    } catch (error) {
      console.error('Recent orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching recent orders',
        error: error.message
      });
    }
  }

  // User Management Methods
  
  // Get all users with pagination and filters
  async getAllUsers(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        role = '', 
        status = '',
        sortBy = 'createdAt',
        sortOrder = 'desc' 
      } = req.query;

      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      const skip = (pageNumber - 1) * limitNumber;

      // Build filter query
      const filter = {};
      
      if (search) {
        filter.$or = [
          { email: { $regex: search, $options: 'i' } },
          { firstname: { $regex: search, $options: 'i' } },
          { lastname: { $regex: search, $options: 'i' } },
          { accountCode: { $regex: search, $options: 'i' } }
        ];
      }

      if (role) {
        filter.role = role;
      }

      if (status === 'active') {
        filter.isActive = true;
        filter.deleted = false;
      } else if (status === 'inactive') {
        filter.isActive = false;
      } else if (status === 'deleted') {
        filter.deleted = true;
      }

      // Build sort object
      const sortObject = {};
      sortObject[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Get users with pagination
      const [users, totalCount] = await Promise.all([
        Account.find(filter)
          .select('-salt -hash')
          .populate('addressId')
          .sort(sortObject)
          .skip(skip)
          .limit(limitNumber),
        Account.countDocuments(filter)
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limitNumber);
      const hasNextPage = pageNumber < totalPages;
      const hasPrevPage = pageNumber > 1;

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            currentPage: pageNumber,
            totalPages,
            totalCount,
            perPage: limitNumber,
            hasNextPage,
            hasPrevPage
          }
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching users',
        error: error.message      });
    }
  }

  // Create new user (admin only)
  async createUser(req, res) {
    try {
      const { 
        firstName, 
        lastName, 
        email, 
        phone, 
        password, 
        role = 'customer', 
        isActive = true,
        address = {}
      } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'First name, last name, email, and password are required'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }

      // Check if user already exists
      const existingUser = await Account.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Validate role
      const validRoles = ['customer', 'admin', 'moderator'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role specified'
        });
      }

      // Create address if provided
      let addressId = null;
      if (address.street || address.city || address.state || address.zipCode) {
        const Address = require('../models/Address');
        const newAddress = new Address({
          street: address.street || '',
          city: address.city || '',
          state: address.state || '',
          zipCode: address.zipCode || '',
          country: address.country || 'Vietnam'
        });
        const savedAddress = await newAddress.save();
        addressId = savedAddress._id;
      }

      // Generate account code (unique identifier)
      const accountCode = `ACC${Date.now()}${Math.floor(Math.random() * 1000)}`;

      // Create new user
      const newUser = new Account({
        firstname: firstName,
        lastname: lastName,
        email: email.toLowerCase(),
        phone: phone || '',
        accountCode,
        role,
        isActive,
        addressId,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Set password (this will be hashed by the model's pre-save hook)
      newUser.password = password;
      
      const savedUser = await newUser.save();

      // Remove sensitive data before sending response
      const userResponse = savedUser.toObject();
      delete userResponse.hash;
      delete userResponse.salt;
      delete userResponse.password;

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          user: userResponse
        }
      });

    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating user',
        error: error.message
      });
    }
  }

  // Get user by ID
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      
      const user = await Account.findById(id)
        .select('-salt -hash')
        .populate('addressId');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching user',
        error: error.message
      });
    }
  }

  // Update user status (activate/deactivate)
  async updateUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const user = await Account.findByIdAndUpdate(
        id,
        { isActive },
        { new: true }
      ).select('-salt -hash');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: user
      });
    } catch (error) {
      console.error('Update user status error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating user status',
        error: error.message
      });
    }
  }

  // Update user role
  async updateUserRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!['customer', 'admin'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Must be customer or admin'
        });
      }

      const user = await Account.findByIdAndUpdate(
        id,
        { role },
        { new: true }
      ).select('-salt -hash');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User role updated successfully',
        data: user
      });
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating user role',
        error: error.message
      });
    }
  }

  // Delete user (soft delete)
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Don't allow deletion of admin users by other admins
      const targetUser = await Account.findById(id);
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (targetUser.role === 'admin' && targetUser._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Cannot delete other admin users'
        });
      }

      const user = await Account.findByIdAndUpdate(
        id,
        { deleted: true, isActive: false },
        { new: true }
      ).select('-salt -hash');

      res.json({
        success: true,
        message: 'User deleted successfully',
        data: user
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting user',
        error: error.message
      });
    }
  }

  // Create new user (admin only)
  async createUser(req, res) {
    try {
      const { 
        firstName, 
        lastName, 
        email, 
        phone, 
        password, 
        role = 'customer', 
        isActive = true,
        address = {}
      } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'First name, last name, email, and password are required'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }

      // Check if user already exists
      const existingUser = await Account.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Validate role
      const validRoles = ['customer', 'admin', 'moderator'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role specified'
        });
      }

      // Create address if provided
      let addressId = null;
      if (address.street || address.city || address.state || address.zipCode) {
        const Address = require('../models/Address');
        const newAddress = new Address({
          street: address.street || '',
          city: address.city || '',
          state: address.state || '',
          zipCode: address.zipCode || '',
          country: address.country || 'Vietnam'
        });
        const savedAddress = await newAddress.save();
        addressId = savedAddress._id;
      }

      // Generate account code (unique identifier)
      const accountCode = `ACC${Date.now()}${Math.floor(Math.random() * 1000)}`;

      // Create new user
      const newUser = new Account({
        firstname: firstName,
        lastname: lastName,
        email: email.toLowerCase(),
        phone: phone || '',
        accountCode,
        role,
        isActive,
        addressId,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Set password (this will be hashed by the model's pre-save hook)
      newUser.password = password;
      
      const savedUser = await newUser.save();

      // Remove sensitive data before sending response
      const userResponse = savedUser.toObject();
      delete userResponse.hash;
      delete userResponse.salt;
      delete userResponse.password;

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          user: userResponse
        }
      });

    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating user',
        error: error.message
      });
    }
  }

  // Get user statistics
  async getUserStats(req, res) {
    try {
      const { timeRange = '30d' } = req.query;
      const days = parseInt(timeRange.replace('d', '')) || 30;
      const startDate = moment().subtract(days, 'days').toDate();

      // Basic user counts
      const [totalUsers, activeUsers, adminUsers, newUsers] = await Promise.all([
        Account.countDocuments({ role: 'customer' }),
        Account.countDocuments({ role: 'customer', isActive: true, deleted: false }),
        Account.countDocuments({ role: 'admin' }),
        Account.countDocuments({ 
          role: 'customer', 
          createdAt: { $gte: startDate } 
        })
      ]);

      // Users with orders in timeRange
      const usersWithOrders = await Order.distinct('customer', {
        createdAt: { $gte: startDate }
      });

      // Daily registration stats
      const dailyRegistrations = await Account.aggregate([
        {
          $match: {
            role: 'customer',
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      res.json({
        success: true,
        data: {
          totalUsers,
          activeUsers,
          adminUsers,
          newUsers,
          usersWithOrders: usersWithOrders.length,
          dailyRegistrations
        }
      });
    } catch (error) {
      console.error('User stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching user statistics',
        error: error.message
      });
    }
  }

  // Export users to Excel
  async exportUsers(req, res) {
    try {
      const { role = '', status = '' } = req.query;

      // Build filter
      const filter = {};
      if (role) filter.role = role;
      if (status === 'active') {
        filter.isActive = true;
        filter.deleted = false;
      } else if (status === 'inactive') {
        filter.isActive = false;
      }

      const users = await Account.find(filter)
        .select('-salt -hash')
        .populate('addressId')
        .sort({ createdAt: -1 });

      // Convert to CSV format
      const csvData = users.map(user => ({
        'Account Code': user.accountCode,
        'Email': user.email,
        'Full Name': `${user.firstname} ${user.lastname}`.trim(),
        'Phone': user.phone || '',
        'Role': user.role,
        'Status': user.deleted ? 'Deleted' : (user.isActive ? 'Active' : 'Inactive'),
        'Created Date': moment(user.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        'Last Login': user.lastLogin ? moment(user.lastLogin).format('YYYY-MM-DD HH:mm:ss') : ''
      }));

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=users_export_${moment().format('YYYY-MM-DD')}.json`);
      
      res.json({
        success: true,
        data: csvData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Export users error:', error);
      res.status(500).json({
        success: false,
        message: 'Error exporting users',
        error: error.message
      });
    }  }

  // Settings Management
  async getSettings(req, res) {
    try {
      // Mock settings data - in real app, this would come from a settings collection
      const settings = {
        general: {
          siteName: 'HanFoods Admin',
          siteUrl: 'https://hanfoods.com',
          adminEmail: 'admin@hanfoods.com',
          timezone: 'Asia/Ho_Chi_Minh',
          language: 'vi',
          dateFormat: 'DD/MM/YYYY',
          currency: 'VND'
        },
        email: {
          smtpHost: 'smtp.gmail.com',
          smtpPort: 587,
          smtpUser: 'noreply@hanfoods.com',
          smtpSecure: true,
          fromEmail: 'noreply@hanfoods.com',
          fromName: 'HanFoods'
        },
        payment: {
          enableCOD: true,
          enableBankTransfer: true,
          enableMomo: false,
          enableZaloPay: false,
          minOrderAmount: 50000,
          shippingFee: 25000,
          freeShippingThreshold: 200000
        },
        notification: {
          enableEmailNotifications: true,
          enableSMSNotifications: false,
          enablePushNotifications: true,
          notifyOnNewOrder: true,
          notifyOnLowStock: true,
          lowStockThreshold: 10
        },
        security: {
          enableTwoFactor: false,
          sessionTimeout: 24,
          maxLoginAttempts: 5,
          enableIPWhitelist: false,
          allowedIPs: []
        }
      };

      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Get settings error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching settings',
        error: error.message
      });
    }
  }

  async updateSettings(req, res) {
    try {
      const { settings } = req.body;

      // In real app, you would validate and save to database
      // For now, just return success
      
      res.json({
        success: true,
        message: 'Settings updated successfully',
        data: settings
      });
    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating settings',
        error: error.message
      });
    }
  }

}

module.exports = AdminController;
