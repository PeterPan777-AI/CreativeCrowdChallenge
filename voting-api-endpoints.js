/**
 * Voting API Endpoints
 * This file contains all the API endpoints related to voting, ratings, and leaderboards.
 */

// Mock database for testing purposes
const mockDatabase = {
  categories: [
    { id: 'cat-1', name: 'Graphic Design' },
    { id: 'cat-2', name: 'Web Development' },
    { id: 'cat-3', name: 'Mobile App Design' },
    { id: 'cat-4', name: 'Logo Design' },
    { id: 'cat-5', name: 'UI/UX Design' }
  ],
  
  competitions: [
    {
      id: 'mock-comp-1',
      title: 'Modern Logo Design Challenge',
      description: 'Create a modern logo for a tech startup focused on AI solutions.',
      category_id: 'cat-4',
      start_date: '2025-03-10T00:00:00.000Z',
      end_date: '2025-04-15T00:00:00.000Z',
      prize: '$500',
      created_by: 'business-user-1',
      is_business: true,
      status: 'active'
    },
    {
      id: 'mock-comp-2',
      title: 'Mobile App UI Design',
      description: 'Design a clean and intuitive UI for a fitness tracking mobile application.',
      category_id: 'cat-3',
      start_date: '2025-03-05T00:00:00.000Z',
      end_date: '2025-04-05T00:00:00.000Z',
      prize: 'Recognition Award',
      created_by: 'user-2',
      is_business: false,
      status: 'active'
    }
  ],
  
  submissions: [
    {
      id: 'sub-1',
      competition_id: 'mock-comp-1',
      user_id: 'user-1',
      title: 'Minimalist AI Logo',
      description: 'A clean, minimalist logo representing artificial intelligence with neural network elements.',
      image_url: 'https://via.placeholder.com/800x600?text=Minimalist+AI+Logo',
      submission_date: '2025-03-15T10:30:00.000Z'
    },
    {
      id: 'sub-2',
      competition_id: 'mock-comp-1',
      user_id: 'user-2',
      title: 'Futuristic Tech Logo',
      description: 'A bold, futuristic logo design with tech elements and modern typography.',
      image_url: 'https://via.placeholder.com/800x600?text=Futuristic+Tech+Logo',
      submission_date: '2025-03-16T14:20:00.000Z'
    },
    {
      id: 'sub-3',
      competition_id: 'mock-comp-1',
      user_id: 'user-3',
      title: 'Colorful Tech Identity',
      description: 'Vibrant colors representing diverse technology. This logo design combines modern aesthetics with a playful color palette.',
      image_url: 'https://via.placeholder.com/800x600?text=Colorful+Tech+Identity',
      submission_date: '2025-03-17T09:45:00.000Z'
    },
    {
      id: 'sub-4',
      competition_id: 'mock-comp-2',
      user_id: 'user-1',
      title: 'Fitness App UI Kit',
      description: 'A complete UI kit for fitness applications with clean components and intuitive navigation.',
      image_url: 'https://via.placeholder.com/800x600?text=Fitness+App+UI+Kit',
      submission_date: '2025-03-10T16:30:00.000Z'
    },
    {
      id: 'sub-5',
      competition_id: 'mock-comp-2',
      user_id: 'user-4',
      title: 'Workout Tracker Interface',
      description: 'An interface design for workout tracking with progress visualization and goal setting features.',
      image_url: 'https://via.placeholder.com/800x600?text=Workout+Tracker+Interface',
      submission_date: '2025-03-12T11:15:00.000Z'
    }
  ],
  
  // Database of votes with user_id, submission_id, and rating (0-10)
  votes: [
    {
      id: 'vote-1',
      user_id: 'user-3',
      submission_id: 'sub-1',
      rating: 9,
      vote_date: '2025-03-18T08:20:00.000Z'
    },
    {
      id: 'vote-2',
      user_id: 'user-4',
      submission_id: 'sub-1',
      rating: 8,
      vote_date: '2025-03-18T10:15:00.000Z'
    },
    {
      id: 'vote-3',
      user_id: 'user-2',
      submission_id: 'sub-3',
      rating: 10,
      vote_date: '2025-03-19T14:30:00.000Z'
    },
    {
      id: 'vote-4',
      user_id: 'user-1',
      submission_id: 'sub-5',
      rating: 7,
      vote_date: '2025-03-15T09:40:00.000Z'
    }
  ],
  
  // Pre-computed leaderboards
  leaderboards: {
    'mock-comp-1': {
      competition_id: 'mock-comp-1',
      entries: [
        {
          submission_id: 'sub-3',
          user_id: 'user-3',
          username: 'artisanCreator',
          title: 'Colorful Tech Identity',
          average_rating: 10.0,
          vote_count: 1,
          rank: 1
        },
        {
          submission_id: 'sub-1',
          user_id: 'user-1',
          username: 'designMaster',
          title: 'Minimalist AI Logo',
          average_rating: 8.5,
          vote_count: 2,
          rank: 2
        },
        {
          submission_id: 'sub-2',
          user_id: 'user-2',
          username: 'techCreative',
          title: 'Futuristic Tech Logo',
          average_rating: 0,
          vote_count: 0,
          rank: 3
        }
      ]
    },
    'mock-comp-2': {
      competition_id: 'mock-comp-2',
      entries: [
        {
          submission_id: 'sub-5',
          user_id: 'user-4',
          username: 'mobileDesigner',
          title: 'Workout Tracker Interface',
          average_rating: 7.0,
          vote_count: 1,
          rank: 1
        },
        {
          submission_id: 'sub-4',
          user_id: 'user-1',
          username: 'designMaster',
          title: 'Fitness App UI Kit',
          average_rating: 0,
          vote_count: 0,
          rank: 2
        }
      ]
    }
  },
  
  users: {
    'user-1': {
      id: 'user-1',
      username: 'designMaster',
      email: 'designer1@example.com'
    },
    'user-2': {
      id: 'user-2',
      username: 'techCreative',
      email: 'designer2@example.com'
    },
    'user-3': {
      id: 'user-3',
      username: 'artisanCreator',
      email: 'designer3@example.com'
    },
    'user-4': {
      id: 'user-4',
      username: 'mobileDesigner',
      email: 'designer4@example.com'
    }
  }
};

