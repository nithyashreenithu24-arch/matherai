export interface MedicationInfo {
  id: string;
  name: string;
  genericName: string;
  category: 'GDM Glycemic Control' | 'Prenatal Supplement & Anemia' | 'Hypertension & Preeclampsia' | 'Cervical & Reproductive Health';
  pregnancyCategory: 'A' | 'B' | 'C' | 'D' | 'X';
  trimesterSafety: string;
  indications: string[];
  standardDosage: string;
  administrationTiming: string;
  sideEffects: string[];
  contraindications: string[];
  specialInstructions: string;
}

export const PRENATAL_MEDICATIONS: MedicationInfo[] = [
  {
    id: 'med-insulin-nph',
    name: 'Humulin N / Novolin N',
    genericName: 'Insulin NPH (Intermediate-acting)',
    category: 'GDM Glycemic Control',
    pregnancyCategory: 'B',
    trimesterSafety: 'Safe & Preferred in 1st, 2nd, and 3rd Trimesters',
    indications: ['Gestational Diabetes Mellitus (GDM) with elevated fasting blood glucose (>95 mg/dL)'],
    standardDosage: '0.1 - 0.2 units/kg subcutaneously at bedtime (titrated to fasting glucose)',
    administrationTiming: 'Bedtime (10:00 PM) to control morning fasting hypoglycemia/hyperglycemia balance',
    sideEffects: ['Hypoglycemia (blood sugar < 70 mg/dL)', 'Injection site lipodystrophy', 'Mild weight gain'],
    contraindications: ['Known hypersensitivity to human NPH insulin', 'Hypoglycemic episodes without warning'],
    specialInstructions: 'First-line standard of care for GDM when dietary management fails. Does NOT cross the placenta.'
  },
  {
    id: 'med-insulin-lispro',
    name: 'Humalog / Novolog',
    genericName: 'Insulin Lispro / Aspart (Rapid-acting)',
    category: 'GDM Glycemic Control',
    pregnancyCategory: 'B',
    trimesterSafety: 'Safe in 1st, 2nd, and 3rd Trimesters',
    indications: ['Gestational Diabetes Mellitus postprandial glucose spikes (>120 mg/dL 2hr post-meal)'],
    standardDosage: '4 - 8 units subcutaneously immediately before or after major meals',
    administrationTiming: '10 - 15 minutes prior to carbohydrate-containing meals',
    sideEffects: ['Rapid onset hypoglycemia', 'Local site irritation'],
    contraindications: ['Acute hypoglycemic state'],
    specialInstructions: 'Controls postprandial glycemic excursions. Monitor 2-hour postprandial glucose targets strictly.'
  },
  {
    id: 'med-metformin',
    name: 'Glucophage / Fortamet',
    genericName: 'Metformin Hydrochloride',
    category: 'GDM Glycemic Control',
    pregnancyCategory: 'B',
    trimesterSafety: 'Second Line in 2nd and 3rd Trimesters',
    indications: ['GDM in patients refusing insulin or unable to safely self-inject', 'Pre-existing PCOS in early pregnancy'],
    standardDosage: '500 mg once or twice daily with meals (Max 2000 mg/day)',
    administrationTiming: 'With breakfast and dinner to minimize gastrointestinal discomfort',
    sideEffects: ['Nausea & abdominal cramping', 'Diarrhea', 'Vitamin B12 depletion over long term'],
    contraindications: ['Severe renal impairment (eGFR < 30 mL/min)', 'Metabolic acidosis or severe liver disease'],
    specialInstructions: 'Crosses placenta in small amounts. Used as alternative when insulin compliance is challenging.'
  },
  {
    id: 'med-iron-ascorbate',
    name: 'Ferrous Ascorbate + Folic Acid',
    genericName: 'Elemental Iron (100mg) + Folic Acid (1.5mg)',
    category: 'Prenatal Supplement & Anemia',
    pregnancyCategory: 'A',
    trimesterSafety: 'Recommended across all trimesters & postpartum',
    indications: ['Maternal Iron Deficiency Anemia (Hemoglobin < 11.0 g/dL)', 'Routine fetal iron store optimization'],
    standardDosage: '1 tablet daily (containing 100mg elemental iron + 1.5mg folic acid)',
    administrationTiming: 'On an empty stomach with orange juice or Vitamin C for maximal absorption',
    sideEffects: ['Dark stool discoloration (normal)', 'Mild constipation', 'Gastric heaviness'],
    contraindications: ['Hemochromatosis or iron overload syndromes', 'Active peptic ulcer disease'],
    specialInstructions: 'Avoid taking simultaneously with calcium tablets, tea, or milk, as they inhibit iron absorption by up to 60%.'
  },
  {
    id: 'med-folic-acid',
    name: 'Folvite / Folic Acid',
    genericName: 'Folic Acid (Pteroylglutamic Acid)',
    category: 'Prenatal Supplement & Anemia',
    pregnancyCategory: 'A',
    trimesterSafety: 'Critical Pre-conception and 1st Trimester',
    indications: ['Prevention of Neural Tube Defects (Spina Bifida, Anencephaly)', 'Maternal megaloblastic anemia prophylaxis'],
    standardDosage: '400 mcg - 800 mcg daily for low risk; 4mg - 5mg daily for high-risk GDM or prior NTD history',
    administrationTiming: 'Once daily with water',
    sideEffects: ['Extremely well tolerated; rare mild allergic rash'],
    contraindications: ['Undiagnosed megaloblastic anemia caused by B12 deficiency'],
    specialInstructions: 'Start 3 months prior to conception and continue throughout at least the 1st trimester.'
  },
  {
    id: 'med-calcium-vitd3',
    name: 'Shelcal 500 / Caltrate',
    genericName: 'Calcium Carbonate (500mg) + Vitamin D3 (250 IU)',
    category: 'Prenatal Supplement & Anemia',
    pregnancyCategory: 'A',
    trimesterSafety: 'Safe & Recommended in 2nd and 3rd Trimesters',
    indications: ['Fetal skeletal mineralization', 'Prevention of maternal bone density loss & preeclampsia risk reduction'],
    standardDosage: '1000 - 1200 mg elemental calcium daily in divided doses',
    administrationTiming: 'After lunch or dinner (separated from Iron tablet by at least 2-3 hours)',
    sideEffects: ['Mild constipation', 'Gas or bloating'],
    contraindications: ['Hypercalcemia', 'Severe renal calculi (kidney stones)'],
    specialInstructions: 'Vitamin D3 increases intestinal calcium absorption. Separate from prenatal iron supplement.'
  },
  {
    id: 'med-labetalol',
    name: 'Trandate / Normodyne',
    genericName: 'Labetalol Hydrochloride',
    category: 'Hypertension & Preeclampsia',
    pregnancyCategory: 'C',
    trimesterSafety: 'First Line in 2nd and 3rd Trimesters for Chronic/Gestational HTN',
    indications: ['Gestational Hypertension', 'Preeclampsia without severe features (BP > 140/90 mmHg)'],
    standardDosage: '100 mg twice daily, increased up to 400 - 800 mg/day in divided doses',
    administrationTiming: 'With or immediately after meals',
    sideEffects: ['Mild fatigue or dizziness', 'Nasal congestion', 'Scalp tingling'],
    contraindications: ['Severe sinus bradycardia or 2nd/3rd-degree heart block', 'Active bronchial asthma'],
    specialInstructions: 'First-line antihypertensive in pregnancy. Does not compromise uteroplacental blood flow.'
  },
  {
    id: 'med-low-dose-aspirin',
    name: 'Ecosprin 75/150',
    genericName: 'Aspirin (Low-Dose 81mg - 150mg)',
    category: 'Hypertension & Preeclampsia',
    pregnancyCategory: 'B',
    trimesterSafety: 'Initiate from 12th to 28th Gestational Weeks until Delivery',
    indications: ['Preeclampsia prophylaxis in high-risk mothers (Prior preeclampsia, GDM, Chronic HTN, Multiple gestation)'],
    standardDosage: '81 mg to 150 mg once daily',
    administrationTiming: 'Bedtime',
    sideEffects: ['Mild dyspepsia or acid reflux', 'Increased bruising tendency'],
    contraindications: ['Aspirin allergy or severe NSAID-induced asthma', 'Active peptic ulceration'],
    specialInstructions: 'ACOG & USPSTF guidelines strongly recommend initiation before 16 weeks for high preeclampsia risk.'
  },
  {
    id: 'med-progesterone',
    name: 'Susten / Endometrin',
    genericName: 'Micronized Progesterone',
    category: 'Cervical & Reproductive Health',
    pregnancyCategory: 'B',
    trimesterSafety: 'Safe in 1st & 2nd Trimesters',
    indications: ['Short cervical length (< 25mm on transvaginal ultrasound)', 'Prevention of recurrent preterm birth'],
    standardDosage: '200 mg vaginally at bedtime daily from 16 to 36 weeks gestation',
    administrationTiming: 'Vaginally at bedtime to minimize systemic drowsiness',
    sideEffects: ['Mild vaginal discharge', 'Somnolence', 'Breast tenderness'],
    contraindications: ['Undiagnosed abnormal vaginal bleeding', 'Active thromboembolic disease'],
    specialInstructions: 'Helps maintain cervical quiescence and anti-inflammatory tone in women with short cervical canal length.'
  },
  {
    id: 'med-azithromycin',
    name: 'Zithromax / Azithral',
    genericName: 'Azithromycin',
    category: 'Cervical & Reproductive Health',
    pregnancyCategory: 'B',
    trimesterSafety: 'Safe in All Trimesters',
    indications: ['Cervicitis secondary to Chlamydia trachomatis', 'Bacterial vaginosis or pelvic inflammatory prophylaxis'],
    standardDosage: '1000 mg (1 g) single oral dose',
    administrationTiming: '1 hour before or 2 hours after food',
    sideEffects: ['Mild nausea or diarrhea', 'Abdominal pain'],
    contraindications: ['Cholestatic jaundice/hepatic dysfunction with prior azithromycin use'],
    specialInstructions: 'First-line cure for chlamydial cervicitis in pregnant women to prevent preterm premature rupture of membranes (PPROM).'
  }
];

