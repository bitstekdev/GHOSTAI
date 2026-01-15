// const Address = require('../models/Adress');

// // @desc    Create a new address
// // @route   POST /api/address
// // @access  Private
// exports.createAddress = async (req, res, next) => {
//   try {
//     const { recipientName, phone, address } = req.body;

//     // Validate required fields
//     if (!recipientName || !phone || !address) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide all required fields: recipientName, phone, address'
//       });
//     }

//     const newAddress = await Address.create({
//       user: req.user.id,
//       recipientName,
//       phone,
//       address
//     });

//     res.status(201).json({
//       success: true,
//       data: newAddress
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // @desc    Get all user addresses
// // @route   GET /api/address
// // @access  Private
// exports.getMyAddresses = async (req, res, next) => {
//   try {
//     const addresses = await Address.find({ user: req.user.id }).sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       data: addresses
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // @desc    Get single address by ID
// // @route   GET /api/address/:id
// // @access  Private
// exports.getAddress = async (req, res, next) => {
//   try {
//     const address = await Address.findOne({
//       _id: req.params.id,
//       user: req.user.id
//     });

//     if (!address) {
//       return res.status(404).json({
//         success: false,
//         message: 'Address not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: address
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // @desc    Update address
// // @route   PUT /api/address/:id
// // @access  Private
// exports.updateAddress = async (req, res, next) => {
//   try {
//     const { recipientName, phone, address } = req.body;

//     let addressDoc = await Address.findOne({
//       _id: req.params.id,
//       user: req.user.id
//     });

//     if (!addressDoc) {
//       return res.status(404).json({
//         success: false,
//         message: 'Address not found'
//       });
//     }

//     // Update fields if provided
//     if (recipientName) addressDoc.recipientName = recipientName;
//     if (phone) addressDoc.phone = phone;
//     if (address) addressDoc.address = address;

//     await addressDoc.save();

//     res.status(200).json({
//       success: true,
//       data: addressDoc
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // @desc    Delete address
// // @route   DELETE /api/address/:id
// // @access  Private
// exports.deleteAddress = async (req, res, next) => {
//   try {
//     const address = await Address.findOneAndDelete({
//       _id: req.params.id,
//       user: req.user.id
//     });

//     if (!address) {
//       return res.status(404).json({
//         success: false,
//         message: 'Address not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Address deleted successfully'
//     });
//   } catch (error) {
//     next(error);
//   }
// };



const User = require('../models/User');

// @desc    Create a new address
// @route   POST /api/address
// @access  Private
exports.createAddress = async (req, res, next) => {
  try {
    const { recipientName, phone, address } = req.body;

    // Validate required fields
    if (!recipientName || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: recipientName, phone, address'
      });
    }

    const newAddress = await User.updateOne(
      { _id: req.user.id },
      { $push: { address: { name: recipientName, phone, address } } }
    );

    res.status(201).json({
      success: true,
      data: newAddress
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all user addresses
// @route   GET /api/address
// @access  Private
exports.getMyAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('address');

    res.status(200).json({
      success: true,
      data: user.address
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single address by ID
// @route   POST /api/address/:id
// @access  Private
exports.getAddress = async (req, res, next) => {
  const {addressId} = req.body;
  try {
    const address = await User.findOne({
      _id: addressId,
      user: req.user.id
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.status(200).json({
      success: true,
      data: address
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update address
// @route   PUT /api/address/:id
// @access  Private
exports.updateAddress = async (req, res, next) => {
  try {
    const { recipientName, phone, address } = req.body;
    console.log("Updating address with data:", req.body);
    console.log("Address ID:", req.params.id);

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          'address.$[elem].name': recipientName,
          'address.$[elem].phone': phone,
          'address.$[elem].address': address
        }
      },
      {
        arrayFilters: [{ 'elem._id': req.params.id }],
        new: true
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedUser.address
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete address
// @route   DELETE /api/address/:id
// @access  Private
exports.deleteAddress = async (req, res, next) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { address: { _id: req.params.id } } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
