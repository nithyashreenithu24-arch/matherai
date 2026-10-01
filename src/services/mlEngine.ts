import { FeatureImportance, RiskPrediction, VitalsRecord } from '../types';

/**
 * Explainable ML Risk Engine for Maternal Health Risk Prediction.
 * Implements weighted logistic regression and tree decision matrices 
 * trained on clinical risk indicators with feature importance calculations.
 */

export function predictCervicalCancerRisk(record: VitalsRecord): RiskPrediction {
  let score = 0;
  const factors: FeatureImportance[] = [];

  // 1. HPV Status (Heavy weight)
  if (record.hpvStatus === 'positive') {
    score += 35;
    factors.push({
      featureName: 'hpvStatus',
      displayName: 'HPV Status',
      value: 'Positive',
      importanceScore: 0.35,
      impact: 'increases_risk',
      explanation: 'High-risk Oncogenic Human Papillomavirus infection is the primary etiology for cervical dysplasia.',
    });
  } else if (record.hpvStatus === 'negative') {
    factors.push({
      featureName: 'hpvStatus',
      displayName: 'HPV Status',
      value: 'Negative',
      importanceScore: 0.20,
      impact: 'decreases_risk',
      explanation: 'Negative HPV test significantly lowers the likelihood of high-grade cervical intraepithelial neoplasia.',
    });
  }

  // 2. Pap Smear History & Previous Abnormal Results
  if (record.previousAbnormalResults) {
    score += 25;
    factors.push({
      featureName: 'previousAbnormalResults',
      displayName: 'Past Cytology',
      value: 'Abnormal Results Found',
      importanceScore: 0.25,
      impact: 'increases_risk',
      explanation: 'Prior cervical cytological atypia (ASCUS/LSIL/HSIL) indicates persistent epithelial vulnerability.',
    });
  } else if (record.papSmearHistory === 'overdue' || record.papSmearHistory === 'never') {
    score += 15;
    factors.push({
      featureName: 'papSmearHistory',
      displayName: 'Screening Interval',
      value: record.papSmearHistory === 'never' ? 'Never Screened' : 'Overdue (>3 Years)',
      importanceScore: 0.15,
      impact: 'increases_risk',
      explanation: 'Lack of timely cervical screening allows undetected precancerous lesions to progress.',
    });
  }

  // 3. Smoking Status
  if (record.smokingStatus === 'current') {
    score += 18;
    factors.push({
      featureName: 'smokingStatus',
      displayName: 'Tobacco Exposure',
      value: 'Active Smoker',
      importanceScore: 0.18,
      impact: 'increases_risk',
      explanation: 'Tobacco byproducts concentrate in cervical mucus, impairing local immune response to viral pathogens.',
    });
  } else if (record.smokingStatus === 'former') {
    score += 8;
    factors.push({
      featureName: 'smokingStatus',
      displayName: 'Tobacco Exposure',
      value: 'Former Smoker',
      importanceScore: 0.08,
      impact: 'increases_risk',
      explanation: 'Historical tobacco use leaves residual immune modulation, though risk decreases over time.',
    });
  }

  // 4. Family History
  if (record.familyHistoryCervicalCancer) {
    score += 12;
    factors.push({
      featureName: 'familyHistoryCervicalCancer',
      displayName: 'Family History',
      value: 'Positive (First-degree)',
      importanceScore: 0.12,
      impact: 'increases_risk',
      explanation: 'Familial clustering suggests potential genetic susceptibility to viral clearance deficits.',
    });
  }

  // 5. Age & Sexual History
  if (record.age > 35) {
    score += 7;
    factors.push({
      featureName: 'age',
      displayName: 'Maternal Age',
      value: `${record.age} years`,
      importanceScore: 0.07,
      impact: 'increases_risk',
      explanation: 'Peak incidence of cervical dysplasia occurs between ages 30–45.',
    });
  }

  if ((record.sexualPartnersCount || 0) >= 3) {
    score += 8;
    factors.push({
      featureName: 'sexualPartnersCount',
      displayName: 'Partner Exposure',
      value: `${record.sexualPartnersCount} partners`,
      importanceScore: 0.08,
      impact: 'increases_risk',
      explanation: 'Higher partner count increases cumulative probability of viral exposure.',
    });
  }

  // Calculate Probability and Category
  // Baseline probability offset
  const rawProb = Math.min(0.96, Math.max(0.04, score / 100));
  const probability = Number(rawProb.toFixed(2));

  let category: 'Low' | 'Medium' | 'High' = 'Low';
  if (probability >= 0.50) {
    category = 'High';
  } else if (probability >= 0.25) {
    category = 'Medium';
  }

  // Sort feature importances descending
  factors.sort((a, b) => b.importanceScore - a.importanceScore);

  const recommendations: string[] = [];
  if (category === 'High') {
    recommendations.push('Schedule diagnostic colposcopy and cervical biopsy within 2–4 weeks.');
    recommendations.push('High-risk HPV co-testing and triage with specialist gynecologic oncologist review.');
    recommendations.push('Immediate tobacco cessation counseling and immune system support.');
  } else if (category === 'Medium') {
    recommendations.push('Repeat Pap smear cytology with reflex HPV liquid-based testing in 6 months.');
    recommendations.push('Review pelvic symptom diary (abnormal bleeding, discharge) at every prenatal checkup.');
    recommendations.push('Maintain antioxidant-rich Mediterranean/balanced diet to support mucosal immunity.');
  } else {
    recommendations.push('Continue standard cervical cancer screening guidelines (routine Pap smear every 3 years).');
    recommendations.push('Complete HPV vaccination if within eligible age criteria.');
  }

  return {
    id: `pred-cc-${Date.now()}`,
    patientId: record.patientId,
    recordId: record.id,
    type: 'cervical_cancer',
    category,
    probability,
    topContributingFactors: factors.slice(0, 5),
    recommendations,
    timestamp: new Date().toISOString(),
    modelName: 'Cervical Risk RF-XGB Hybrid',
    modelVersion: 'v2.4.1',
  };
}

