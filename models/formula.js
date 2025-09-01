const mongoose = require('mongoose');
const { Schema } = mongoose;

const formulaSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { 
      type: String, 
      required: true,
      enum: [
        "ELECTRICAL", 
        "MECHANICAL", 
        "CIVIL", 
        "CHEMICAL", 
        "PHYSICS", 
        "MATHEMATICS",
        "THERMODYNAMICS",
        "FLUID_MECHANICS",
        "MATERIAL_SCIENCE"
      ]
    },
    
    // Formula structure
    formula: { type: String, required: true }, // e.g., "V = I * R"
    variables: [{
      key: { type: String, required: true }, // e.g., "V", "I", "R"
      name: { type: String, required: true }, // e.g., "Voltage", "Current", "Resistance"
      unit: { type: String, required: true }, // e.g., "V", "A", "Ω"
      description: { type: String },
      isOutput: { type: Boolean, default: false }, // Can this variable be calculated?
      constraints: {
        min: { type: Number },
        max: { type: Number },
        mustBePositive: { type: Boolean, default: false }
      }
    }],
    
    // Calculation logic
    calculations: [{
      outputVariable: { type: String, required: true }, // Which variable to solve for
      expression: { type: String, required: true }, // JavaScript expression to calculate
      requiredInputs: [{ type: String }] // Which variables are needed as input
    }],
    
    // Metadata
    difficulty: { type: String, enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"], default: "BEGINNER" },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
    usageCount: { type: Number, default: 0 },
    
    // Example usage
    examples: [{
      description: { type: String },
      inputs: { type: Map, of: Number },
      expectedOutput: { type: Number },
      outputVariable: { type: String }
    }]
  },
  { timestamps: true }
);

// Indexes for better performance
formulaSchema.index({ category: 1, isActive: 1 });
formulaSchema.index({ tags: 1 });
formulaSchema.index({ name: "text", description: "text" });

const Formula = mongoose.model('Formula', formulaSchema);
module.exports = Formula;
