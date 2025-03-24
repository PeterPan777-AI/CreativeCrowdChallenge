// AI-powered recommendation engine functions

// Generate personalized AI recommendations based on user ID and interests
function generateAIRecommendations(userId, interests, allCompetitions) {
  // This is a simplified simulation of AI-based recommendations
  // In a real app, this would use a trained machine learning model
  
  // Scored competitions for this user
  const scoredCompetitions = allCompetitions.map(competition => {
    let score = Math.random() * 0.5; // Base randomness
    
    // If there are interests, boost score for matching categories
    if (interests && interests.length > 0) {
      if (interests.includes(competition.category)) {
        score += 0.3;
      }
    }
    
    // User-specific scoring based on user ID (simulated pattern)
    if (userId.includes('design')) {
      if (competition.category === 'design') {
        score += 0.2;
      }
    } else if (userId.includes('marketing')) {
      if (competition.category === 'marketing') {
        score += 0.2;
      }
    }
    
    // Business-specific boosts (simulated partnerships or promotions)
    if (userId.includes('business')) {
      if (competition.business_id === 'mock-business-1') {
        score += 0.1;
      }
    }
    
    return {
      ...competition,
      score: Math.min(score, 1.0), // Cap at 1.0
      ai_explanation: generateRecommendationExplanation(competition, interests, userId)
    };
  });
  
  // Sort by score (highest first) and return top results
  return scoredCompetitions
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

// Generate human-readable explanations for recommendations
function generateRecommendationExplanation(competition, interests, userId) {
  // Generate a human-readable explanation for why this was recommended
  let reasons = [];
  
  // Category match explanation
  if (interests && interests.includes(competition.category)) {
    reasons.push(`Matches your interest in ${competition.category}`);
  }
  
  // Time-based explanations
  const deadline = new Date(competition.deadline);
  const now = new Date();
  const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  
  if (daysLeft <= 7) {
    reasons.push(`Ending soon (${daysLeft} days left)`);
  } else if (daysLeft <= 14) {
    reasons.push(`Limited time remaining (${daysLeft} days left)`);
  }
  
  // Prize-based explanation
  if (competition.prize.replace('$', '').replace(',', '') >= 500) {
    reasons.push(`High potential reward (${competition.prize})`);
  }
  
  // Personalized explanation based on user ID (simulated)
  if (userId.includes(competition.category)) {
    reasons.push(`Aligns with your expertise in ${competition.category}`);
  }
  
  // If we couldn't generate specific reasons, add a generic one
  if (reasons.length === 0) {
    reasons.push('Popular in your region');
  }
  
  // Format with bullet points for the top 2 reasons
  return reasons.slice(0, 2).map(reason => `• ${reason}`).join('\n');
}

// Generate special preview recommendations with detailed explanations
function generatePreviewRecommendations(interests) {
  // Special demo recommendations with more detailed explanations
  const categories = ['design', 'writing', 'marketing', 'photography', 'music'];
  const previewCompetitions = [];
  
  // If user provided interests, prioritize those categories
  const priorityCategories = interests.length > 0 ? interests : categories.slice(0, 3);
  
  // Generate personalized preview competitions
  priorityCategories.forEach((category, index) => {
    previewCompetitions.push({
      id: `preview-${category}-${index}`,
      title: getCategoryCompetitionTitle(category),
      description: getCategoryCompetitionDescription(category),
      prize: '$' + (500 + (index * 250)),
      deadline: getRandomFutureDate(14, 45),
      category: category,
      business_id: `preview-business-${index + 1}`,
      created_at: getRandomPastDate(10, 30),
      status: 'active',
      score: 0.8 + (0.1 * Math.random()),
      ai_explanation: `• Perfectly aligned with your ${category} interests\n• Customized opportunity based on your profile`
    });
  });
  
  return previewCompetitions;
}

// Helper function: Get a competition title based on category
function getCategoryCompetitionTitle(category) {
  const titles = {
    'design': ['Logo Redesign Challenge', 'Product Packaging Design', 'UI/UX Redesign Contest'],
    'writing': ['Short Story Competition', 'Marketing Copy Challenge', 'Technical Writing Contest'],
    'marketing': ['Social Media Campaign Challenge', 'Brand Strategy Contest', 'Marketing Video Concept'],
    'photography': ['Nature Photography Contest', 'Portrait Photography Challenge', 'Urban Landscape Competition'],
    'music': ['Original Song Contest', 'Music Production Challenge', 'Jingle Creation Competition']
  };
  
  const categoryTitles = titles[category] || titles['design'];
  return categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
}

// Helper function: Get a competition description based on category
function getCategoryCompetitionDescription(category) {
  const descriptions = {
    'design': 'Create an innovative design that captivates audiences and solves real problems',
    'writing': 'Craft compelling content that engages readers and conveys powerful messages',
    'marketing': 'Develop a strategic campaign that drives engagement and brand awareness',
    'photography': 'Capture stunning imagery that tells a story and evokes emotion',
    'music': 'Compose original music that resonates with listeners and enhances experiences'
  };
  
  return descriptions[category] || 'Showcase your creativity and talents in this exciting competition';
}

// Helper function: Generate a random future date
function getRandomFutureDate(minDays, maxDays) {
  const now = new Date();
  const daysToAdd = minDays + Math.floor(Math.random() * (maxDays - minDays));
  const futureDate = new Date(now.setDate(now.getDate() + daysToAdd));
  return futureDate.toISOString().split('T')[0];
}

// Helper function: Generate a random past date
function getRandomPastDate(minDays, maxDays) {
  const now = new Date();
  const daysToSubtract = minDays + Math.floor(Math.random() * (maxDays - minDays));
  const pastDate = new Date(now.setDate(now.getDate() - daysToSubtract));
  return pastDate.toISOString().split('T')[0];
}

// Export functions to be used in server.js
module.exports = {
  generateAIRecommendations,
  generatePreviewRecommendations
};