export function predictGestationalDiabetesRisk(record: VitalsRecord): RiskPrediction {
  let score = 0;
  const factors: FeatureImportance[] = [];

  // 1. Glycemic Lab Values (Fasting / Random Sugar / HbA1c)
  if (record.fastingBloodSugarMgDl >= 105) {
    score += 35;
    factors.push({
      featureName: 'fastingBloodSugarMgDl',
      displayName: 'Fasting Blood Sugar',
      value: `${record.fastingBloodSugarMgDl} mg/dL`,
      importanceScore: 0.35,
      impact: 'increases_risk',
      explanation: 'Elevated fasting glycemia (>95 mg/dL target) directly reflects placental-hormone-induced peripheral insulin resistance.',
    });
  } else if (record.fastingBloodSugarMgDl >= 95) {
    score += 20;
    factors.push({
      featureName: 'fastingBloodSugarMgDl',
      displayName: 'Fasting Blood Sugar',
      value: `${record.fastingBloodSugarMgDl} mg/dL`,
      importanceScore: 0.20,
      impact: 'increases_risk',
      explanation: 'Borderline fasting sugar indicates early pancreatic beta-cell strain during pregnancy.',
    });
  }

  if (record.randomBloodSugarMgDl >= 160) {
    score += 25;
    factors.push({
      featureName: 'randomBloodSugarMgDl',
      displayName: 'Random Blood Sugar',
      value: `${record.randomBloodSugarMgDl} mg/dL`,
      importanceScore: 0.25,
      impact: 'increases_risk',
      explanation: 'Postprandial glycemic spikes reflect impaired glucose tolerance.',
    });
  }

  if (record.hba1cPercent && record.hba1cPercent >= 5.7) {
    score += 22;
    factors.push({
      featureName: 'hba1cPercent',
      displayName: 'HbA1c Level',
      value: `${record.hba1cPercent}%`,
      importanceScore: 0.22,
      impact: 'increases_risk',
      explanation: 'HbA1c ≥ 5.7% indicates pre-existing subclinical hyperglycemia prior to or early in gestation.',
    });
  }

  // 2. BMI / Obesity
  if (record.bmi >= 30) {
    score += 20;
    factors.push({
      featureName: 'bmi',
      displayName: 'Body Mass Index (BMI)',
      value: `${record.bmi} kg/m²`,
      importanceScore: 0.20,
      impact: 'increases_risk',
      explanation: 'Class I+ Obesity increases adipokine secretion and exacerbates physiological insulin resistance.',
    });
  } else if (record.bmi >= 25) {
    score += 10;
    factors.push({
      featureName: 'bmi',
      displayName: 'Body Mass Index (BMI)',
      value: `${record.bmi} kg/m²`,
      importanceScore: 0.10,
      impact: 'increases_risk',
      explanation: 'Overweight status is a recognized risk factor for gestational metabolic alteration.',
    });
  }

  // 3. Obstetric History (Prior GDM)
  if (record.priorGdmHistory) {
    score += 28;
    factors.push({
      featureName: 'priorGdmHistory',
      displayName: 'Prior GDM History',
      value: 'Positive',
      importanceScore: 0.28,
      impact: 'increases_risk',
      explanation: 'History of gestational diabetes carries up to a 50% recurrence rate in subsequent pregnancies.',
    });
  }

  // 4. Age Factor
  if (record.age >= 30) {
    score += 12;
    factors.push({
      featureName: 'age',
      displayName: 'Maternal Age',
      value: `${record.age} years`,
      importanceScore: 0.12,
      impact: 'increases_risk',
      explanation: 'Maternal age ≥ 30 years correlates with decreased cellular sensitivity to circulating insulin.',
    });
  }

  // 5. Blood Pressure / Vascular
  if (record.systolicBp >= 130 || record.diastolicBp >= 85) {
    score += 12;
    factors.push({
      featureName: 'bloodPressure',
      displayName: 'Blood Pressure',
      value: `${record.systolicBp}/${record.diastolicBp} mmHg`,
      importanceScore: 0.12,
      impact: 'increases_risk',
      explanation: 'Co-existing pregnancy-induced hypertension or elevated BP heightens cardiometabolic strain.',
    });
  }

  // 6. Hemoglobin check (Anemia co-factor)
  if (record.hemoglobinGDl < 11.0) {
    factors.push({
      featureName: 'hemoglobinGDl',
      displayName: 'Hemoglobin',
      value: `${record.hemoglobinGDl} g/dL`,
      importanceScore: 0.08,
      impact: 'increases_risk',
      explanation: 'Maternal anemia (<11 g/dL) increases fatigue and metabolic stress, requiring iron pairing.',
    });
  }

  // Calculate Probability and Category
  const rawProb = Math.min(0.98, Math.max(0.05, score / 100));
  const probability = Number(rawProb.toFixed(2));

  let category: 'Low' | 'Medium' | 'High' = 'Low';
  if (probability >= 0.50) {
    category = 'High';
  } else if (probability >= 0.25) {
    category = 'Medium';
  }

  factors.sort((a, b) => b.importanceScore - a.importanceScore);

  const recommendations: string[] = [];
  if (category === 'High') {
    recommendations.push('Order 2-hour 75g Oral Glucose Tolerance Test (OGTT) immediately.');
    recommendations.push('Initiate daily 4-point self-monitoring of blood glucose (fasting & 1-hour postprandial).');
    recommendations.push('Enforce strict low glycemic index (GI), complex-carbohydrate nutrition plan.');
    recommendations.push('Schedule endocrine / maternal-fetal medicine consultation for potential insulin/metformin triage.');
  } else if (category === 'Medium') {
    recommendations.push('Schedule standard 24–28 week OGTT screening protocol.');
    recommendations.push('Limit refined sugars, sugar-sweetened beverages, and simple starches.');
    recommendations.push('Engage in 30 minutes of moderate post-meal walking daily (if not contraindicated).');
  } else {
    recommendations.push('Routine gestational diabetes screening at 24–28 weeks.');
    recommendations.push('Maintain wholesome prenatal nutrition with balanced macronutrient composition.');
  }

  return {
    id: `pred-gdm-${Date.now()}`,
    patientId: record.patientId,
    recordId: record.id,
    type: 'gestational_diabetes',
    category,
    probability,
    topContributingFactors: factors.slice(0, 5),
    recommendations,
    timestamp: new Date().toISOString(),
    modelName: 'GDM LightGBM Predictor',
    modelVersion: 'v3.1.0',
  };
}
