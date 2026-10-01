import { DailyMeal, NutritionPlan, RiskPrediction, VitalsRecord } from '../types';

/**
 * Personalized Nutrition Recommendation Engine for Maternal Health.
 * Tailors calorie targets, macro ratios, and 7-day meal plans based on GDM risk,
 * anemia levels, gestational age, and dietary preferences.
 */

export function generatePersonalizedNutritionPlan(
  vitals: VitalsRecord,
  gdmRisk: RiskPrediction,
  cervicalRisk: RiskPrediction,
  preference: 'vegetarian' | 'non-vegetarian' | 'eggetarian' | 'vegan' = 'vegetarian',
  allergies: string[] = []
): NutritionPlan {
  // 1. Calculate Basal Metabolic Rate (Harris-Benedict for Females)
  // BMR = 447.593 + (9.247 * weight in kg) + (3.098 * height in cm) - (4.330 * age in years)
  const bmr = 447.593 + 9.247 * vitals.weightKg + 3.098 * vitals.heightCm - 4.330 * vitals.age;
  
  // Moderate gestational activity factor ~ 1.3
  let calories = Math.round(bmr * 1.3);

  // Trimester addition (approx +300 kcal for 2nd/3rd trimester)
  const weeks = vitals.gestationalAgeWeeks || 20;
  if (weeks > 13) calories += 300;

  // Adjust for BMI status
  if (vitals.bmi >= 30) {
    calories = Math.max(1700, calories - 250); // Mild controlled caloric restriction for obesity
  } else if (vitals.bmi < 18.5) {
    calories += 250; // Caloric increase for underweight
  }

  // 2. Determine Macro Distribution
  let carbsPct = 45;
  let proteinPct = 25;
  let fatPct = 30;

  if (gdmRisk.category === 'High') {
    carbsPct = 40; // Controlled low-GI complex carbs
    proteinPct = 30;
    fatPct = 30;
  } else if (gdmRisk.category === 'Medium') {
    carbsPct = 45;
    proteinPct = 25;
    fatPct = 30;
  }

  // 3. Special Guidelines
  const specialGuidelines: string[] = [];

  if (gdmRisk.category === 'High' || gdmRisk.category === 'Medium') {
    specialGuidelines.push('GDM Protocol: Consume complex, high-fiber, low-glycemic index carbohydrates (oats, brown rice, millets).');
    specialGuidelines.push('Meal Timing: Eat 3 main meals and 3 small snacks every 2.5 to 3 hours to stabilize postprandial glucose.');
    specialGuidelines.push('Avoid sugar-sweetened beverages, commercial fruit juices, refined white flour, and sweets.');
  }

  if (vitals.hemoglobinGDl < 11.0) {
    specialGuidelines.push('Anemia Alert (Hb < 11 g/dL): Include iron-rich foods (spinach, lentils, pomegranates, or lean meats/eggs).');
    specialGuidelines.push('Bioavailability Pairing: Pair iron sources with Vitamin C (lemon water, citrus, tomatoes) and avoid tea/coffee within 1 hour of meals.');
  }

  if (cervicalRisk.category === 'High' || cervicalRisk.category === 'Medium') {
    specialGuidelines.push('Immune Boosting: Increase dietary antioxidants (flavonoids, carotenoids, berries, green tea/herbal infusions, dark leafy greens).');
  }

  specialGuidelines.push('Essential Prenatal Micronutrients: Ensure daily intake of 400mcg Folate, 1000mg Calcium, and 3 Liters of hydrated fluid.');

  // 4. Generate 7-Day Meal Plan according to dietary preferences
  const sample7DayPlan = create7DayMealPlan(preference, gdmRisk.category === 'High', vitals.hemoglobinGDl < 11.0);

  return {
    id: `nutr-${Date.now()}`,
    patientId: vitals.patientId,
    timestamp: new Date().toISOString(),
    calorieTarget: calories,
    carbsPercentage: carbsPct,
    proteinPercentage: proteinPct,
    fatPercentage: fatPct,
    dietaryPreference: preference,
    allergiesOrRestrictions: allergies,
    specialGuidelines,
    sample7DayPlan,
    isDoctorApproved: false,
  };
}

