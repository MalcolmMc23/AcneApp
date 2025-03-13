/**
 * Skin Conditions Reference Utility
 * 
 * This utility provides structured information about different acne and skin conditions
 * to support personalized analysis and recommendations.
 */

export interface SkinCondition {
  id: string;
  name: string;
  description: string;
  causes: string[];
  treatments: {
    topical: string[];
    lifestyle: string[];
    professional: string[];
  };
  severity: {
    mild: string;
    moderate: string;
    severe: string;
  };
}

/**
 * Comprehensive reference of skin conditions and acne types
 */
export const skinConditions: Record<string, SkinCondition> = {
  papules: {
    id: 'papules',
    name: 'Inflammatory Papules',
    description: 'Small, solid, raised bumps that are red and sometimes painful due to inflammation.',
    causes: [
      'Excess sebum production',
      'Bacterial infection (P. acnes)',
      'Hormonal fluctuations',
      'Pore blockage'
    ],
    treatments: {
      topical: [
        'Benzoyl peroxide (2.5-5%)',
        'Salicylic acid (1-2%)',
        'Niacinamide (5-10%)',
        'Retinoids (adapalene 0.1%)'
      ],
      lifestyle: [
        'Gentle cleansing twice daily',
        'Avoid over-washing',
        'Non-comedogenic moisturizers',
        'Stress reduction techniques'
      ],
      professional: [
        'Chemical peels',
        'Prescription antibiotics',
        'Stronger retinoids'
      ]
    },
    severity: {
      mild: 'Few scattered papules, minimal inflammation',
      moderate: 'Multiple papules, noticeable inflammation in specific areas',
      severe: 'Numerous papules, widespread inflammation, pain'
    }
  },
  pustules: {
    id: 'pustules',
    name: 'Pustules',
    description: 'Small, inflamed bumps containing pus that appear red at the base with a white or yellow head.',
    causes: [
      'Bacterial infection',
      'Inflammation',
      'Hormonal changes',
      'Excess oil production'
    ],
    treatments: {
      topical: [
        'Benzoyl peroxide (5-10%)',
        'Salicylic acid (2%)',
        'Sulfur treatments',
        'Azelaic acid (15-20%)'
      ],
      lifestyle: [
        'Avoid picking or squeezing',
        'Regular cleansing',
        'Oil-free skincare products',
        'Change pillowcases frequently'
      ],
      professional: [
        'Extraction by a dermatologist',
        'Oral antibiotics',
        'Steroid injections for large pustules'
      ]
    },
    severity: {
      mild: 'Few scattered pustules that heal quickly',
      moderate: 'Clusters of pustules that may leave temporary marks',
      severe: 'Numerous pustules with significant inflammation and potential scarring'
    }
  },
  comedones: {
    id: 'comedones',
    name: 'Comedones (Blackheads & Whiteheads)',
    description: 'Non-inflammatory acne lesions. Blackheads (open comedones) appear dark due to oxidation. Whiteheads (closed comedones) appear as small white or flesh-colored bumps.',
    causes: [
      'Excess sebum production',
      'Dead skin cell buildup',
      'Pore blockage',
      'Slow cell turnover'
    ],
    treatments: {
      topical: [
        'Salicylic acid (0.5-2%)',
        'Retinoids (differin, tretinoin)',
        'Glycolic acid (5-10%)',
        'Gentle chemical exfoliants'
      ],
      lifestyle: [
        'Regular exfoliation',
        'Oil-free products',
        'Avoid heavy makeup',
        'Cleanse after sweating'
      ],
      professional: [
        'Extraction',
        'Chemical peels',
        'Microdermabrasion'
      ]
    },
    severity: {
      mild: 'Few scattered comedones in limited areas',
      moderate: 'Multiple comedones across several facial zones',
      severe: 'Numerous comedones covering significant facial areas'
    }
  },
  nodular: {
    id: 'nodular',
    name: 'Nodular Acne',
    description: 'Large, inflamed, painful bumps deep within the skin that feel hard to the touch and may not come to a head.',
    causes: [
      'Severe inflammation',
      'Bacterial infection',
      'Hormonal disorders',
      'Genetic factors'
    ],
    treatments: {
      topical: [
        'Prescription-strength retinoids',
        'Benzoyl peroxide (higher strengths)',
        'Topical antibiotics with benzoyl peroxide',
        'Azelaic acid (prescription strength)'
      ],
      lifestyle: [
        'Gentle skincare routine',
        'Avoid irritating products',
        'Stress management',
        'Anti-inflammatory diet'
      ],
      professional: [
        'Oral antibiotics',
        'Isotretinoin (Accutane)',
        'Steroid injections',
        'Hormonal treatments'
      ]
    },
    severity: {
      mild: 'Occasional nodules that resolve without scarring',
      moderate: 'Multiple nodules with prolonged healing time',
      severe: 'Numerous painful nodules with high risk of scarring'
    }
  },
  cystic: {
    id: 'cystic',
    name: 'Cystic Acne',
    description: 'Most severe form of acne characterized by large, painful, pus-filled cysts deep within the skin that can lead to permanent scarring.',
    causes: [
      'Severe inflammation',
      'Hormonal imbalances',
      'Genetic predisposition',
      'Bacterial infection'
    ],
    treatments: {
      topical: [
        'Usually insufficient alone',
        'Prescription retinoids as adjunct therapy',
        'Benzoyl peroxide with antibiotics',
        'Anti-inflammatory agents'
      ],
      lifestyle: [
        'Very gentle skincare',
        'Medical-grade non-comedogenic products',
        'Avoid all potential irritants',
        'Strict low glycemic diet'
      ],
      professional: [
        'Isotretinoin (Accutane)',
        'Hormonal therapy',
        'Corticosteroid injections',
        'Drainage and surgical excision'
      ]
    },
    severity: {
      mild: 'Rare and isolated cysts',
      moderate: 'Recurring cysts in specific areas',
      severe: 'Multiple large, painful cysts with active inflammation'
    }
  },
  hormonal: {
    id: 'hormonal',
    name: 'Hormonal Acne',
    description: 'Acne tied to hormonal fluctuations, often appearing along the jawline, chin, and lower cheeks. May flare up during menstrual cycles, pregnancy, or with PCOS.',
    causes: [
      'Androgen fluctuations',
      'Menstrual cycle changes',
      'Polycystic ovary syndrome',
      'Stress hormones',
      'Hormonal medications'
    ],
    treatments: {
      topical: [
        'Retinoids',
        'Niacinamide (10%)',
        'Azelaic acid (20%)',
        'Benzoyl peroxide'
      ],
      lifestyle: [
        'Anti-inflammatory diet',
        'Regular sleep schedule',
        'Stress management',
        'Avoid dairy and high-glycemic foods'
      ],
      professional: [
        'Birth control pills',
        'Spironolactone',
        'Anti-androgen medications',
        'DIM supplements'
      ]
    },
    severity: {
      mild: 'Predictable flares around menstrual cycle with few lesions',
      moderate: 'Regular breakouts with 5-20 inflammatory lesions',
      severe: 'Persistent, painful, deep acne with scarring potential'
    }
  },
  rosacea: {
    id: 'rosacea',
    name: 'Rosacea',
    description: 'Chronic inflammatory skin condition causing redness, visible blood vessels, and sometimes small red bumps. Often mistaken for acne.',
    causes: [
      'Genetic factors',
      'Blood vessel abnormalities',
      'Demodex mites',
      'Environmental triggers',
      'Immune system factors'
    ],
    treatments: {
      topical: [
        'Metronidazole',
        'Azelaic acid',
        'Ivermectin',
        'Gentle anti-inflammatory products'
      ],
      lifestyle: [
        'Identify and avoid triggers',
        'Sun protection (SPF 30+)',
        'Gentle skincare routine',
        'Cool compresses for flares'
      ],
      professional: [
        'Laser therapy',
        'Oral antibiotics (low-dose)',
        'Prescription anti-inflammatory treatments',
        'Vascular laser treatments'
      ]
    },
    severity: {
      mild: 'Occasional flushing and mild redness',
      moderate: 'Persistent redness with papules and pustules',
      severe: 'Intense redness, many bumps, thickening skin, eye involvement'
    }
  }
};

