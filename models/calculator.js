const mongoose = require('mongoose');
const { Schema } = mongoose;

const calculatorSchema = new mongoose.Schema(
    {
 user_id: { type: Schema.Types.ObjectId, ref: "User" },
    kind: { type: String, enum: ["BASIC", "QUICK"], required: true },
    name: { type: String, default: "" },
    settings: {
      angleMode: { type: String, enum: ["RAD", "DEG"], default: "DEG" }
    },
    selectedFormulaId: { type: Schema.Types.ObjectId, ref: "Formula" }
  },
  { timestamps: true }
    
);
module.exports = calculator;