const mongoose = require('mongoose');
const { Schema } = mongoose;

const calculationSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User" },
    calculator_id: { type: Schema.Types.ObjectId, ref: "Calculator", required: true },
    kind: { type: String, enum: ["BASIC", "QUICK"], required: true },

    // BASIC calculator fields
    expression: { type: String },
    angleMode: { type: String, enum: ["RAD", "DEG"], default: "DEG" },
    usedAns: { type: Boolean, default: false },
    previousAnswer: { type: Number },

    // QUICK calculator fields (formula-based)
    formulaId: { type: Schema.Types.ObjectId, ref: "Formula" },
    inputs: { type: Map, of: Schema.Types.Mixed, default: {} },
    outputKey: { type: String },

    // Common result fields
    result: { type: Number, required: true },
    unit: { type: String, default: "" },
    
    // Additional metadata
    isBookmarked: { type: Boolean, default: false },
    tags: [{ type: String }]
  },
  { timestamps: true }
);

// Index for better performance
calculationSchema.index({ user_id: 1, createdAt: -1 });
calculationSchema.index({ calculator_id: 1 });

const Calculation = mongoose.model('Calculation', calculationSchema);
module.exports = Calculation;