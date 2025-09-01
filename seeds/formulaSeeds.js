const Formula = require('./models/formula');

const seedFormulas = [
  {
    name: "Ohm's Law",
    description: "Relationship between voltage, current, and resistance in electrical circuits",
    category: "ELECTRICAL",
    formula: "V = I × R",
    variables: [
      {
        key: "V",
        name: "Voltage",
        unit: "V",
        description: "Electrical potential difference",
        isOutput: true,
        constraints: { mustBePositive: false }
      },
      {
        key: "I", 
        name: "Current",
        unit: "A",
        description: "Electric current",
        isOutput: true,
        constraints: { mustBePositive: true }
      },
      {
        key: "R",
        name: "Resistance", 
        unit: "Ω",
        description: "Electrical resistance",
        isOutput: true,
        constraints: { mustBePositive: true, min: 0.001 }
      }
    ],
    calculations: [
      {
        outputVariable: "V",
        expression: "I * R",
        requiredInputs: ["I", "R"]
      },
      {
        outputVariable: "I", 
        expression: "V / R",
        requiredInputs: ["V", "R"]
      },
      {
        outputVariable: "R",
        expression: "V / I", 
        requiredInputs: ["V", "I"]
      }
    ],
    difficulty: "BEGINNER",
    tags: ["ohm", "electrical", "voltage", "current", "resistance"],
    examples: [
      {
        description: "Calculate voltage with 2A current through 10Ω resistor",
        inputs: new Map([["I", 2], ["R", 10]]),
        expectedOutput: 20,
        outputVariable: "V"
      }
    ]
  },
  
  {
    name: "Power Formula",
    description: "Electrical power calculations",
    category: "ELECTRICAL", 
    formula: "P = V × I",
    variables: [
      {
        key: "P",
        name: "Power",
        unit: "W", 
        description: "Electrical power",
        isOutput: true,
        constraints: { mustBePositive: true }
      },
      {
        key: "V",
        name: "Voltage",
        unit: "V",
        description: "Electrical potential difference", 
        isOutput: true,
        constraints: { mustBePositive: false }
      },
      {
        key: "I",
        name: "Current", 
        unit: "A",
        description: "Electric current",
        isOutput: true,
        constraints: { mustBePositive: true }
      }
    ],
    calculations: [
      {
        outputVariable: "P",
        expression: "V * I",
        requiredInputs: ["V", "I"]
      },
      {
        outputVariable: "V",
        expression: "P / I", 
        requiredInputs: ["P", "I"]
      },
      {
        outputVariable: "I",
        expression: "P / V",
        requiredInputs: ["P", "V"]
      }
    ],
    difficulty: "BEGINNER",
    tags: ["power", "electrical", "voltage", "current"]
  },

  {
    name: "Force Calculation",
    description: "Newton's second law of motion",
    category: "PHYSICS",
    formula: "F = m × a", 
    variables: [
      {
        key: "F",
        name: "Force",
        unit: "N",
        description: "Applied force",
        isOutput: true,
        constraints: { mustBePositive: false }
      },
      {
        key: "m", 
        name: "Mass",
        unit: "kg",
        description: "Object mass",
        isOutput: true,
        constraints: { mustBePositive: true, min: 0.001 }
      },
      {
        key: "a",
        name: "Acceleration",
        unit: "m/s²", 
        description: "Object acceleration",
        isOutput: true,
        constraints: { mustBePositive: false }
      }
    ],
    calculations: [
      {
        outputVariable: "F",
        expression: "m * a",
        requiredInputs: ["m", "a"]
      },
      {
        outputVariable: "m",
        expression: "F / a",
        requiredInputs: ["F", "a"] 
      },
      {
        outputVariable: "a", 
        expression: "F / m",
        requiredInputs: ["F", "m"]
      }
    ],
    difficulty: "BEGINNER",
    tags: ["force", "physics", "newton", "mass", "acceleration"]
  },

  {
    name: "Pressure Formula",
    description: "Pressure calculation for fluids",
    category: "FLUID_MECHANICS",
    formula: "P = F / A",
    variables: [
      {
        key: "P",
        name: "Pressure", 
        unit: "Pa",
        description: "Fluid pressure",
        isOutput: true,
        constraints: { mustBePositive: true }
      },
      {
        key: "F",
        name: "Force",
        unit: "N",
        description: "Applied force",
        isOutput: true, 
        constraints: { mustBePositive: true }
      },
      {
        key: "A",
        name: "Area",
        unit: "m²",
        description: "Contact area",
        isOutput: true,
        constraints: { mustBePositive: true, min: 0.001 }
      }
    ],
    calculations: [
      {
        outputVariable: "P", 
        expression: "F / A",
        requiredInputs: ["F", "A"]
      },
      {
        outputVariable: "F",
        expression: "P * A",
        requiredInputs: ["P", "A"]
      },
      {
        outputVariable: "A",
        expression: "F / P", 
        requiredInputs: ["F", "P"]
      }
    ],
    difficulty: "INTERMEDIATE",
    tags: ["pressure", "fluid", "force", "area"]
  }
];

async function seedFormulasDB() {
  try {
    // Clear existing formulas
    await Formula.deleteMany({});
    
    // Insert seed formulas
    const insertedFormulas = await Formula.insertMany(seedFormulas);
    console.log(`Successfully seeded ${insertedFormulas.length} formulas`);
    return insertedFormulas;
  } catch (error) {
    console.error('Error seeding formulas:', error);
    throw error;
  }
}

module.exports = { seedFormulas, seedFormulasDB };
