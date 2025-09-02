const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verify-token');
const formulaController = require('../controllers/formula');

// Public routes (no authentication required)
router.get('/', formulaController.getFormulas);
router.get('/category/:category', formulaController.getFormulasByCategory);
router.get('/:id', formulaController.getFormulaById);
router.get('/:id/calculation-options', formulaController.getFormulaCalculationOptions);
router.post('/calculate', formulaController.performFormulaCalculation);

// Protected routes (authentication required) - for future calculator-specific features
router.use(verifyToken);
// Add any calculator-specific formula operations here in the future

module.exports = router;
