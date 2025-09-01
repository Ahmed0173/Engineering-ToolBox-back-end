const mongoose = require('mongoose');
const { Schema } = mongoose;

const calculatorSchema = new mongoose.Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    kind: { type: String, enum: ["BASIC", "QUICK"], required: true },
    name: { type: String, default: "My Calculator" },
    settings: {
      angleMode: { type: String, enum: ["RAD", "DEG"], default: "DEG" },
      precision: { type: Number, default: 10, min: 1, max: 15 }
    },
    selectedFormulaId: { type: Schema.Types.ObjectId, ref: "Formula" },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const Calculator = mongoose.model('Calculator', calculatorSchema);
module.exports = Calculator;