const Calculator = require('../models/calculator');
const Calculation = require('../models/calculations');
const Formula = require('../models/formula');

// Create a new calculator
const createCalculator = async (req, res) => {
  try {
    const { kind, name, settings } = req.body;
    const user_id = req.user.id;

    const calculator = new Calculator({
      user_id,
      kind,
      name: name || (kind === 'BASIC' ? 'Basic Calculator' : 'Formula Calculator'),
      settings: settings || {}
    });

    const savedCalculator = await calculator.save();
    res.status(201).json({
      success: true,
      calculator: savedCalculator
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get user's calculators
const getUserCalculators = async (req, res) => {
  try {
    const user_id = req.user.id;
    const calculators = await Calculator.find({ 
      user_id, 
      isActive: true 
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      calculators
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update calculator settings
const updateCalculator = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, settings, selectedFormulaId } = req.body;
    const user_id = req.user.id;

    const calculator = await Calculator.findOneAndUpdate(
      { _id: id, user_id },
      { 
        ...(name && { name }),
        ...(settings && { settings }),
        ...(selectedFormulaId && { selectedFormulaId })
      },
      { new: true }
    );

    if (!calculator) {
      return res.status(404).json({
        success: false,
        message: 'Calculator not found'
      });
    }

    res.json({
      success: true,
      calculator
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete calculator
const deleteCalculator = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const calculator = await Calculator.findOneAndUpdate(
      { _id: id, user_id },
      { isActive: false },
      { new: true }
    );

    if (!calculator) {
      return res.status(404).json({
        success: false,
        message: 'Calculator not found'
      });
    }

    res.json({
      success: true,
      message: 'Calculator deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Perform basic calculation
const performBasicCalculation = async (req, res) => {
  try {
    const { calculator_id, expression, angleMode, usedAns, previousAnswer } = req.body;
    const user_id = req.user.id;

    // Verify calculator belongs to user
    const calculator = await Calculator.findOne({ 
      _id: calculator_id, 
      user_id,
      kind: 'BASIC'
    });

    if (!calculator) {
      return res.status(404).json({
        success: false,
        message: 'Basic calculator not found'
      });
    }

    // Here you would implement the actual calculation logic
    // For now, using eval (in production, use a proper math parser)
    let result;
    try {
      // Basic calculation logic would go here
      // This is a simplified version - in production use a proper math parser
      result = eval(expression.replace(/\^/g, '**')); // Replace ^ with ** for exponentiation
    } catch (evalError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid expression'
      });
    }

    const calculation = new Calculation({
      user_id,
      calculator_id,
      kind: 'BASIC',
      expression,
      angleMode: angleMode || calculator.settings.angleMode,
      usedAns,
      previousAnswer,
      result
    });

    const savedCalculation = await calculation.save();

    res.json({
      success: true,
      calculation: savedCalculation,
      result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get calculation history
const getCalculationHistory = async (req, res) => {
  try {
    const { calculator_id } = req.params;
    const user_id = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const calculations = await Calculation.find({
      calculator_id,
      user_id
    })
    .populate('formulaId', 'name formula')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Calculation.countDocuments({
      calculator_id,
      user_id
    });

    res.json({
      success: true,
      calculations,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createCalculator,
  getUserCalculators,
  updateCalculator,
  deleteCalculator,
  performBasicCalculation,
  getCalculationHistory
};