/**
 * Maps acne symptoms to potential conditions for better identification
 */
export const symptomToConditionMap = {
  "red bumps without pus": ["papules", "rosacea"],
  "white or yellow heads": ["pustules"],
  "black dots": ["comedones"],
  "deep painful bumps": ["nodular", "cystic"],
  "jawline breakouts": ["hormonal"],
  "forehead small bumps": ["comedones", "fungal"],
  "facial redness": ["rosacea", "sensitive"],
  "painful cysts": ["cystic", "nodular"]
};

/**
 * Provides routine recommendations based on identified skin types and conditions
 */
export function getRecommendedRoutine(conditions: string[]): {
  morning: string[];
  evening: string[];
  weekly: string[];
} {
  // Base routine that works for most skin
  const routine = {
    morning: [
      "Gentle cleanser",
      "Alcohol-free toner (optional)",
      "Lightweight moisturizer",
      "SPF 30+ sunscreen (crucial)"
    ],
    evening: [
      "Oil-based or micellar cleanser to remove makeup/sunscreen",
      "Gentle water-based cleanser",
      "Treatment product",
      "Moisturizer"
    ],
    weekly: [
      "Gentle exfoliation 1-2 times per week",
      "Hydrating mask once weekly"
    ]
  };

  // Customize based on conditions
  conditions.forEach(condition => {
    switch(condition) {
      case "papules":
      case "pustules":
        routine.morning.splice(2, 0, "Benzoyl peroxide spot treatment (2.5-5%)");
        routine.evening.splice(2, 0, "Adapalene gel or retinol");
        break;
      case "comedones":
        routine.morning.splice(2, 0, "Salicylic acid serum (1-2%)");
        routine.evening.splice(2, 0, "Retinol or adapalene");
        routine.weekly.push("Salicylic acid mask once weekly");
        break;
      case "nodular":
      case "cystic":
        routine.morning.splice(2, 0, "Azelaic acid (15-20%)");
        routine.evening.splice(2, 0, "Prescription retinoid (if available)");
        routine.weekly.push("Consult dermatologist for cortisone injections");
        break;
      case "hormonal":
        routine.morning.splice(2, 0, "Niacinamide serum (10%)");
        routine.evening.splice(2, 0, "Azelaic acid or retinoid");
        routine.weekly.push("Consider spearmint tea daily (may help with androgen levels)");
        break;
      case "rosacea":
        // Remove potentially irritating products
        routine.morning = [
          "Lukewarm water rinse or extremely gentle cleanser",
          "Centella or green tea serum",
          "Barrier-strengthening moisturizer",
          "Mineral sunscreen SPF 30+"
        ];
        routine.evening = [
          "Gentle micellar water or oil cleanser",
          "Lukewarm water rinse",
          "Centella, licorice, or azelaic acid product",
          "Rich barrier repair moisturizer"
        ];
        routine.weekly = [
          "Gentle oat or centella mask",
          "No physical exfoliation"
        ];
        break;
    }
  });

  return routine;
}

export default {
  skinConditions,
  symptomToConditionMap,
  getRecommendedRoutine
}; 