const SubscriptionPlan = require("../../models/SubscriptionPlan");

// CREATE PLAN
exports.createPlan = async (req, res) => {
  try {
  const plan = await SubscriptionPlan.create(req.body);
  res.status(201).json({ success: true, plan, message: "Plan created successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: "something went wrong", error: error.message });
  }
};

// LIST PLANS (frontend filtered by context)
exports.getPlans = async (req, res) => {
  const { context } = req.query;

  try {
  const plans = await SubscriptionPlan.find()
    .sort({ displayOrder: 1 });

  res.json({ success: true, plans, message: "Plans retrieved successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: "something went wrong", error: error.message });
  }
};

// get getPlansByShowOnContext (user)
exports.getPlansByShowOnContext = async (req, res) => {
  const { context } = req.query;
  const filter = {
    isActive: true,
    isArchived: false
  };
  if (context) {
    filter.$or = [
      { showOnContext: "all" },
      { showOnContext: context }
    ];
  }

  try {
    const plans = await SubscriptionPlan.find(filter)
      .sort({ displayOrder: 1 });

    res.json({ success: true, plans, message: "Plans retrieved successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: "something went wrong", error: error.message });
  }
};

// UPDATE PLAN
exports.updatePlan = async (req, res) => {
  try {
    const existingPlan = await SubscriptionPlan.findById(req.params.id);
    if(!existingPlan){
      return  res.status(404).json({ success: false, message: "Plan Not Found" });
    }
    const plan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
  );

  res.json({ success: true, plan, message: "Plan updated successfully", Plan: SubscriptionPlan });
  } catch (error) {
    return res.status(400).json({ success: false, message: "something went wrong", error: error.message });
  }
};

// ARCHIVE PLAN
exports.archivePlan = async (req, res) => {
  try{
    const plan = await SubscriptionPlan.findById(req.params.id);  
    if(!plan){
      return  res.status(404).json({ success: false, message: "Plan Not Found" });
    }
  const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(req.params.id, {
    isArchived: true,
    isActive: false
  });
  res.json({ success: true, message: "Plan archived successfully", name: updatedPlan.name });
  } catch (error) {
    return res.status(400).json({ success: false, message: "something went wrong", error: error.message });
  }
};

// UNARCHIVE PLAN
exports.unarchivePlan = async (req, res) => {
  try{
    const plan = await SubscriptionPlan.findById(req.params.id);
    if(!plan){
      return  res.status(404).json({ success: false, message: "Plan Not Found" });
    }

    const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(req.params.id, {
      isArchived: false,
      isActive: true
    });
    res.json({ success: true, message: "Plan unarchived successfully", name: updatedPlan.name });
  } catch (error) {
    return res.status(400).json({ success: false, message: "something went wrong", error: error.message });
  }
};

// Delete PLAN permanently
exports.deletePlan = async (req, res) => {
  try{
    const plan = await SubscriptionPlan.findById(req.params.id);
    if(!plan){
      return  res.status(404).json({ success: false, message: "Plan Already Deleted" });
    }

    const deletedPlan = await SubscriptionPlan.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Plan deleted permanently", name: deletedPlan.name });
  } catch (error) {
    return res.status(400).json({ success: false, message: "something went wrong", error: error.message });
  }
};