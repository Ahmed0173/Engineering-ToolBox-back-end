const Formula = require('../models/formula');

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
  },
  {
  name: "Kinetic Energy",
  description: "Energy of an object due to its motion",
  category: "PHYSICS",
  formula: "KE = 0.5 × m × v²",
  variables: [
    {
      key: "KE",
      name: "Kinetic Energy",
      unit: "J",
      description: "Energy of motion",
      isOutput: true,
      constraints: { mustBePositive: true }
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
      key: "v",
      name: "Velocity",
      unit: "m/s",
      description: "Object velocity",
      isOutput: true,
      constraints: { mustBePositive: false }
    }
  ],
  calculations: [
    { outputVariable: "KE", expression: "0.5 * m * (v ** 2)", requiredInputs: ["m", "v"] },
    { outputVariable: "m", expression: "(2 * KE) / (v ** 2)", requiredInputs: ["KE", "v"] },
    { outputVariable: "v", expression: "Math.sqrt((2 * KE) / m)", requiredInputs: ["KE", "m"] }
  ],
  difficulty: "INTERMEDIATE",
  tags: ["kinetic", "energy", "physics", "mass", "velocity"]
},

{
  name: "Potential Energy",
  description: "Stored energy due to position",
  category: "PHYSICS",
  formula: "PE = m × g × h",
  variables: [
    {
      key: "PE",
      name: "Potential Energy",
      unit: "J",
      description: "Stored energy",
      isOutput: true,
      constraints: { mustBePositive: true }
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
      key: "g",
      name: "Gravity",
      unit: "m/s²",
      description: "Acceleration due to gravity",
      isOutput: false
    },
    {
      key: "h",
      name: "Height",
      unit: "m",
      description: "Height above reference",
      isOutput: true,
      constraints: { mustBePositive: false }
    }
  ],
  calculations: [
    { outputVariable: "PE", expression: "m * g * h", requiredInputs: ["m", "g", "h"] },
    { outputVariable: "m", expression: "PE / (g * h)", requiredInputs: ["PE", "g", "h"] },
    { outputVariable: "h", expression: "PE / (m * g)", requiredInputs: ["PE", "m", "g"] }
  ],
  difficulty: "INTERMEDIATE",
  tags: ["potential", "energy", "physics", "mass", "gravity", "height"]
},

{
  name: "Work",
  description: "Work done when a force moves an object",
  category: "PHYSICS",
  formula: "W = F × d",
  variables: [
    {
      key: "W",
      name: "Work",
      unit: "J",
      description: "Work done",
      isOutput: true,
      constraints: { mustBePositive: false }
    },
    {
      key: "F",
      name: "Force",
      unit: "N",
      description: "Applied force",
      isOutput: true,
      constraints: { mustBePositive: false }
    },
    {
      key: "d",
      name: "Distance",
      unit: "m",
      description: "Displacement",
      isOutput: true,
      constraints: { mustBePositive: true }
    }
  ],
  calculations: [
    { outputVariable: "W", expression: "F * d", requiredInputs: ["F", "d"] },
    { outputVariable: "F", expression: "W / d", requiredInputs: ["W", "d"] },
    { outputVariable: "d", expression: "W / F", requiredInputs: ["W", "F"] }
  ],
  difficulty: "BEGINNER",
  tags: ["work", "physics", "force", "distance"]
},

{
  name: "Efficiency",
  description: "Ratio of useful output energy to input energy",
  category: "PHYSICS",
  formula: "η = (Output / Input) × 100%",
  variables: [
    {
      key: "η",
      name: "Efficiency",
      unit: "%",
      description: "Efficiency percentage",
      isOutput: true,
      constraints: { mustBePositive: true }
    },
    {
      key: "Output",
      name: "Useful Output Energy",
      unit: "J",
      description: "Energy obtained",
      isOutput: true,
      constraints: { mustBePositive: true }
    },
    {
      key: "Input",
      name: "Input Energy",
      unit: "J",
      description: "Energy supplied",
      isOutput: true,
      constraints: { mustBePositive: true }
    }
  ],
  calculations: [
    { outputVariable: "η", expression: "(Output / Input) * 100", requiredInputs: ["Output", "Input"] },
    { outputVariable: "Output", expression: "(η/100) * Input", requiredInputs: ["η", "Input"] },
    { outputVariable: "Input", expression: "Output / (η/100)", requiredInputs: ["Output", "η"] }
  ],
  difficulty: "BEGINNER",
  tags: ["efficiency", "energy", "ratio", "percentage"]
},

{
  name: "Series Resistance",
  description: "Total resistance in a series circuit",
  category: "ELECTRICAL",
  formula: "R_total = R1 + R2 + ... + Rn",
  variables: [
    {
      key: "R_total",
      name: "Total Resistance",
      unit: "Ω",
      description: "Sum of resistances",
      isOutput: true,
      constraints: { mustBePositive: true }
    },
    {
      key: "R1",
      name: "Resistance 1",
      unit: "Ω",
      description: "First resistor",
      isOutput: false,
      constraints: { mustBePositive: true }
    },
    {
      key: "R2",
      name: "Resistance 2",
      unit: "Ω",
      description: "Second resistor",
      isOutput: false,
      constraints: { mustBePositive: true }
    }
  ],
  calculations: [
    { outputVariable: "R_total", expression: "R1 + R2", requiredInputs: ["R1", "R2"] }
  ],
  difficulty: "BEGINNER",
  tags: ["resistance", "series", "electrical"]
},

{
  name: "Parallel Resistance",
  description: "Total resistance in a parallel circuit",
  category: "ELECTRICAL",
  formula: "1/R_total = 1/R1 + 1/R2 + ... + 1/Rn",
  variables: [
    {
      key: "R_total",
      name: "Total Resistance",
      unit: "Ω",
      description: "Equivalent resistance",
      isOutput: true,
      constraints: { mustBePositive: true }
    },
    {
      key: "R1",
      name: "Resistance 1",
      unit: "Ω",
      description: "First resistor",
      isOutput: false,
      constraints: { mustBePositive: true }
    },
    {
      key: "R2",
      name: "Resistance 2",
      unit: "Ω",
      description: "Second resistor",
      isOutput: false,
      constraints: { mustBePositive: true }
    }
  ],
  calculations: [
    { outputVariable: "R_total", expression: "1 / ((1/R1) + (1/R2))", requiredInputs: ["R1", "R2"] }
  ],
  difficulty: "INTERMEDIATE",
  tags: ["resistance", "parallel", "electrical"]
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
