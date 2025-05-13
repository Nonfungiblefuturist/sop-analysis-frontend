import React, { useState, useEffect } from 'react';
// Importing icons from lucide-react for visual feedback
import { ArrowRight, CheckCircle, AlertCircle, XCircle, Clock, ChevronDown, ChevronUp, FileText, Sparkles, MessageSquare } from 'lucide-react';

// Main component for the Approval Workflow
const ApprovalWorkflow = () => {
  // State variables
  const [currentStep, setCurrentStep] = useState(1);
  const [studentData, setStudentData] = useState({
    program: '',
    hasUSGPA: false,
    sourceCountry: 'india', // Default country
    originalGrade: '',
    usGPA: '',
    gmatGre: '',
    sleScore: '',
    interview: '',
    finances: '',
    sopReviewed: false,
    bankStatement: false,
    sopText: '',
    indiaInputMode: 'percentage', // New state for India's dual input mode
  });
  const [decision, setDecision] = useState(null);
  const [convertedGPA, setConvertedGPA] = useState(null);

  // --- SOP Assessor State ---
  const [showSopAssessor, setShowSopAssessor] = useState(false);
  const initialSopCriteria = [
    { id: 'sop1', text: "Main academic/career goal clearly stated early?", category: "Clarity of Purpose", checked: false },
    { id: 'sop2', text: "Specific program at Lincoln University clearly identified?", category: "Clarity of Purpose", checked: false },
    { id: 'sop3', text: "Clear reasons for choosing *this specific program* and *Lincoln University* evident?", category: "Clarity of Purpose", checked: false },
    { id: 'sop4', text: "Relevant academic background/experiences effectively highlighted?", category: "Content & Focus", checked: false },
    { id: 'sop5', text: "Specific interests within the field/program detailed?", category: "Content & Focus", checked: false },
    { id: 'sop6', text: "How this program will help achieve stated goals is well-articulated?", category: "Content & Focus", checked: false },
    { id: 'sop7', text: "Demonstrates genuine interest, passion, and motivation?", category: "Content & Focus", checked: false },
    { id: 'sop8', text: "SOP is tailored to Lincoln University (not generic)?", category: "Fit and Tailoring", checked: false },
    { id: 'sop9', text: "Shows understanding of program strengths or faculty research?", category: "Fit and Tailoring", checked: false },
    { id: 'sop10', text: "Clear, logical flow of ideas and well-structured?", category: "Structure & Presentation", checked: false },
    { id: 'sop11', text: "Professionally written (grammar, spelling, concise)?", category: "Structure & Presentation", checked: false },
    { id: 'sop12', text: "Avoids overly vague goals or motivations?", category: "Potential Issues", checked: false },
    { id: 'sop13', text: "Avoids dwelling on excuses or blaming others?", category: "Potential Issues", checked: false },
    { id: 'sop14', text: "Avoids clichés or generic statements?", category: "Potential Issues", checked: false },
  ];
  const [sopAssessmentCriteria, setSopAssessmentCriteria] = useState(initialSopCriteria);

  // --- AI SOP Analysis State ---
  const [aiSopAnalysis, setAiSopAnalysis] = useState(null);
  const [isAnalyzingSop, setIsAnalyzingSop] = useState(false);

  const handleSopCriteriaChange = (id) => {
    setSopAssessmentCriteria(prevCriteria =>
      prevCriteria.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const sopCriteriaMetCount = sopAssessmentCriteria.filter(item => item.checked).length;
  const sopCriteriaTotalCount = sopAssessmentCriteria.length;

const handleAnalyzeSopWithAI = async () => {
  if (!studentData.sopText.trim()) {
    setAiSopAnalysis({ error: "Please paste the SOP text first." });
    return;
  }

  setIsAnalyzingSop(true);
  setAiSopAnalysis(null);

  setTimeout(() => {
    const mockAnalysis = {
      clarity_goals: "Clear",
      relevance_preparation: "Relevant",
      motivation_fit: "Good Fit",
      structure_writing: "Good",
      uniqueness_authenticity: "Somewhat Unique",
      strengths: [
        "Clearly articulates long-term career goals.",
        "Effectively connects past research experience to program interests.",
        "Shows genuine enthusiasm for specific faculty work at Lincoln University."
      ],
      areas_for_improvement: [
        "Could be more specific about short-term academic objectives.",
        "Some sections are verbose.",
        "The 'Why Lincoln?' part could be strengthened."
      ],
      recommendations: [
        "Refine introduction to state specific program and goal.",
        "Review for conciseness.",
        "Add 1-2 sentences linking personal values to Lincoln's mission."
      ],
      overall_impression: "Promising Candidate"
    };

    setAiSopAnalysis(mockAnalysis);
    setIsAnalyzingSop(false);

    // ✅ Auto-check SOP Reviewed if AI thinks it's good
    if (mockAnalysis.overall_impression === "Promising Candidate" && !studentData.sopReviewed) {
      setStudentData(prev => ({
        ...prev,
        sopReviewed: true
      }));
    }
  }, 2500);
};

  // --- MERGED & UPDATED Grading Systems Data ---
  // Prioritizes structure from SimpleGradeConverter for specified countries,
  // retains existing countries and their logic otherwise.
  const gradingSystems = {
    // Countries from SimpleGradeConverter (structure and conversion logic adapted)
    india: {
      name: '🇮🇳 India', type: 'dual_india', // Changed type to reflect new handling
      options: ['percentage', 'cgpa'], // For the mode selector
      percentage: { min: 0, max: 100 }, cgpa: { min: 0, max: 10 },
      description: 'Select input: Percentage (0-100) or CGPA (0-10).',
      example: 'E.g., 85% or 8.5 CGPA.',
      commonRanges: 'First Class: 60%+, Second Class: 50-59%, Pass: ~40%'
    },
    china: {
      name: '🇨🇳 China', type: 'percentage', // 'percentage' type will use SimpleGradeConverter logic
      min: 0, max: 100,
      description: '100-point percentage scale.',
      example: 'Example: 85, 92, 76.',
      commonRanges: '90-100: Excellent, 80-89: Good, 70-79: Average, 60-69: Pass'
    },
    uk: {
      name: '🇬🇧 UK', type: 'classification_uk', // Specific type for dropdown
      scale: { 'First Class': 4.0, 'Upper Second (2:1)': 3.5, 'Lower Second (2:2)': 3.0, 'Third Class': 2.5, 'Pass': 2.0, 'Fail': 0.0 },
      options: ['First Class', 'Upper Second (2:1)', 'Lower Second (2:2)', 'Third Class', 'Pass', 'Fail'], // For dropdown
      description: 'Honours classification system.',
      example: 'Example: First Class, Upper Second (2:1).',
      commonRanges: 'First: 70%+, 2:1: 60-69%, 2:2: 50-59%, Third: 40-49%'
    },
    canada: { // Overwrites previous Canada entry with SimpleGradeConverter style
      name: '🇨🇦 Canada', type: 'gpa4', // 'gpa4' will use SimpleGradeConverter logic
      min: 0, max: 4,
      description: '4.0 scale GPA (similar to US).',
      example: 'Example: 3.7, 3.5, 3.9.',
      commonRanges: 'A: 4.0, A-: 3.7, B+: 3.3, B: 3.0, B-: 2.7, C+: 2.3, C: 2.0'
    },
    australia: {
      name: '🇦🇺 Australia', type: 'letters_australia', // Specific type for dropdown
      scale: { 'HD': 4.0, 'D': 3.5, 'C': 3.0, 'P': 2.0, 'F': 0.0, 'N': 0.0 },
      options: ['HD', 'D', 'C', 'P', 'F', 'N'], // For dropdown
      description: 'HD/D/C/P/F system.',
      example: 'Example: HD (High Distinction), D (Distinction).',
      commonRanges: 'HD: 80-100%, D: 70-79%, C: 60-69%, P: 50-59%'
    },
    germany: { // Overwrites previous Germany entry
      name: '🇩🇪 Germany', type: 'scale6_germany', // Specific type for dropdown
      scale: { '1.0': 4.0, '1.3': 3.8, '1.7': 3.5, '2.0': 3.2, '2.3': 2.8, '2.7': 2.5, '3.0': 2.2, '3.3': 1.8, '3.7': 1.5, '4.0': 1.2, /* '4.3': 0.8, '4.7': 0.5, '5.0': 0.2, '5.3': 0.1, '6.0': 0.0 */ '5.0': 0.0 }, // Simplified for pass/fail, 4.0 is pass
      options: ['1.0', '1.3', '1.7', '2.0', '2.3', '2.7', '3.0', '3.3', '3.7', '4.0', '5.0'], // Adjusted for common grades
      description: '1-6 scale (1 is best, 4 is pass, 5 is fail).',
      example: 'Example: 1.0 (sehr gut), 2.0 (gut).',
      commonRanges: '1.0-1.5: Very Good, 1.6-2.5: Good, 2.6-3.5: Satisfactory, 3.6-4.0: Sufficient (Pass)'
    },
    france: { // Overwrites previous France entry
      name: '🇫🇷 France', type: 'scale20', // 'scale20' will use SimpleGradeConverter logic
      min: 0, max: 20,
      description: '20-point scale (0-20).',
      example: 'Example: 16, 18, 14.',
      commonRanges: '18-20: Excellent, 16-17: Very Good, 14-15: Good, 12-13: Fairly Good, 10-11: Pass'
    },
    russia: { // Overwrites previous Russia entry
      name: '🇷🇺 Russia', type: 'scale5_russia', // Specific type for dropdown
      scale: { '5': 4.0, '4': 3.0, '3': 2.0, '2': 0.0 },
      options: ['5', '4', '3', '2'], // For dropdown
      description: '5-point scale (2-5).',
      example: 'Example: 5 (отлично), 4 (хорошо).',
      commonRanges: '5: 90-100%, 4: 75-89%, 3: 60-74%, 2: Below 60%'
    },
    japan: { // New country from SimpleGradeConverter
      name: '🇯🇵 Japan', type: 'gpa4', // 'gpa4' will use SimpleGradeConverter logic
      min: 0, max: 4,
      description: '4.0 scale GPA system.',
      example: 'Example: 3.8, 3.5, 3.9.',
      commonRanges: '優(Yu)/S/A+: 90-100% (4.0), 良(Ryo)/A/B: 80-89% (3.0), 可(Ka)/C: 70-79% (2.0), Pass: 60-69% (1.0)'
    },
    southkorea: { // Overwrites previous South Korea
      name: '🇰🇷 South Korea', type: 'gpa43_sk', // 'gpa43_sk' for specific SK 4.3 scale logic
      min: 0, max: 4.3,
      description: '4.3 scale (some universities use 4.5).',
      example: 'Example: 4.0, 3.8, 4.2.',
      commonRanges: 'A+: 4.3, A0: 4.0, A-: 3.7, B+: 3.3, B0: 3.0'
    },

    // --- Retained Countries (using previous WES-inspired logic if not listed above) ---
    nepal: { name: '🇳🇵 Nepal', type: 'percentage_generic', max: 100, description: 'Percentage (0-100) or GPA (4.0 scale). Enter percentage.', example: 'Example: 82%.', commonRanges: 'Distinction: >=75%, First Div: >=60%, Second Div: >=45%, Pass: >=35-40%' },
    nigeria: { name: '🇳🇬 Nigeria', type: 'gpa5_nigeria_wes', max: 5, description: 'CGPA (0-5).', example: 'Example: 4.5, 3.8, 2.5', commonRanges: 'First Class: 4.5-5.0, Second Upper (2:1): 3.5-4.49, Second Lower (2:2): 2.4-3.49, Third Class: 1.5-2.39, Pass: 1.0-1.49' },
    pakistan: { name: '🇵🇰 Pakistan', type: 'percentage_pakistan_wes', max: 100, description: 'Percentage (0-100) or Divisions.', example: 'Example: 82%, 65%, 50%', commonRanges: 'First Division: >=60%, Second Division: >=45%, Third Division: >=33-40%' },
    bangladesh: { name: '🇧🇩 Bangladesh', type: 'gpa4_bangladesh_wes', max: 4, description: 'GPA (0-4) based on Letter Grades.', example: 'Example: 3.7, 3.5, 2.8', commonRanges: 'A+=4.0, A=3.75, A-=3.5, B+=3.25, B=3.0, B-=2.75, C+=2.5, C=2.25, D=2.0 (Pass)' },
    vietnam: { name: '🇻🇳 Vietnam', type: 'scale10_wes', max: 10, description: '10-point scale (0-10).', example: 'Example: 8.0, 7.5, 9.1', commonRanges: 'Excellent (Xuất sắc): 9-10, Very Good (Giỏi): 8-8.9, Good (Khá): 7-7.9, Average (Trung bình): 5-6.9 (Pass)' },
    philippines: { name: '🇵🇭 Philippines', type: 'scale_philippines_wes', max: 1.0, description: 'Inverted 1.0-5.0 scale (1.0 is best).', example: 'Example: 1.75, 2.25, 1.25', commonRanges: 'Excellent: 1.0-1.49, Very Good: 1.5-1.99, Good: 2.0-2.49, Satisfactory: 2.5-2.99, Pass: 3.0' },
    argentina: { name: '🇦🇷 Argentina', type: 'scale10_wes', max: 10, description: '10-point scale (0-10).', example: 'Example: 7.5, 9, 6', commonRanges: 'Outstanding (Sobresaliente): 9-10, Very Good (Distinguido): 8-8.9, Good (Bueno): 6-7.9, Pass (Aprobado): 4-5.9' },
    brazil: { name: '🇧🇷 Brazil', type: 'scale10_wes', max: 10, description: '10-point scale (0-10).', example: 'Example: 7.0, 8.5, 9.2', commonRanges: 'Excellent (SS): 9-10, Very Good (MS): 7-8.9, Satisfactory (MM): 5-6.9 (Pass), Fail (II/MI/SR): <5' },
    cameroon: { name: '🇨🇲 Cameroon', type: 'scale20_wes', max: 20, description: '20-point scale (0-20). French system influence.', example: 'Example: 14, 16, 11', commonRanges: 'Very Good (Très Bien): 16-20, Good (Bien): 14-15.9, Fairly Good (Assez Bien): 12-13.9, Pass (Passable): 10-11.9' },
    colombia: { name: '🇨🇴 Colombia', type: 'scale5_colombia_wes', max: 5, description: '5-point scale (0-5).', example: 'Example: 4.0, 3.5, 4.8', commonRanges: 'Excellent (Sobresaliente): 4.5-5.0, Good (Bueno): 3.5-4.4, Satisfactory (Aceptable): 3.0-3.4 (Pass)' },
    egypt: { name: '🇪🇬 Egypt', type: 'percentage_generic', max: 100, description: 'Percentage (0-100).', example: 'Example: 80%, 72%, 90%', commonRanges: 'Excellent (Mumtaz): >=85, Very Good (Jayyid Jiddan): >=75, Good (Jayyid): >=65, Pass (Maqbul): >=50' },
    indonesia: { name: '🇮🇩 Indonesia', type: 'gpa4_wes', max: 4, description: 'GPA (0-4). Letter grades A-E.', example: 'Example: 3.4, 2.8, 3.9', commonRanges: 'A=4, B=3, C=2, D=1 (Pass), E=0 (Fail)' },
    iran: { name: '🇮🇷 Iran', type: 'scale20_wes', max: 20, description: '20-point scale (0-20).', example: 'Example: 17, 14.5, 19', commonRanges: 'Excellent: 17-20, Good: 14-16.9, Average: 12-13.9, Pass: 10-11.9' },
    kazakhstan: { name: '🇰🇿 Kazakhstan', type: 'percentage_generic', max: 100, description: 'Percentage (0-100) or Letter/GPA.', example: 'Example: 85, 92, 70', commonRanges: 'Excellent (A/A-): 90-100, Good (B+/B/B-): 75-89, Satisfactory (C+/C/C-/D+/D): 50-74 (Pass)' },
    kenya: { name: '🇰🇪 Kenya', type: 'percentage_kenya_wes', max: 100, description: 'Percentage (0-100) or Letter Grades.', example: 'Example: 75, 62, 88', commonRanges: 'A: 70-100, B: 60-69, C: 50-59, D: 40-49 (Pass)' },
    mexico: { name: '🇲🇽 Mexico', type: 'scale10_wes', max: 10, description: '10-point scale (0-10).', example: 'Example: 8.5, 9.2, 7.0', commonRanges: 'Excellent (MB/E): 9-10, Good (B): 8-8.9, Sufficient (S): 6-7.9 (Pass)' },
    myanmar: { name: '🇲🇲 Myanmar', type: 'percentage_generic', max: 100, description: 'Percentage (0-100).', example: 'Example: 75, 80, 65', commonRanges: 'Distinction: >=75, Credit: >=60, Pass: >=40-50' },
    peru: { name: '🇵🇪 Peru', type: 'scale20_wes', max: 20, description: '20-point scale (0-20).', example: 'Example: 15, 18, 12', commonRanges: 'Excellent (Sobresaliente): 17-20, Good (Bueno): 14-16, Approved (Aprobado): 11-13 (Pass varies 10.5-11)' },
    saudiarabia: { name: '🇸🇦 Saudi Arabia', type: 'gpa4_wes', max: 4, description: 'GPA (0-4 or 0-5). Enter 4.0 scale value.', example: 'Example: 3.6, 3.9, 2.8', commonRanges: 'Excellent (A+): 3.75-4.0, Very Good (B+): 3.25-3.74, Good (C+): 2.75-3.24, Pass (D): 2.0-2.74' },
    srilanka: { name: '🇱🇰 Sri Lanka', type: 'percentage_generic', max: 100, description: 'Percentage (0-100) or GPA (4.0). Enter percentage.', example: 'Example: 78, 65, 82', commonRanges: 'A: 70-100, B: 60-69, C: 50-59, S (Pass): 35-49' },
    tanzania: { name: '🇹🇿 Tanzania', type: 'gpa5_tanzania_wes', max: 5, description: 'GPA (0-5).', example: 'Example: 3.9, 4.5, 2.8', commonRanges: 'A: 4.4-5.0, B+: 3.5-4.3, B: 2.7-3.4, C: 2.0-2.6 (Pass)' },
    thailand: { name: '🇹🇭 Thailand', type: 'gpa4_wes', max: 4, description: 'GPA (0-4). Letter grades A-F.', example: 'Example: 3.5, 2.8, 4.0', commonRanges: 'A=4.0, B+=3.5, B=3.0, C+=2.5, C=2.0, D+=1.5, D=1.0 (Pass)' },
    turkey: { name: '🇹🇷 Turkey', type: 'gpa4_wes', max: 4, description: 'GPA (0-4) or Letter Grades (AA-FF).', example: 'Example: 3.1, 2.5, 3.8', commonRanges: 'AA=4.0, BA=3.5, BB=3.0, CB=2.5, CC=2.0 (Pass), DC=1.5, DD=1.0, FD=0.5, FF=0.0' },
    uganda: { name: '🇺🇬 Uganda', type: 'gpa5_uganda_wes', max: 5, description: 'CGPA (0-5).', example: 'Example: 4.2, 3.9, 4.8', commonRanges: 'First Class: 4.4-5.0, Second Upper (2:1): 3.6-4.3, Second Lower (2:2): 2.8-3.5, Pass: 2.0-2.7' },
    ukraine: { name: '🇺🇦 Ukraine', type: 'percentage_generic', max: 100, description: 'Percentage (0-100). ECTS scale A-F.', example: 'Example: 85, 92, 75', commonRanges: 'Excellent (A): 90-100, Good (B,C): 75-89, Satisfactory (D,E): 60-74 (Pass)' },
    venezuela: { name: '🇻🇪 Venezuela', type: 'scale20_wes', max: 20, description: '20-point scale (0-20).', example: 'Example: 16, 14, 19', commonRanges: 'Excellent: 19-20, Very Good: 16-18, Good: 14-15, Pass: 10-13' },
    zimbabwe: { name: '🇿🇼 Zimbabwe', type: 'classification_wes', options: ['First Class', 'Upper Second (2:1)', 'Lower Second (2:2)', 'Third Class', 'Pass'], description: 'Honours degree classification (UK Influence).', example: 'Select classification.', commonRanges: 'First: >=75%, 2:1: 65-74%, 2:2: 50-64%, Pass: 40-49%' },
  };

  // --- UPDATED GPA Conversion Function ---
  const convertToUSGPA = (grade, country) => {
    const system = gradingSystems[country];
    if (!system || grade === null || grade === undefined || grade === '') return null;

    let normalizedGrade = 0; // This will be the US GPA (0-4.0)
    const numericGrade = parseFloat(grade);

    // Use specific conversion logic from SimpleGradeConverter for relevant types
    switch (system.type) {
      case 'percentage': // China (from SimpleGradeConverter)
        if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) return null;
        if (numericGrade >= 93) normalizedGrade = 4.0;
        else if (numericGrade >= 90) normalizedGrade = 3.7;
        else if (numericGrade >= 87) normalizedGrade = 3.3;
        else if (numericGrade >= 83) normalizedGrade = 3.0;
        else if (numericGrade >= 80) normalizedGrade = 2.7;
        else if (numericGrade >= 77) normalizedGrade = 2.3;
        else if (numericGrade >= 73) normalizedGrade = 2.0;
        else if (numericGrade >= 70) normalizedGrade = 1.7;
        else if (numericGrade >= 67) normalizedGrade = 1.3;
        else if (numericGrade >= 65) normalizedGrade = 1.0;
        else if (numericGrade >= 60) normalizedGrade = 0.7; // Pass
        else normalizedGrade = 0.0; // Fail
        break;
      case 'gpa4': // Canada, Japan (from SimpleGradeConverter)
        if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 4) return null;
        normalizedGrade = numericGrade;
        break;
      case 'gpa43_sk': // South Korea 4.3 scale (from SimpleGradeConverter)
        if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 4.3) return null;
        normalizedGrade = (numericGrade / 4.3) * 4.0;
        break;
      case 'classification_uk': // UK (from SimpleGradeConverter)
      case 'letters_australia': // Australia (from SimpleGradeConverter)
      case 'scale5_russia':     // Russia (from SimpleGradeConverter)
        if (system.scale && system.scale[grade] !== undefined) {
          normalizedGrade = system.scale[grade];
        } else { return null; } // Invalid grade for this classification/letter system
        break;
      case 'scale6_germany':   // Germany (from SimpleGradeConverter)
         if (system.scale && system.scale[grade] !== undefined) {
          normalizedGrade = system.scale[grade];
        } else { return null; }
        break;
      case 'scale20': // France (from SimpleGradeConverter)
        if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 20) return null;
        normalizedGrade = (numericGrade / 20.0) * 4.0;
        break;
      case 'dual_india': // India (from SimpleGradeConverter)
        if (isNaN(numericGrade)) return null;
        if (studentData.indiaInputMode === 'cgpa') {
          if (numericGrade < 0 || numericGrade > 10) return null;
          normalizedGrade = (numericGrade / 10.0) * 4.0;
        } else { // percentage mode for India
          if (numericGrade < 0 || numericGrade > 100) return null;
          // Using the detailed percentage scale from SimpleGradeConverter for India
          if (numericGrade >= 93) normalizedGrade = 4.0;
          else if (numericGrade >= 90) normalizedGrade = 3.7;
          else if (numericGrade >= 87) normalizedGrade = 3.3;
          else if (numericGrade >= 83) normalizedGrade = 3.0;
          else if (numericGrade >= 80) normalizedGrade = 2.7;
          else if (numericGrade >= 77) normalizedGrade = 2.3;
          else if (numericGrade >= 73) normalizedGrade = 2.0;
          else if (numericGrade >= 70) normalizedGrade = 1.7;
          else if (numericGrade >= 67) normalizedGrade = 1.3;
          else if (numericGrade >= 65) normalizedGrade = 1.0;
          else if (numericGrade >= 60) normalizedGrade = 0.7; // Assuming 60 is a D- equivalent based on example
          else normalizedGrade = 0.0;
        }
        break;

      // --- Retained WES-inspired logic for other countries ---
      case 'percentage_generic': if (isNaN(numericGrade)) return null; if (numericGrade >= 80) normalizedGrade = 4.0; else if (numericGrade >= 65) normalizedGrade = 3.0; else if (numericGrade >= 50) normalizedGrade = 2.0; else if (numericGrade >= 40) normalizedGrade = 1.0; else normalizedGrade = 0.0; break;
      case 'percentage_india_wes': if (isNaN(numericGrade)) return null; if (numericGrade >= 70) normalizedGrade = 4.0; else if (numericGrade >= 60) normalizedGrade = 3.3; else if (numericGrade >= 50) normalizedGrade = 2.7; else if (numericGrade >= 35) normalizedGrade = 2.0; else normalizedGrade = 0.0; break;
      case 'percentage_canada_wes': if (isNaN(numericGrade)) return null; if (numericGrade >= 90) normalizedGrade = 4.0; else if (numericGrade >= 85) normalizedGrade = 3.9; else if (numericGrade >= 80) normalizedGrade = 3.7; else if (numericGrade >= 77) normalizedGrade = 3.3; else if (numericGrade >= 73) normalizedGrade = 3.0; else if (numericGrade >= 70) normalizedGrade = 2.7; else if (numericGrade >= 67) normalizedGrade = 2.3; else if (numericGrade >= 63) normalizedGrade = 2.0; else if (numericGrade >= 60) normalizedGrade = 1.7; else if (numericGrade >= 57) normalizedGrade = 1.3; else if (numericGrade >= 53) normalizedGrade = 1.0; else if (numericGrade >= 50) normalizedGrade = 0.7; else normalizedGrade = 0.0; break;
      case 'percentage_kenya_wes': if (isNaN(numericGrade)) return null; if (numericGrade >= 70) normalizedGrade = 4.0; else if (numericGrade >= 60) normalizedGrade = 3.0; else if (numericGrade >= 50) normalizedGrade = 2.0; else if (numericGrade >= 40) normalizedGrade = 1.0; else normalizedGrade = 0.0; break;
      case 'percentage_pakistan_wes': if (isNaN(numericGrade)) return null; if (numericGrade >= 70) normalizedGrade = 4.0; else if (numericGrade >= 60) normalizedGrade = 3.3; else if (numericGrade >= 45) normalizedGrade = 2.7; else if (numericGrade >= 33) normalizedGrade = 2.0; else normalizedGrade = 0.0; break;
      case 'gpa4_wes': if (isNaN(numericGrade)) return null; normalizedGrade = Math.min(numericGrade, 4.0); break;
      case 'gpa4_bangladesh_wes': if (isNaN(numericGrade)) return null; if (numericGrade >= 3.75) normalizedGrade = 4.0; else if (numericGrade >= 3.50) normalizedGrade = 3.7; else if (numericGrade >= 3.25) normalizedGrade = 3.3; else if (numericGrade >= 3.00) normalizedGrade = 3.0; else if (numericGrade >= 2.75) normalizedGrade = 2.7; else if (numericGrade >= 2.50) normalizedGrade = 2.3; else if (numericGrade >= 2.25) normalizedGrade = 2.0; else if (numericGrade >= 2.00) normalizedGrade = 1.0; else normalizedGrade = 0.0; break;
      case 'gpa5_nigeria_wes': case 'gpa5_uganda_wes': if (isNaN(numericGrade)) return null; if (numericGrade >= 4.5) normalizedGrade = 4.0; else if (numericGrade >= 3.5) normalizedGrade = 3.3; else if (numericGrade >= 2.4) normalizedGrade = 2.7; else if (numericGrade >= 1.5) normalizedGrade = 2.0; else normalizedGrade = 0.0; break;
      case 'gpa5_tanzania_wes': if (isNaN(numericGrade)) return null; if (numericGrade >= 4.4) normalizedGrade = 4.0; else if (numericGrade >= 3.5) normalizedGrade = 3.3; else if (numericGrade >= 2.7) normalizedGrade = 2.7; else if (numericGrade >= 2.0) normalizedGrade = 2.0; else normalizedGrade = 0.0; break;
      case 'scale10_wes': if (isNaN(numericGrade)) return null; if (numericGrade >= 9.0) normalizedGrade = 4.0; else if (numericGrade >= 8.0) normalizedGrade = 3.3; else if (numericGrade >= 7.0) normalizedGrade = 2.7; else if (numericGrade >= 6.0) normalizedGrade = 2.3; else if (numericGrade >= 5.0) normalizedGrade = 2.0; else normalizedGrade = 0.0; break;
      case 'scale20_wes': if (isNaN(numericGrade)) return null; if (numericGrade >= 16) normalizedGrade = 4.0; else if (numericGrade >= 14) normalizedGrade = 3.5; else if (numericGrade >= 12) normalizedGrade = 3.0; else if (numericGrade >= 10) normalizedGrade = 2.0; else normalizedGrade = 0.0; break;
      case 'scale5_colombia_wes': if (isNaN(numericGrade)) return null; if (numericGrade >= 4.5) normalizedGrade = 4.0; else if (numericGrade >= 4.0) normalizedGrade = 3.3; else if (numericGrade >= 3.5) normalizedGrade = 2.7; else if (numericGrade >= 3.0) normalizedGrade = 2.0; else normalizedGrade = 0.0; break;
      case 'classification_wes': if (grade === 'First Class') normalizedGrade = 4.0; else if (grade === 'Upper Second (2:1)') normalizedGrade = 3.3; else if (grade === 'Lower Second (2:2)') normalizedGrade = 2.7; else if (grade === 'Third Class') normalizedGrade = 2.3; else if (grade === 'Pass') normalizedGrade = 2.0; else normalizedGrade = 0.0; break;
      case 'scale_philippines_wes': if (isNaN(numericGrade)) return null; if (numericGrade <= 1.25) normalizedGrade = 4.0; else if (numericGrade <= 1.75) normalizedGrade = 3.5; else if (numericGrade <= 2.25) normalizedGrade = 3.0; else if (numericGrade <= 2.75) normalizedGrade = 2.5; else if (numericGrade <= 3.00) normalizedGrade = 2.0; else normalizedGrade = 0.0; break;
      default: return null; // Unknown type
    }
    const finalConverted = Math.max(0, Math.min(4.0, parseFloat(normalizedGrade.toFixed(2))));
    return isNaN(finalConverted) ? null : finalConverted;
  };

  // --- Decision Logic (No changes) ---
  const makeDecision = () => {
    const directGPA = parseFloat(studentData.usGPA);
    const effectiveGPA = studentData.hasUSGPA ? (isNaN(directGPA) ? null : directGPA) : convertedGPA;
    if (effectiveGPA === null || isNaN(effectiveGPA)) { setDecision({ status: 'REJECTED', reasons: ['Invalid or missing GPA information.'], nextSteps: ['Verify GPA input.'], gpa: null, needsDocs: !(studentData.sopReviewed && studentData.bankStatement) }); return; }
    const gpa = effectiveGPA; const program = studentData.program; const gmatScore = parseFloat(studentData.gmatGre) || 0; const sleScore = parseFloat(studentData.sleScore) || 0; const hasAllDocs = studentData.sopReviewed && studentData.bankStatement;
    let status = 'REJECTED'; let reasons = []; let nextSteps = []; let isAcademicallyQualified = false;
    switch(program) {
      case 'BA': if (gpa >= 2.0) isAcademicallyQualified = true; else if (gpa >= 1.9) { status = 'SPECIAL_REVIEW'; reasons.push('GPA 1.9 - requires Provost approval'); nextSteps.push('Schedule Provost review'); setDecision({ status, reasons, nextSteps, gpa, needsDocs: !hasAllDocs }); return; } else { status = 'REJECTED'; reasons.push(`GPA (${gpa.toFixed(2)}) below 1.9 minimum`); setDecision({ status, reasons, nextSteps, gpa, needsDocs: !hasAllDocs }); return; } break;
      case 'BS-DI': if (gpa >= 2.0 && sleScore >= 21 && studentData.interview === 'pass') isAcademicallyQualified = true; else { status = 'REJECTED'; if (gpa < 2.0) reasons.push(`GPA (${gpa.toFixed(2)}) below 2.0`); if (sleScore < 21) reasons.push(`SLE score (${sleScore}) below 21`); if (studentData.interview !== 'pass') reasons.push('Interview not passed or completed'); setDecision({ status, reasons, nextSteps, gpa, needsDocs: !hasAllDocs }); return; } break;
      case 'MBA': case 'MS-IB': case 'MS-FM': const requiredGPA = 2.7; const conditionalGPA = 2.0; if (gpa >= requiredGPA) isAcademicallyQualified = true; else if (gpa >= conditionalGPA) { isAcademicallyQualified = true; reasons.push(`Conditional admission - GPA (${gpa.toFixed(2)}) below ${requiredGPA}. Must maintain 3.0+ GPA.`); } else { status = 'REJECTED'; reasons.push(`GPA (${gpa.toFixed(2)}) below ${conditionalGPA} minimum`); setDecision({ status, reasons, nextSteps, gpa, needsDocs: !hasAllDocs }); return; } if ((program === 'MS-IB' || program === 'MS-FM') && gmatScore < 500) { reasons.push('Conditional: GMAT score recommended (≥ 500)'); } break;
      case 'DBA': if (gpa >= 3.0) isAcademicallyQualified = true; else if (gpa >= 2.6) { isAcademicallyQualified = true; reasons.push(`Conditional admission - GPA (${gpa.toFixed(2)}) below 3.0. Must achieve 3.5+ GPA.`); } else { status = 'REJECTED'; reasons.push(`GPA (${gpa.toFixed(2)}) below 2.6 minimum`); setDecision({ status, reasons, nextSteps, gpa, needsDocs: !hasAllDocs }); return; } if (gmatScore < 550) { reasons.push('Conditional: GMAT score recommended (≥ 550)'); } break;
      default: status = 'REJECTED'; reasons.push('Invalid program selected.'); setDecision({ status, reasons, nextSteps, gpa, needsDocs: !hasAllDocs }); return;
    }
    if (isAcademicallyQualified) { const academicConditions = [...reasons]; reasons = []; if (hasAllDocs) { reasons = [...academicConditions]; if (reasons.length === 0) { status = 'APPROVED'; nextSteps.push('Send acceptance letter', 'Begin enrollment process'); } else { status = 'CONDITIONAL'; nextSteps.push('Send conditional acceptance letter'); if (reasons.some(r => r.includes('GMAT'))) nextSteps.push('Request GMAT submission by [Deadline]'); if (reasons.some(r => r.includes('GPA'))) nextSteps.push('Inform student of GPA maintenance requirement', 'Set up academic monitoring'); } } else { status = 'ELIGIBLE_DOCS_MISSING'; const missingDocs = []; if (!studentData.sopReviewed) missingDocs.push('SOP'); if (!studentData.bankStatement) missingDocs.push('Financial Proof'); reasons.push(`Missing required documents: ${missingDocs.join(', ')}`); if (academicConditions.length > 0) reasons.push(...academicConditions.map(r => `Also note: ${r}`)); nextSteps.push('Request missing documents', 'Hold final decision'); } }
    setDecision({ status, reasons, nextSteps, gpa, needsDocs: !hasAllDocs });
  };

  // useEffect hook (No changes)
  useEffect(() => { if (!studentData.hasUSGPA && studentData.originalGrade && studentData.sourceCountry) { const converted = convertToUSGPA(studentData.originalGrade, studentData.sourceCountry); setConvertedGPA(converted); } else { setConvertedGPA(null); } }, [studentData.originalGrade, studentData.sourceCountry, studentData.hasUSGPA, studentData.indiaInputMode]); // Added indiaInputMode

  // --- Render Step Function (UI) ---
  const renderStep = () => {
    switch(currentStep) {
      case 1: const programsList = [ { value: 'BA', label: 'BA - Business Administration', cost: '$75,000' }, { value: 'BS-DI', label: 'BS - Diagnostic Imaging', cost: '$80,000' }, { value: 'MBA', label: 'MBA - Master of Business Administration', cost: '$35,000' }, { value: 'MS-IB', label: 'MS - International Business', cost: '$35,000' }, { value: 'MS-FM', label: 'MS - Finance Management', cost: '$35,000' }, { value: 'DBA', label: 'DBA - Doctor of Business Administration', cost: '$85,000' } ]; return ( <div className="space-y-6 animate-fade-in"> <h2 className="text-xl font-bold text-gray-700">Step 1: Select Program of Interest</h2> <p className="text-sm text-gray-600">Choose the academic program.</p> <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {programsList.map((program) => ( <button key={program.value} onClick={() => setStudentData({...studentData, program: program.value})} className={`p-4 border-2 rounded-lg text-left hover:shadow-md hover:border-blue-400 transition-all duration-200 ${ studentData.program === program.value ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300 ring-offset-1' : 'border-gray-200 bg-white' }`} > <div className="font-semibold text-blue-800">{program.label}</div> <div className="text-sm text-gray-600">Estimated Cost: {program.cost}</div> </button> ))} </div> </div> );
      case 2: const currentSystem = gradingSystems[studentData.sourceCountry] || {}; const currentExample = currentSystem.example || ''; const currentOptions = currentSystem.options; const currentDescription = currentSystem.description || ''; const currentCommonRanges = currentSystem.commonRanges || '';
        // Determine min/max for India based on selected mode
        let indiaMin = 0;
        let indiaMax = 100;
        if (studentData.sourceCountry === 'india') {
          indiaMin = studentData.indiaInputMode === 'cgpa' ? currentSystem.cgpa.min : currentSystem.percentage.min;
          indiaMax = studentData.indiaInputMode === 'cgpa' ? currentSystem.cgpa.max : currentSystem.percentage.max;
        }
        return ( <div className="space-y-6 animate-fade-in"> <h2 className="text-xl font-bold text-gray-700">Step 2: Enter Student's GPA</h2> <div className="space-y-4"> <div className="flex flex-col sm:flex-row gap-4"> <button onClick={() => setStudentData({...studentData, hasUSGPA: true, originalGrade: '', usGPA: '', convertedGPA: null})} className={`flex-1 p-4 border-2 rounded-lg text-center transition-all duration-200 ${ studentData.hasUSGPA ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300' : 'border-gray-200 bg-white hover:bg-gray-50' }`}>Enter US GPA</button> <button onClick={() => setStudentData({...studentData, hasUSGPA: false, usGPA: '', originalGrade: '', convertedGPA: null})} className={`flex-1 p-4 border-2 rounded-lg text-center transition-all duration-200 ${ !studentData.hasUSGPA ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300' : 'border-gray-200 bg-white hover:bg-gray-50' }`}>Convert International Grade</button> </div> {studentData.hasUSGPA ? ( <div className="pt-4"> <label htmlFor="usGPAInput" className="block font-medium mb-2 text-gray-700">Enter US GPA (0.0-4.0)</label> <input id="usGPAInput" type="number" min="0" max="4" step="0.01" value={studentData.usGPA} onChange={(e) => setStudentData({...studentData, usGPA: e.target.value})} onBlur={(e) => { let v=e.target.value; if(v!==''){ let n=parseFloat(v); if(!isNaN(n)){ setStudentData({...studentData, usGPA: Math.max(0, Math.min(4, n)).toString()}); } else { setStudentData({...studentData, usGPA: ''}); } } }} className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none" placeholder="e.g., 3.5" /> {studentData.usGPA !== '' && (isNaN(parseFloat(studentData.usGPA)) || parseFloat(studentData.usGPA) < 0 || parseFloat(studentData.usGPA) > 4) && ( <p className="text-red-600 text-xs mt-1">Invalid GPA (0.0-4.0).</p> )} </div> ) : ( <div className="space-y-4 pt-4 border-t border-gray-200"> <div> <label htmlFor="countrySelect" className="block font-medium mb-2 text-gray-700">Country of Education</label> <select id="countrySelect" value={studentData.sourceCountry} onChange={(e) => { setStudentData({...studentData, sourceCountry: e.target.value, originalGrade: '', convertedGPA: null, indiaInputMode: e.target.value === 'india' ? studentData.indiaInputMode : 'percentage' }); /* Reset SOP criteria if country changes */}} className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none" > {Object.entries(gradingSystems).sort(([, a], [, b]) => a.name.localeCompare(b.name)).map(([key, system]) => ( <option key={key} value={key}>{system.name}</option> ))} </select> <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-600"> <p className="font-medium">{currentDescription}</p> {currentCommonRanges && <p className="mt-1">Common Ranges: {currentCommonRanges}</p>} </div> </div> {/* India Dual Mode Selector */} {studentData.sourceCountry === 'india' && currentSystem.type === 'dual_india' && ( <div className="mt-2"> <label htmlFor="indiaModeSelect" className="block text-sm font-medium text-gray-700 mb-1">India Grade Type:</label> <select id="indiaModeSelect" value={studentData.indiaInputMode} onChange={(e) => setStudentData({...studentData, indiaInputMode: e.target.value, originalGrade: ''})} className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none" > <option value="percentage">Percentage (%)</option> <option value="cgpa">CGPA (0-10)</option> </select> </div> )} <div> <label htmlFor="originalGradeInput" className="block font-medium mb-2 text-gray-700">Original Grade</label> {currentExample && <p className="text-sm text-gray-600 mb-2 italic">{currentExample}</p>} {/* Conditional Input: Dropdown or Number */} {currentSystem.options && (currentSystem.type === 'classification_uk' || currentSystem.type === 'letters_australia' || currentSystem.type === 'scale5_russia' || currentSystem.type === 'scale6_germany') ? ( <select id="originalGradeInput" value={studentData.originalGrade} onChange={(e) => setStudentData({...studentData, originalGrade: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none" > <option value="">-- Select --</option> {currentSystem.options.map((gradeOpt) => ( <option key={gradeOpt} value={gradeOpt}>{gradeOpt}</option> ))} </select> ) : ( <input id="originalGradeInput" type="number" min={studentData.sourceCountry === 'india' ? indiaMin : (currentSystem.min || 0)} max={studentData.sourceCountry === 'india' ? indiaMax : currentSystem.max} step={ (studentData.sourceCountry === 'india' && studentData.indiaInputMode === 'cgpa') || (currentSystem.max && currentSystem.max <= 20) || currentSystem.type === 'scale_philippines' ? "0.01" : "1"} value={studentData.originalGrade} onChange={(e) => setStudentData({...studentData, originalGrade: e.target.value})} onBlur={(e) => { let v=e.target.value; if(v!==''){ let n=parseFloat(v); let maxVal = studentData.sourceCountry === 'india' ? indiaMax : currentSystem.max; let minVal = studentData.sourceCountry === 'india' ? indiaMin : (currentSystem.min || 0) ; if(currentSystem.type === 'scale_philippines') {minVal = 1.0; maxVal = 5.0;} if(!isNaN(n) && maxVal!==undefined){ setStudentData({...studentData, originalGrade: Math.max(minVal, Math.min(maxVal, n)).toString()}); } else if(isNaN(n)){ setStudentData({...studentData, originalGrade: ''}); } } }} className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none" placeholder={ `Enter grade` } /> )} {studentData.originalGrade !== '' && !(currentSystem.options && currentSystem.options.includes(studentData.originalGrade)) && (isNaN(parseFloat(studentData.originalGrade)) || ( (studentData.sourceCountry === 'india' ? indiaMin : (currentSystem.min || 0)) > parseFloat(studentData.originalGrade) || (studentData.sourceCountry === 'india' ? indiaMax : currentSystem.max) < parseFloat(studentData.originalGrade) ) && !(currentSystem.type === 'scale_philippines' && parseFloat(studentData.originalGrade) >= 1 && parseFloat(studentData.originalGrade) <=5) ) && ( <p className="text-red-600 text-xs mt-1">Invalid grade.</p> )} </div> {convertedGPA !== null && !isNaN(convertedGPA) && ( <div className="p-4 bg-green-50 border border-green-200 rounded-lg mt-4 animate-fade-in"> <div className="text-lg font-bold text-green-800"> Estimated US GPA: {convertedGPA.toFixed(2)} </div> <p className="text-sm text-green-700">Estimate only. Official evaluation may differ.</p> </div> )} {!studentData.hasUSGPA && studentData.originalGrade && (convertedGPA === null || isNaN(convertedGPA)) && ( <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mt-4"> <p className="text-sm text-yellow-700">Cannot calculate GPA. Check grade input.</p> </div> )} </div> )} </div> </div> );
      case 3: const programCosts = { 'BA': '$75,000', 'BS-DI': '$80,000', 'MBA': '$35,000', 'MS-IB': '$35,000', 'MS-FM': '$35,000', 'DBA': '$85,000' }; const currentProgramCost = programCosts[studentData.program] || 'N/A'; const isMSProgram = studentData.program === 'MS-IB' || studentData.program === 'MS-FM'; const groupedSopCriteria = sopAssessmentCriteria.reduce((acc, item) => { (acc[item.category] = acc[item.category] || []).push(item); return acc; }, {}); return ( <div className="space-y-6 animate-fade-in"> <h2 className="text-xl font-bold text-gray-700">Step 3: Requirements & Documents</h2> {(isMSProgram || studentData.program === 'DBA' || studentData.program === 'BS-DI') && ( <div className="border-t border-gray-200 pt-6 space-y-4"> <h3 className="text-lg font-semibold text-gray-700 mb-2">Test Scores & Interview</h3> {(isMSProgram || studentData.program === 'DBA') && ( <div> <label htmlFor="gmatGreInput" className="block font-medium mb-1 text-gray-700"> GMAT/GRE {isMSProgram ? '(Optional, ≥ 500 Recommended)' : '(Optional, ≥ 550 Recommended)'} </label> <input id="gmatGreInput" type="number" value={studentData.gmatGre} onChange={(e) => setStudentData({...studentData, gmatGre: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none" placeholder={`Score (e.g., ${isMSProgram ? '600' : '650'})`} /> <p className="text-xs text-gray-500 mt-1">Leave blank/0 if none.</p> </div> )} {studentData.program === 'BS-DI' && ( <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> <div> <label htmlFor="sleScoreInput" className="block font-medium mb-1 text-gray-700">SLE Score (Required: ≥ 21)</label> <input id="sleScoreInput" type="number" value={studentData.sleScore} onChange={(e) => setStudentData({...studentData, sleScore: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none" placeholder="SLE score" /> </div> <div> <label htmlFor="interviewStatus" className="block font-medium mb-1 text-gray-700">Interview (Required)</label> <select id="interviewStatus" value={studentData.interview} onChange={(e) => setStudentData({...studentData, interview: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none" > <option value="">-- Select Status --</option> <option value="pass">Passed</option> <option value="fail">Failed</option> <option value="pending">Pending</option> </select> </div> </div> )} </div> )} <div className="border-t border-gray-200 pt-6"> <h3 className="text-lg font-semibold text-gray-700 mb-4">Document Review (Required)</h3> <div className="space-y-4"> <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm"> <div className="flex items-center justify-between"> <div className="flex items-start gap-3"> <input type="checkbox" id="sopReviewed" checked={studentData.sopReviewed || false} onChange={(e) => setStudentData({...studentData, sopReviewed: e.target.checked})} className="w-5 h-5 text-blue-600 rounded mt-1 focus:ring-blue-500" /> <label htmlFor="sopReviewed" className="flex-1 cursor-pointer"> <div className="font-medium text-gray-800">Statement of Purpose (SOP) Reviewed</div> <div className="text-sm text-gray-600">Confirm the SOP meets requirements and quality standards.</div> </label> {studentData.sopReviewed && <CheckCircle className="text-green-600 flex-shrink-0 ml-2" size={20} />} </div> <button onClick={() => setShowSopAssessor(!showSopAssessor)} className="p-2 rounded-md hover:bg-gray-100 text-blue-600" title={showSopAssessor ? "Hide Assessor" : "Show SOP Assessor"}> {showSopAssessor ? <ChevronUp size={20} /> : <ChevronDown size={20} />} </button> </div> {showSopAssessor && ( <div className="mt-4 pt-4 border-t border-gray-200 space-y-3 animate-fade-in"> <h4 className="text-md font-semibold text-gray-700 flex items-center gap-2"><FileText size={18}/>SOP Quick Assessment Checklist</h4> {Object.entries(groupedSopCriteria).map(([category, items]) => ( <div key={category} className="mb-3"> <h5 className="text-sm font-semibold text-blue-700 mb-1">{category}</h5> {items.map(item => ( <label key={item.id} htmlFor={item.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded text-sm cursor-pointer"> <input type="checkbox" id={item.id} checked={item.checked} onChange={() => handleSopCriteriaChange(item.id)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" /> <span>{item.text}</span> </label> ))} </div> ))} <div className={`mt-3 p-2 rounded-md text-sm font-medium ${ sopCriteriaMetCount / sopCriteriaTotalCount >= 0.7 ? 'bg-green-100 text-green-700' : sopCriteriaMetCount / sopCriteriaTotalCount >= 0.4 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700' }`}> Checklist Summary: {sopCriteriaMetCount} of {sopCriteriaTotalCount} criteria met. </div> <p className="text-xs text-gray-500 mt-2">This checklist is an aid. Final SOP review status is determined by the admissions officer.</p> </div> )} <div className="mt-4 pt-4 border-t border-gray-200"> <h4 className="text-md font-semibold text-gray-700 mb-2 flex items-center gap-2"><Sparkles size={18} className="text-purple-600"/>AI-Assisted SOP Analysis (Conceptual)</h4> <textarea id="sopText" rows="6" value={studentData.sopText} onChange={(e) => setStudentData({...studentData, sopText: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none" placeholder="Paste SOP text here for AI analysis (max 5000 characters)..." maxLength="5000" /> <button onClick={handleAnalyzeSopWithAI} disabled={isAnalyzingSop || !studentData.sopText.trim()} className="mt-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" > {isAnalyzingSop ? (<><Clock size={16} className="animate-spin"/>Analyzing...</>) : (<>Get AI Analysis <MessageSquare size={16}/></>)} </button> {aiSopAnalysis && ( <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg animate-fade-in space-y-3"> {aiSopAnalysis.error ? ( <p className="text-red-600 font-medium">{aiSopAnalysis.error}</p> ) : ( <> <h5 className="text-sm font-semibold text-purple-700">AI Analysis Results:</h5> <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs"> <p><strong>Clarity of Goals:</strong> {aiSopAnalysis.clarity_goals}</p> <p><strong>Relevance/Preparation:</strong> {aiSopAnalysis.relevance_preparation}</p> <p><strong>Motivation/Fit:</strong> {aiSopAnalysis.motivation_fit}</p> <p><strong>Structure/Writing:</strong> {aiSopAnalysis.structure_writing}</p> <p><strong>Uniqueness/Authenticity:</strong> {aiSopAnalysis.uniqueness_authenticity}</p> <p><strong>Overall Impression:</strong> <span className="font-bold">{aiSopAnalysis.overall_impression}</span></p> </div> <div><p className="font-semibold text-xs mt-2">Strengths:</p><ul className="list-disc list-inside pl-4 text-xs"> {aiSopAnalysis.strengths?.map((s, i) => <li key={`s-${i}`}>{s}</li>)}</ul></div> <div><p className="font-semibold text-xs mt-2">Areas for Improvement:</p><ul className="list-disc list-inside pl-4 text-xs"> {aiSopAnalysis.areas_for_improvement?.map((a, i) => <li key={`a-${i}`}>{a}</li>)}</ul></div> <div><p className="font-semibold text-xs mt-2">Recommendations:</p><ul className="list-disc list-inside pl-4 text-xs"> {aiSopAnalysis.recommendations?.map((r, i) => <li key={`r-${i}`}>{r}</li>)}</ul></div> </> )} <p className="text-xs text-gray-500 mt-3">Note: This is a simulated AI analysis. In a real application, this would involve a backend API call to an LLM.</p> </div> )} </div> </div> <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow mt-4"> <input type="checkbox" id="bankStatement" checked={studentData.bankStatement || false} onChange={(e) => setStudentData({...studentData, bankStatement: e.target.checked})} className="w-5 h-5 text-blue-600 rounded mt-1 focus:ring-blue-500" /> <label htmlFor="bankStatement" className="flex-1 cursor-pointer"> <div className="font-medium text-gray-800">Financial Documentation Verified</div> <div className="text-sm text-gray-600"> Confirmed funds for: <span className="font-semibold"> {currentProgramCost}</span> ({studentData.program}). </div> </label> {studentData.bankStatement && <CheckCircle className="text-green-600 flex-shrink-0" size={20} />} </div> </div> </div> <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg mt-6"> <h4 className="font-semibold mb-2 flex items-center gap-2 text-gray-800"> <span>Document Status</span> {(!studentData.sopReviewed || !studentData.bankStatement) && <AlertCircle className="text-yellow-600 animate-pulse" size={20} />} </h4> <div className="grid grid-cols-2 gap-4 text-sm"> <div className={`flex items-center gap-1 font-medium ${studentData.sopReviewed ? 'text-green-600' : 'text-red-600'}`}> {studentData.sopReviewed ? <CheckCircle size={16}/> : <XCircle size={16}/>} SOP </div> <div className={`flex items-center gap-1 font-medium ${studentData.bankStatement ? 'text-green-600' : 'text-red-600'}`}> {studentData.bankStatement ? <CheckCircle size={16}/> : <XCircle size={16}/>} Financial Docs </div> </div> {(!studentData.sopReviewed || !studentData.bankStatement) && <p className="text-xs text-yellow-700 mt-2">Review all required documents.</p>} </div> </div> );
      case 4: const programDisplayNames = { 'BA': 'BA - Business Administration', 'BS-DI': 'BS - Diagnostic Imaging', 'MBA': 'MBA - Master of Business Administration', 'MS-IB': 'MS - International Business', 'MS-FM': 'MS - Finance Management', 'DBA': 'DBA - Doctor of Business Administration' }; const displayProgramName = programDisplayNames[studentData.program] || studentData.program; return ( <div className="space-y-6 animate-fade-in"> <h2 className="text-xl font-bold text-gray-700">Step 4: Admission Decision</h2> {decision ? ( <div className={`p-6 border-2 rounded-lg shadow-md ${ decision.status === 'APPROVED' ? 'border-green-400 bg-green-50' : decision.status === 'CONDITIONAL' ? 'border-yellow-400 bg-yellow-50' : decision.status === 'ELIGIBLE_DOCS_MISSING' ? 'border-orange-400 bg-orange-50' : decision.status === 'SPECIAL_REVIEW' ? 'border-blue-400 bg-blue-50' : 'border-red-400 bg-red-50'}`}> <div className="flex items-center gap-3 mb-4 pb-4 border-b"> {decision.status === 'APPROVED' && <CheckCircle className="text-green-600" size={32} />} {decision.status === 'CONDITIONAL' && <AlertCircle className="text-yellow-600" size={32} />} {(decision.status === 'ELIGIBLE_DOCS_MISSING' || decision.status === 'SPECIAL_REVIEW') && <Clock className="text-orange-600" size={32} />} {decision.status === 'REJECTED' && <XCircle className="text-red-600" size={32} />} <span className={`text-2xl font-bold ${ decision.status === 'APPROVED' ? 'text-green-700' : decision.status === 'CONDITIONAL' ? 'text-yellow-700' : decision.status === 'ELIGIBLE_DOCS_MISSING' ? 'text-orange-700' : decision.status === 'SPECIAL_REVIEW' ? 'text-blue-700' : 'text-red-700'}`}> {decision.status === 'APPROVED' ? 'Approved' : decision.status === 'CONDITIONAL' ? 'Conditional Admission' : decision.status === 'ELIGIBLE_DOCS_MISSING' ? 'Eligible - Pending Docs' : decision.status === 'SPECIAL_REVIEW' ? 'Special Review Needed' : 'Rejected'} </span> </div> <div className="space-y-3 text-sm"> {decision.gpa !== null && !isNaN(decision.gpa) ? ( <div><span className="font-semibold text-gray-700">GPA:</span> <span className="text-gray-800">{decision.gpa.toFixed(2)}</span></div> ) : ( <div><span className="font-semibold text-gray-700">GPA:</span> <span className="text-red-600 italic">Invalid Input</span></div> )} <div><span className="font-semibold text-gray-700">Program:</span> <span className="text-gray-800">{displayProgramName}</span></div> <div className="flex gap-4 pt-2"> <div className={`flex items-center gap-1 font-medium ${studentData.sopReviewed ? 'text-green-600' : 'text-red-600'}`}> {studentData.sopReviewed ? <CheckCircle size={16}/> : <XCircle size={16}/>} SOP </div> <div className={`flex items-center gap-1 font-medium ${studentData.bankStatement ? 'text-green-600' : 'text-red-600'}`}> {studentData.bankStatement ? <CheckCircle size={16}/> : <XCircle size={16}/>} Financial Docs </div> </div> {decision.reasons && decision.reasons.length > 0 && ( <div className="pt-2"> <div className="font-semibold text-gray-700 mb-1">Reasons/Conditions:</div> <ul className="list-disc list-inside space-y-1 pl-2"> {decision.reasons.map((reason, index) => ( <li key={index} className="text-gray-800">{reason}</li> ))} </ul> </div> )} {decision.nextSteps && decision.nextSteps.length > 0 && ( <div className="pt-2"> <div className="font-semibold text-gray-700 mb-1">Next Steps:</div> <ol className="list-decimal list-inside space-y-1 pl-2"> {decision.nextSteps.map((step, index) => ( <li key={index} className="text-gray-800">{step}</li> ))} </ol> </div> )} {decision.status === 'ELIGIBLE_DOCS_MISSING' && ( <div className="p-3 mt-4 bg-orange-100 border border-orange-300 rounded-lg"> <p className="text-orange-800 text-xs font-medium"> <AlertCircle size={14} className="inline mr-1 mb-0.5"/> Meets academic criteria; final decision pending document review. </p> </div> )} {decision.status === 'SPECIAL_REVIEW' && ( <div className="p-3 mt-4 bg-blue-100 border border-blue-300 rounded-lg"> <p className="text-blue-800 text-xs font-medium"> <Clock size={14} className="inline mr-1 mb-0.5"/> Requires further review/approval. </p> </div> )} </div> </div> ) : ( <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center"> <p className="text-gray-500 italic">Decision appears here after Step 3.</p> </div> )} <div className="flex justify-center pt-4"> <button onClick={() => { setCurrentStep(1); setStudentData({ program: '', hasUSGPA: false, sourceCountry: 'india', originalGrade: '', usGPA: '', gmatGre: '', sleScore: '', interview: '', finances: '', sopReviewed: false, bankStatement: false, sopText: '' }); setDecision(null); setConvertedGPA(null); setSopAssessmentCriteria(initialSopCriteria); setShowSopAssessor(false); setAiSopAnalysis(null);}} className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition-colors duration-200" > Start New Review </button> </div> </div> );
      default: return null;
    }
  };

  // --- Navigation Handlers (No changes) ---
  const handleNext = () => { if (currentStep < 4) { if (currentStep === 3) { makeDecision(); } setCurrentStep(currentStep + 1); } };
  const handleBack = () => { if (currentStep > 1) { setCurrentStep(currentStep - 1); if (currentStep === 4) { setDecision(null); } } };

  // --- Validation for 'Next' Button (No changes) ---
  const canProceed = () => { switch(currentStep) { case 1: return !!studentData.program; case 2: if (studentData.hasUSGPA) { const v = parseFloat(studentData.usGPA); return studentData.usGPA !== '' && !isNaN(v) && v >= 0 && v <= 4; } else { const sys = gradingSystems[studentData.sourceCountry] || {}; const gradeOK = studentData.originalGrade !== ''; const convOK = convertedGPA !== null && !isNaN(convertedGPA); if (sys.options && (sys.type === 'classification_uk' || sys.type === 'letters_australia' || sys.type === 'scale5_russia' || sys.type === 'scale6_germany')) { return gradeOK && sys.options.includes(studentData.originalGrade); } else { const origV = parseFloat(studentData.originalGrade); const numOK = !isNaN(origV); let minVal = sys.min || 0; let maxVal = sys.max; if(sys.type === 'dual_india'){ minVal = studentData.indiaInputMode === 'cgpa' ? sys.cgpa.min : sys.percentage.min; maxVal = studentData.indiaInputMode === 'cgpa' ? sys.cgpa.max : sys.percentage.max; } const rangeOK = maxVal !== undefined ? (origV >= minVal && origV <= maxVal) : true; return gradeOK && numOK && rangeOK && convOK; } } case 3: return true; default: return false; } };

  // --- Component Return (No changes) ---
  return ( <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen font-sans"> <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-blue-900"> Lincoln University Admission Workflow Tool </h1> {/* Progress */} <div className="mb-6 sm:mb-8 px-2"> <div className="flex items-center justify-between max-w-xl mx-auto"> {[ {num: 1, label: 'Program'}, {num: 2, label: 'GPA'}, {num: 3, label: 'Docs'}, {num: 4, label: 'Decision'} ].map((step, index, arr) => ( <React.Fragment key={step.num}> <div className="flex flex-col items-center text-center"> <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-bold border-2 transition-all duration-300 ${ currentStep >= step.num ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-gray-500 border-gray-300' }`}> {currentStep > step.num ? <CheckCircle size={16}/> : step.num} </div> <span className={`mt-1 text-xs sm:text-sm ${currentStep >= step.num ? 'text-blue-700 font-semibold' : 'text-gray-500'}`}> {step.label} </span> </div> {index < arr.length - 1 && ( <div className={`flex-1 h-1 mx-2 rounded ${currentStep > step.num ? 'bg-blue-500' : 'bg-gray-300'}`}></div> )} </React.Fragment> ))} </div> </div> {/* Content */} <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-6 border border-gray-200"> {renderStep()} </div> {/* Navigation */} {currentStep < 4 && ( <div className="flex justify-between items-center mt-6 sm:mt-8"> <button onClick={handleBack} disabled={currentStep === 1} className="px-5 py-2 sm:px-6 sm:py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed" > ← Back </button> <button onClick={handleNext} disabled={!canProceed()} className="px-5 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" > {currentStep === 3 ? 'Calculate Decision' : 'Next'} <ArrowRight size={18} /> </button> </div> )} </div> );
};

export default ApprovalWorkflow;

// Inject styles only once
if (!document.getElementById('admission-workflow-styles')) { const styleSheet = document.createElement("style"); styleSheet.id = 'admission-workflow-styles'; styleSheet.type = "text/css"; styleSheet.innerText = ` @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; } `; document.head.appendChild(styleSheet); }


