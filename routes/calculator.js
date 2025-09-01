const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verify-token');
const calculatorController = require('../controllers/calculator');

// All routes require authentication
router.use(verifyToken);

// Calculator routes
router.post('/', calculatorController.createCalculator);
router.get('/', calculatorController.getUserCalculators);
router.put('/:id', calculatorController.updateCalculator);
router.delete('/:id', calculatorController.deleteCalculator);

// Calculation routes
router.post('/calculate/basic', calculatorController.performBasicCalculation);
router.get('/:calculator_id/history', calculatorController.getCalculationHistory);

module.exports = router;