/**
 * API Endpoints for Voting System
 */
function registerVotingApiRoutes(app) {
  // Get all categories
  app.get('/api/categories', (req, res) => {
    res.json(mockDatabase.categories);
  });
  
  // Get leaderboard for a specific competition
  app.get('/api/leaderboards/:competitionId', (req, res) => {
    const { competitionId } = req.params;
    const leaderboard = mockDatabase.leaderboards[competitionId];
    
    if (!leaderboard) {
      return res.status(404).json({ error: 'Leaderboard not found' });
    }
    
    res.json(leaderboard);
  });
  
  // Get leaderboard for a specific category
  app.get('/api/leaderboards/category/:categoryId', (req, res) => {
    const { categoryId } = req.params;
    
    // Find competitions in this category
    const competitionsInCategory = mockDatabase.competitions.filter(
      comp => comp.category_id === categoryId
    );
    
    if (competitionsInCategory.length === 0) {
      return res.json({ entries: [] });
    }
    
    // Combine and sort leaderboard entries from all competitions in this category
    let allEntries = [];
    competitionsInCategory.forEach(comp => {
      const leaderboard = mockDatabase.leaderboards[comp.id];
      if (leaderboard && leaderboard.entries) {
        allEntries = [...allEntries, ...leaderboard.entries];
      }
    });
    
    // Sort by average rating (descending) and vote count (descending)
    allEntries.sort((a, b) => {
      if (b.average_rating !== a.average_rating) {
        return b.average_rating - a.average_rating;
      }
      return b.vote_count - a.vote_count;
    });
    
    // Re-rank entries
    allEntries.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    res.json({ entries: allEntries });
  });
  
  // Submit a vote/rating for a submission
  app.post('/api/votes', (req, res) => {
    const { submission_id, user_id, rating } = req.body;
    
    if (!submission_id || !user_id || rating === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if the submission exists
    const submission = mockDatabase.submissions.find(sub => sub.id === submission_id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    
    // Check if the user exists
    const user = mockDatabase.users[user_id];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if the user has already voted for this submission
    const existingVoteIndex = mockDatabase.votes.findIndex(
      vote => vote.user_id === user_id && vote.submission_id === submission_id
    );
    
    if (existingVoteIndex !== -1) {
      // Update existing vote
      const oldRating = mockDatabase.votes[existingVoteIndex].rating;
      mockDatabase.votes[existingVoteIndex].rating = rating;
      mockDatabase.votes[existingVoteIndex].vote_date = new Date().toISOString();
      
      // Update the leaderboard
      updateLeaderboardAfterVoteUpdate(submission.competition_id, submission_id, oldRating, rating);
      
      return res.json({ success: true, message: 'Vote updated' });
    }
    
    // Create a new vote
    const newVote = {
      id: `vote-${mockDatabase.votes.length + 1}`,
      user_id,
      submission_id,
      rating,
      vote_date: new Date().toISOString()
    };
    
    mockDatabase.votes.push(newVote);
    
    // Update the leaderboard
    updateLeaderboardAfterNewVote(submission.competition_id, submission_id, rating);
    
    res.json({ success: true, message: 'Vote submitted' });
  });
  
  // Get all votes by a user
  app.get('/api/user/:userId/votes', (req, res) => {
    const { userId } = req.params;
    
    const userVotes = mockDatabase.votes.filter(vote => vote.user_id === userId);
    
    // Enrich with submission details
    const enrichedVotes = userVotes.map(vote => {
      const submission = mockDatabase.submissions.find(sub => sub.id === vote.submission_id);
      const competition = submission ? 
        mockDatabase.competitions.find(comp => comp.id === submission.competition_id) : null;
      
      return {
        ...vote,
        submission: submission || { id: vote.submission_id, title: 'Unknown Submission' },
        competition: competition || { id: 'unknown', title: 'Unknown Competition' }
      };
    });
    
    res.json(enrichedVotes);
  });
  
  // Get all votes for a submission
  app.get('/api/submission/:submissionId/votes', (req, res) => {
    const { submissionId } = req.params;
    
    const submissionVotes = mockDatabase.votes.filter(vote => vote.submission_id === submissionId);
    
    // Calculate statistics
    const totalVotes = submissionVotes.length;
    const sumRatings = submissionVotes.reduce((sum, vote) => sum + vote.rating, 0);
    const averageRating = totalVotes > 0 ? sumRatings / totalVotes : 0;
    
    // Enrich with user details but exclude emails
    const enrichedVotes = submissionVotes.map(vote => {
      const user = mockDatabase.users[vote.user_id];
      
      return {
        ...vote,
        user: user ? { id: user.id, username: user.username } : { id: vote.user_id, username: 'Unknown User' }
      };
    });
    
    res.json({
      votes: enrichedVotes,
      statistics: {
        total_votes: totalVotes,
        average_rating: averageRating
      }
    });
  });
  
  // Get a user's ranking in competitions
  app.get('/api/user/:userId/ranking', (req, res) => {
    const { userId } = req.params;
    
    // Get all submissions by this user
    const userSubmissions = mockDatabase.submissions.filter(sub => sub.user_id === userId);
    
    if (userSubmissions.length === 0) {
      return res.json({ rankings: [] });
    }
    
    // Get the ranking for each submission
    const rankings = userSubmissions.map(submission => {
      const competition = mockDatabase.competitions.find(comp => comp.id === submission.competition_id);
      const leaderboard = mockDatabase.leaderboards[submission.competition_id];
      
      const entry = leaderboard?.entries.find(entry => entry.submission_id === submission.id);
      
      return {
        submission_id: submission.id,
        submission_title: submission.title,
        competition_id: submission.competition_id,
        competition_title: competition?.title || 'Unknown Competition',
        rank: entry?.rank || 'Not Ranked',
        average_rating: entry?.average_rating || 0,
        vote_count: entry?.vote_count || 0,
        total_entries: leaderboard?.entries.length || 0
      };
    });
    
    res.json({ rankings });
  });
  
  return app;
}

/**
 * Helper functions for updating leaderboards
 */

// Update leaderboard after a new vote
function updateLeaderboardAfterNewVote(competitionId, submissionId, rating) {
  const leaderboard = mockDatabase.leaderboards[competitionId];
  
  if (!leaderboard) {
    console.error(`Leaderboard for competition ${competitionId} not found`);
    return;
  }
  
  const entryIndex = leaderboard.entries.findIndex(entry => entry.submission_id === submissionId);
  
  if (entryIndex === -1) {
    console.error(`Entry for submission ${submissionId} not found in leaderboard`);
    return;
  }
  
  const entry = leaderboard.entries[entryIndex];
  
  // Update the entry
  const newVoteCount = entry.vote_count + 1;
  const newTotalRating = entry.average_rating * entry.vote_count + rating;
  const newAverageRating = newTotalRating / newVoteCount;
  
  leaderboard.entries[entryIndex] = {
    ...entry,
    vote_count: newVoteCount,
    average_rating: newAverageRating
  };
  
  // Resort and rerank the leaderboard
  leaderboard.entries.sort((a, b) => {
    if (b.average_rating !== a.average_rating) {
      return b.average_rating - a.average_rating;
    }
    return b.vote_count - a.vote_count;
  });
  
  leaderboard.entries.forEach((entry, index) => {
    entry.rank = index + 1;
  });
}

// Update leaderboard after updating an existing vote
function updateLeaderboardAfterVoteUpdate(competitionId, submissionId, oldRating, newRating) {
  const leaderboard = mockDatabase.leaderboards[competitionId];
  
  if (!leaderboard) {
    console.error(`Leaderboard for competition ${competitionId} not found`);
    return;
  }
  
  const entryIndex = leaderboard.entries.findIndex(entry => entry.submission_id === submissionId);
  
  if (entryIndex === -1) {
    console.error(`Entry for submission ${submissionId} not found in leaderboard`);
    return;
  }
  
  const entry = leaderboard.entries[entryIndex];
  
  // Update the entry
  const totalRating = entry.average_rating * entry.vote_count;
  const newTotalRating = totalRating - oldRating + newRating;
  const newAverageRating = newTotalRating / entry.vote_count;
  
  leaderboard.entries[entryIndex] = {
    ...entry,
    average_rating: newAverageRating
  };
  
  // Resort and rerank the leaderboard
  leaderboard.entries.sort((a, b) => {
    if (b.average_rating !== a.average_rating) {
      return b.average_rating - a.average_rating;
    }
    return b.vote_count - a.vote_count;
  });
  
  leaderboard.entries.forEach((entry, index) => {
    entry.rank = index + 1;
  });
}

module.exports = { registerVotingApiRoutes };