// LLM Service for generating XAI explanations and recommendations
// This service uses Google Gemini API
// Temporarily disabled to use rule-based fallback due to API issues

const GEMINI_API_KEY = ''; // Set to empty to use rule-based fallback
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export async function generateExplanationAndRecommendations(riskAnalysis, student) {
  if (!GEMINI_API_KEY) {
    // Fallback to rule-based explanations if no API key
    return generateRuleBasedExplanation(riskAnalysis, student);
  }

  try {
    const prompt = buildPrompt(riskAnalysis, student);

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are an academic advisor AI assistant. Provide clear, actionable, and empathetic explanations and recommendations for students at risk. Focus on decision support, not absolute solutions. Keep responses concise and practical.\n\n${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;

    return parseLLMResponse(content);
  } catch (error) {
    console.error('LLM service error:', error);
    // Fallback to rule-based explanations
    return generateRuleBasedExplanation(riskAnalysis, student);
  }
}

function buildPrompt(riskAnalysis, student) {
  const { financial, personal, academic, overallResult, riskPercentage } = riskAnalysis;
  
  let prompt = `Student Risk Analysis for ${student.student_name || student.full_name || student.name || student.student_id}:\n\n`;
  prompt += `Overall Status: ${overallResult} (${riskPercentage.toFixed(0)}% risk)\n\n`;
  
  prompt += `FINANCIAL RISK:\n`;
  prompt += financial.isAtRisk 
    ? `- Family income: ₱${financial.factors.familyIncome.toLocaleString()} (below ₱20,000 threshold)\n`
    : `- Family income: ₱${financial.factors.familyIncome.toLocaleString()} (adequate)\n`;
  prompt += `- Scholarship: ${financial.factors.hasScholarship ? 'Yes' : 'No'}\n\n`;
  
  prompt += `PERSONAL RISK (Survey responses 1-5 scale):\n`;
  prompt += `- Scale: 1 = strongly agree (good), 5 = strongly disagree (bad)\n`;
  prompt += `- Overall average: ${personal.overallAvg.toFixed(1)}/5\n`;
  if (personal.weaknesses.length > 0) {
    prompt += `Weak areas (3.0 and above - disagree):\n`;
    personal.weaknesses.forEach(w => {
      prompt += `  - ${w.name}: ${w.avg.toFixed(1)}/5\n`;
    });
  }
  if (personal.strengths.length > 0) {
    prompt += `Strong areas (below 3.0 - agree):\n`;
    personal.strengths.forEach(s => {
      prompt += `  - ${s.name}: ${s.avg.toFixed(1)}/5\n`;
    });
  }
  prompt += `\n`;
  
  prompt += `ACADEMIC RISK:\n`;
  prompt += `- Average GPA: ${academic.factors.avgGpa?.toFixed(2) || 'N/A'} (threshold: 2.5)\n`;
  prompt += `- Failing subjects: ${academic.factors.failingSubjects}/${academic.factors.totalSubjects}\n\n`;
  
  prompt += `Please provide:\n`;
  prompt += `1. A clear explanation of why this student is at risk (or areas of concern if good standing)\n`;
  prompt += `2. 3-5 specific, actionable recommendations to address the identified issues\n`;
  prompt += `3. Keep recommendations practical and focused on decision support\n\n`;
  
  return prompt;
}

function parseLLMResponse(content) {
  // Simple parsing - in production, you might want more sophisticated parsing
  const lines = content.split('\n').filter(line => line.trim());
  
  let explanation = '';
  let recommendations = [];
  let currentSection = 'explanation';
  
  lines.forEach(line => {
    if (line.toLowerCase().includes('recommendation') || line.toLowerCase().includes('suggestion')) {
      currentSection = 'recommendations';
    } else if (line.match(/^\d+\./) || line.startsWith('-')) {
      if (currentSection === 'recommendations') {
        recommendations.push(line.replace(/^\d+\.?\s*/, '').replace(/^-\s*/, '').trim());
      } else {
        explanation += line + ' ';
      }
    } else {
      if (currentSection === 'explanation') {
        explanation += line + ' ';
      }
    }
  });
  
  return {
    explanation: explanation.trim(),
    recommendations: recommendations.length > 0 ? recommendations : [
      'Meet with academic advisor to discuss concerns',
      'Utilize campus resources (tutoring, counseling, financial aid)',
      'Develop a structured study schedule',
      'Connect with peer support groups',
      'Set achievable short-term academic goals'
    ]
  };
}

function generateRuleBasedExplanation(riskAnalysis, student) {
  const { financial, personal, academic, overallResult } = riskAnalysis;
  
  let explanation = `${student.student_name || student.full_name || student.name || student.student_id} is classified as ${overallResult}. `;
  
  const riskFactors = [];
  
  if (financial.isAtRisk) {
    riskFactors.push('financial constraints (income below ₱20,000)');
  }
  
  if (personal.isAtRisk) {
    riskFactors.push('personal challenges in multiple survey areas');
  } else if (personal.weaknesses.length > 0) {
    riskFactors.push(`areas for improvement: ${personal.weaknesses.map(w => w.name).join(', ')}`);
  }
  
  if (academic.isAtRisk) {
    riskFactors.push('academic performance below threshold');
  }
  
  if (riskFactors.length > 0) {
    explanation += `Key risk factors include: ${riskFactors.join(', ')}.`;
  } else {
    explanation += 'Student shows good standing across all categories.';
  }
  
  const recommendations = [];
  
  if (financial.isAtRisk) {
    recommendations.push('Apply for financial aid or scholarship programs');
    recommendations.push('Explore part-time work opportunities on campus');
    recommendations.push('Connect with financial aid office for assistance');
  }
  
  if (personal.isAtRisk || personal.weaknesses.length > 0) {
    recommendations.push('Schedule meeting with academic advisor');
    recommendations.push('Join peer study groups for support');
    recommendations.push('Utilize campus counseling services if needed');
  }
  
  if (academic.isAtRisk) {
    recommendations.push('Enroll in tutoring services for challenging subjects');
    recommendations.push('Develop a consistent study schedule');
    recommendations.push('Meet with instructors during office hours');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Maintain current academic performance');
    recommendations.push('Consider joining honor societies or academic programs');
    recommendations.push('Explore leadership opportunities in student organizations');
  }
  
  return {
    explanation,
    recommendations: recommendations.slice(0, 5)
  };
}