export const PREGNANCY_CATEGORIES_GUIDE = [
  {
    category: 'Category A',
    color: 'emerald',
    badge: 'Safest (Controlled Human Studies)',
    description: 'Controlled studies in pregnant women have failed to demonstrate a risk to the fetus in any trimester. Possibility of fetal harm appears remote.',
    examples: 'Folic Acid, Vitamin B6 (Pyridoxine), Thyroid Hormone (Levothyroxine)'
  },
  {
    category: 'Category B',
    color: 'blue',
    badge: 'Safe (Animal Studies Clear / Human Safe)',
    description: 'Animal reproduction studies have not demonstrated a fetal risk, but there are no controlled studies in pregnant women; OR animal studies showed adverse effects not confirmed in human studies.',
    examples: 'Insulin (NPH, Lispro), Metformin, Low-Dose Aspirin, Progesterone, Azithromycin'
  },
  {
    category: 'Category C',
    color: 'amber',
    badge: 'Use with Caution (Risk vs Benefit)',
    description: 'Animal reproduction studies have shown an adverse effect on the fetus, and there are no adequate studies in humans. Use only if potential benefit outweighs risk.',
    examples: 'Labetalol, Nifedipine, Calcium Channel Blockers, Heparin'
  },
  {
    category: 'Category D',
    color: 'rose',
    badge: 'Positive Evidence of Human Risk',
    description: 'There is positive evidence of human fetal risk based on adverse reaction data. May be acceptable in life-threatening emergencies where safer drugs cannot be used.',
    examples: 'ACE Inhibitors (Enalapril), ARBs (Losartan), Tetracyclines, Methotrexate'
  },
  {
    category: 'Category X',
    color: 'purple',
    badge: 'Strictly Contraindicated in Pregnancy',
    description: 'Studies in animals or humans demonstrate fetal abnormalities or teratogenic risk. The risk of using the drug in pregnant women clearly outweighs any possible benefit.',
    examples: 'Warfarin, Statins, Isotretinoin, Methotrexate'
  }
];