function create7DayMealPlan(
  pref: 'vegetarian' | 'non-vegetarian' | 'eggetarian' | 'vegan',
  isHighGdm: boolean,
  isAnemic: boolean
): DailyMeal[] {
  const days = ['Day 1 (Monday)', 'Day 2 (Tuesday)', 'Day 3 (Wednesday)', 'Day 4 (Thursday)', 'Day 5 (Friday)', 'Day 6 (Saturday)', 'Day 7 (Sunday)'];

  const vegMeals: DailyMeal[] = [
    {
      day: days[0],
      breakfast: isHighGdm ? 'Steel-cut oat porridge with flaxseeds, almond slivers & cinnamon (No added sugar)' : 'Sprouted moong dal cheela with spinach & mint chutney',
      morningSnack: isAnemic ? '1 Fresh pomegranate with 5 soaked walnuts' : '1 Medium green apple + 10 almonds',
      lunch: 'Multigrain roti (2) + Palak Paneer (iron-rich) + Yellow dal tadka + Cucumber salad',
      afternoonSnack: 'Roasted chana (chickpeas) + 1 cup warm lemon ginger water',
      dinner: 'Quinoa khichdi with mixed vegetables (beans, carrots, peas) + Low-fat curd',
    },
    {
      day: days[1],
      breakfast: 'Ragi (finger millet) idli (2-3) with coconut & sambar sauce',
      morningSnack: 'Tender coconut water + 1 guava',
      lunch: 'Brown rice (1 cup) + Rajma (kidney bean) curry + Steamed broccoli + Beetroot raita',
      afternoonSnack: 'Roasted pumpkin seeds + Handful of blueberries or jamun',
      dinner: 'Soya chunk & vegetable stir-fry with 2 Bajra (pearl millet) rotis',
    },
    {
      day: days[2],
      breakfast: 'Vegetable oats upma with carrots, peas, and roasted peanuts',
      morningSnack: 'Soaked chia seeds in unsweetened almond milk + orange slices',
      lunch: 'Multigrain roti (2) + Methi (fenugreek) paneer + Chana dal + Tomato salad',
      afternoonSnack: 'Sprouted Bengal gram salad with lemon juice & cucumber',
      dinner: 'Millet khichdi with vegetable clear soup',
    },
    {
      day: days[3],
      breakfast: 'Stuffed spinach & paneer paratha (whole wheat, minimal oil) + Curd',
      morningSnack: '1 Medium pear + Handful of pumpkin seeds',
      lunch: 'Brown rice + Black-eyed pea (Lobia) curry + Steamed spinach + Cucumber raita',
      afternoonSnack: 'Buttermilk (chass) with roasted cumin powder',
      dinner: 'Mixed vegetable soup + Tofu stir fry with bell peppers & sesame seeds',
    },
    {
      day: days[4],
      breakfast: 'Jowar (sorghum) dosa with tomato onion chutney',
      morningSnack: 'Sliced amla (Indian gooseberry) + handful of soaked almonds',
      lunch: '2 Whole wheat rotis + Mixed dal + Bhindi (okra) fry + Sprouted salad',
      afternoonSnack: 'Foxnuts (Makhana) roasted in ghee with turmeric & black pepper',
      dinner: 'Lentil soup with roasted sweet potato & steamed asparagus',
    },
    {
      day: days[5],
      breakfast: 'Avocado & sprouted bean mash on toasted multigrain sourdough bread',
      morningSnack: '1 bowl of papaya or orange (Vitamin C booster)',
      lunch: 'Brown rice pulav with soya nuggets & green peas + Onion cucumber raita',
      afternoonSnack: 'Boiled peanuts with chat masala & coriander',
      dinner: 'Paneer tikka (200g) with grilled vegetables + warm clear soup',
    },
    {
      day: days[6],
      breakfast: 'Besan cheela stuffed with grated paneer & coriander',
      morningSnack: 'Handful of mixed nuts (walnuts, almonds, pistachios) + kiwi',
      lunch: '2 Multigrain rotis + Lauki (bottle gourd) kofta + Chana dal + Green salad',
      afternoonSnack: 'Chamomile or mint infusion tea + flaxseed crackers',
      dinner: 'Vegetable barley stew with cottage cheese cubes',
    },
  ];

  if (pref === 'non-vegetarian') {
    // Substitute dinner/lunch proteins with grilled fish / chicken / egg whites
    vegMeals[0].lunch = 'Multigrain roti (2) + Grilled Salmon / Fish curry (Omega-3 rich) + Cucumber salad';
    vegMeals[1].dinner = 'Grilled chicken breast with steamed broccoli, carrots & brown rice';
    vegMeals[2].breakfast = '3 Egg white omelette with spinach, tomatoes & whole wheat toast';
    vegMeals[3].lunch = 'Brown rice + Chicken curry (low oil) + Steamed spinach + Curd';
    vegMeals[4].dinner = 'Pan-seared cod or local fish with asparagus & quinoa';
    vegMeals[5].breakfast = 'Boiled eggs (2 whole) with sauteed mushrooms & multigrain toast';
    vegMeals[6].lunch = '2 Multigrain rotis + Mutton liver / chicken curry (Iron-rich) + Salad';
  } else if (pref === 'eggetarian') {
    vegMeals[0].breakfast = '3 Egg white & spinach omelette with whole grain toast';
    vegMeals[2].dinner = 'Egg bhurji (scrambled eggs with onions/tomatoes) + 2 multigrain rotis';
    vegMeals[5].breakfast = 'Boiled eggs (2) + avocado toast';
  }

  return vegMeals;
}
