const mongoose = require('mongoose');
const { Schema } = mongoose;

const calculationSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User" },
    calculator_id: { type: Schema.Types.ObjectId, ref: "Calculator", required: true },
    kind: { type: String, enum: ["BASIC", "QUICK"], required: true },

    // BASIC fields
    expression: { type: String },
    angleMode: { type: String, enum: ["RAD", "DEG"] },
    usedAns: { type: Boolean, default: false },

    // QUICK fields
    formulaId: { type: Schema.Types.ObjectId, ref: "Formula" },
    inputs: { type: Map, of: Number, default: {} },
    outputKey: { type: String },

    // Common result
    result: { type: Number, required: true },
    unit: { type: String, default: "" }
  },
  { timestamps: true }
);
module.exports = calculationSchema;