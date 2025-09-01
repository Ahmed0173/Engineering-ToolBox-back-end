const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verify-token');
const formulaController = require('../controllers/formula');

// Public routes (no authentication required)
router.get('/', formulaController.getFormulas);
router.get('/category/:category', formulaController.getFormulasByCategory);
router.get('/:id', formulaController.getFormulaById);
router.get('/:id/calculation-options', formulaController.getFormulaCalculationOptions);

// Protected routes (authentication required)
router.use(verifyToken);
router.post('/calculate', formulaController.performFormulaCalculation);

module.exports = router;
