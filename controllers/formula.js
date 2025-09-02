const Formula = require('../models/formula');
const Calculator = require('../models/calculator');
const Calculation = require('../models/calculations');

// Get all formulas with filtering
const getFormulas = async (req, res) => {
  try {
    const { 
      category, 
      difficulty, 
      search, 
      page = 1, 
      limit = 20 
    } = req.query;

    let query = { isActive: true };

    // Apply filters
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$text = { $search: search };
    }

    const formulas = await Formula.find(query)
      .sort(search ? { score: { $meta: 'textScore' } } : { usageCount: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Formula.countDocuments(query);

    res.json({
      success: true,
      formulas,
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

// Get formula by ID
const getFormulaById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const formula = await Formula.findById(id);
    if (!formula || !formula.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Formula not found'
      });
    }

    res.json({
      success: true,
      formula
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get formulas by category
const getFormulasByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const formulas = await Formula.find({ 
      category: category.toUpperCase(), 
      isActive: true 
    }).sort({ usageCount: -1 });

    res.json({
      success: true,
      formulas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Perform formula calculation
const performFormulaCalculation = async (req, res) => {
  try {
    const { 
      calculator_id, 
      formulaId, 
      inputs, 
      outputKey,
      outputVariable 
    } = req.body;
    
    // Support both outputKey and outputVariable for compatibility
    const outputParam = outputVariable || outputKey;
    const user_id = req.user?.id; // Optional user_id for anonymous calculations

    // Skip calculator validation if calculator_id is not provided (for direct formula calculations)
    if (calculator_id) {
      // Verify calculator belongs to user and is QUICK type
      const calculator = await Calculator.findOne({
        _id: calculator_id,
        user_id,
        kind: 'QUICK'
      });

      if (!calculator) {
        return res.status(404).json({
          success: false,
          message: 'Quick calculator not found'
        });
      }
    }

    // Get the formula
    const formula = await Formula.findById(formulaId);
    if (!formula || !formula.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Formula not found'
      });
    }

    // Find the calculation method for the desired output
    const calculation = formula.calculations.find(
      calc => calc.outputVariable === outputParam
    );

    if (!calculation) {
      return res.status(400).json({
        success: false,
        message: `Cannot calculate ${outputParam} with this formula`
      });
    }

    // Validate required inputs
    const missingInputs = calculation.requiredInputs.filter(
      input => !inputs.hasOwnProperty(input)
    );

    if (missingInputs.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required inputs: ${missingInputs.join(', ')}`
      });
    }

    // Validate input constraints
    for (const [key, value] of Object.entries(inputs)) {
      const variable = formula.variables.find(v => v.key === key);
      if (variable && variable.constraints) {
        if (variable.constraints.mustBePositive && value <= 0) {
          return res.status(400).json({
            success: false,
            message: `${variable.name} must be positive`
          });
        }
        if (variable.constraints.min && value < variable.constraints.min) {
          return res.status(400).json({
            success: false,
            message: `${variable.name} must be at least ${variable.constraints.min}`
          });
        }
        if (variable.constraints.max && value > variable.constraints.max) {
          return res.status(400).json({
            success: false,
            message: `${variable.name} must not exceed ${variable.constraints.max}`
          });
        }
      }
    }

    // Perform calculation
    let result;
    try {
      // Create a safe evaluation context
      const evalContext = { ...inputs };
      
      // Replace variables in expression with their values
      let expression = calculation.expression;
      for (const [key, value] of Object.entries(inputs)) {
        expression = expression.replace(new RegExp(key, 'g'), value);
      }
      
      // Evaluate the expression (in production, use a safer math parser)
      result = eval(expression);
    } catch (evalError) {
      return res.status(400).json({
        success: false,
        message: 'Calculation error: Invalid expression or inputs'
      });
    }

    // Get unit for the result
    const outputVariableInfo = formula.variables.find(v => v.key === outputParam);
    const unit = outputVariableInfo ? outputVariableInfo.unit : '';

    // Save calculation (only if calculator_id and user_id are provided)
    let savedCalculation = null;
    if (calculator_id && user_id) {
      const calculationRecord = new Calculation({
        user_id,
        calculator_id,
        kind: 'QUICK',
        formulaId,
        inputs: new Map(Object.entries(inputs)),
        outputKey: outputParam,
        result,
        unit
      });

      savedCalculation = await calculationRecord.save();

      // Update formula usage count
      await Formula.findByIdAndUpdate(formulaId, {
        $inc: { usageCount: 1 }
      });
    }

    res.json({
      success: true,
      calculation: savedCalculation,
      result,
      unit,
      formula: {
        name: formula.name,
        formula: formula.formula
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get available calculation options for a formula
const getFormulaCalculationOptions = async (req, res) => {
  try {
    const { id } = req.params;
    
    const formula = await Formula.findById(id);
    if (!formula || !formula.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Formula not found'
      });
    }

    const options = formula.calculations.map(calc => ({
      outputVariable: calc.outputVariable,
      outputName: formula.variables.find(v => v.key === calc.outputVariable)?.name,
      outputUnit: formula.variables.find(v => v.key === calc.outputVariable)?.unit,
      requiredInputs: calc.requiredInputs.map(inputKey => {
        const variable = formula.variables.find(v => v.key === inputKey);
        return {
          key: inputKey,
          name: variable?.name,
          unit: variable?.unit,
          constraints: variable?.constraints
        };
      })
    }));

    res.json({
      success: true,
      formula: {
        id: formula._id,
        name: formula.name,
        description: formula.description,
        formula: formula.formula,
        category: formula.category
      },
      calculationOptions: options
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getFormulas,
  getFormulaById,
  getFormulasByCategory,
  performFormulaCalculation,
  getFormulaCalculationOptions
};
