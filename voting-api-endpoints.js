// ===== COPY THESE ENDPOINTS INTO YOUR SERVER.JS FILE =====
// These endpoints should be added to the handleApiRequest function

  // GET /api/categories - Get all categories
  if (endpoint === '/categories' && req.method === 'GET') {
    try {
      if (!supabase) {
        console.log('Supabase not available, using mock category data');
        res.writeHead(200);
        res.end(JSON.stringify(MOCK_DATA.categories));
        return;
      }
      
      // In a real implementation, this would fetch from Supabase
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('priority_order', { ascending: true });
      
      if (error) {
        console.error('Error fetching categories:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Failed to fetch categories' }));
        return;
      }
      
      res.writeHead(200);
      res.end(JSON.stringify(data));
      return;
    } catch (error) {
      console.error('Error handling categories request:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to process categories request' }));
      return;
    }
  }
  
  // GET /api/leaderboards/:competitionId - Get leaderboard for a specific competition
  if (endpoint.match(/^\/leaderboards\/[\w-]+$/) && req.method === 'GET') {
    try {
      const competitionId = endpoint.split('/')[2];
      
      if (!supabase) {
        console.log('Supabase not available, using mock leaderboard data');
        // Find the leaderboard for this competition
        const leaderboard = MOCK_DATA.leaderboards.find(lb => lb.competition_id === competitionId);
        
        if (!leaderboard) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Leaderboard not found' }));
          return;
        }
        
        res.writeHead(200);
        res.end(JSON.stringify(leaderboard));
        return;
      }
      
      // In a real implementation, this would fetch from Supabase
      const { data, error } = await supabase
        .from('leaderboards')
        .select('*')
        .eq('competition_id', competitionId)
        .single();
      
      if (error) {
        console.error('Error fetching leaderboard:', error);
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Leaderboard not found' }));
        return;
      }
      
      res.writeHead(200);
      res.end(JSON.stringify(data));
      return;
    } catch (error) {
      console.error('Error handling leaderboard request:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to process leaderboard request' }));
      return;
    }
  }
  
  // GET /api/leaderboards/category/:categoryId - Get leaderboard for a specific category
  if (endpoint.match(/^\/leaderboards\/category\/[\w-]+$/) && req.method === 'GET') {
    try {
      const categoryId = endpoint.split('/')[3];
      
      if (!supabase) {
        console.log('Supabase not available, using mock category leaderboard data');
        // Find all leaderboards for this category
        const leaderboards = MOCK_DATA.leaderboards.filter(lb => lb.category_id === categoryId);
        
        if (leaderboards.length === 0) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Category leaderboards not found' }));
          return;
        }
        
        // Combine all entries into a single leaderboard
        let allEntries = [];
        leaderboards.forEach(lb => {
          allEntries = [...allEntries, ...lb.entries];
        });
        
        // Sort by average rating (descending) and then by vote count (descending)
        allEntries.sort((a, b) => {
          if (a.average_rating !== b.average_rating) {
            return b.average_rating - a.average_rating;
          }
          return b.vote_count - a.vote_count;
        });
        
        // Assign new ranks
        allEntries.forEach((entry, index) => {
          entry.rank = index + 1;
        });
        
        // Create a combined leaderboard
        const combinedLeaderboard = {
          id: `category-leaderboard-${categoryId}`,
          category_id: categoryId,
          updated_at: new Date().toISOString(),
          entries: allEntries.slice(0, 10) // Limit to top 10
        };
        
        res.writeHead(200);
        res.end(JSON.stringify(combinedLeaderboard));
        return;
      }
      
      // In a real implementation, this would fetch from Supabase
      // This would involve a more complex query to join multiple tables
      const { data: competitions, error: compError } = await supabase
        .from('competitions')
        .select('id')
        .eq('category_id', categoryId);
      
      if (compError || !competitions.length) {
        console.error('Error fetching category competitions:', compError);
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Category competitions not found' }));
        return;
      }
      
      const competitionIds = competitions.map(c => c.id);
      
      const { data: submissions, error: subError } = await supabase
        .from('submissions')
        .select('*, users(username, profile_image)')
        .in('competition_id', competitionIds)
        .order('average_rating', { ascending: false })
        .order('vote_count', { ascending: false })
        .limit(10);
      
      if (subError) {
        console.error('Error fetching category submissions:', subError);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Failed to fetch category leaderboard' }));
        return;
      }
      
      // Format the response
      const leaderboard = {
        id: `category-leaderboard-${categoryId}`,
        category_id: categoryId,
        updated_at: new Date().toISOString(),
        entries: submissions.map((sub, index) => ({
          rank: index + 1,
          submission_id: sub.id,
          average_rating: sub.average_rating,
          vote_count: sub.vote_count,
          title: sub.title,
          username: sub.users.username
        }))
      };
      
      res.writeHead(200);
      res.end(JSON.stringify(leaderboard));
      return;
    } catch (error) {
      console.error('Error handling category leaderboard request:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to process category leaderboard request' }));
      return;
    }
  }
  
  // POST /api/votes - Submit a vote for a submission
  if (endpoint === '/votes' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { submission_id, user_id, rating } = body;
      
      if (!submission_id || !user_id || rating === undefined) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Submission ID, user ID, and rating are required' }));
        return;
      }
      
      // Validate rating is between 0 and 10
      if (rating < 0 || rating > 10) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Rating must be between 0 and 10' }));
        return;
      }
      
      if (!supabase) {
        console.log('Supabase not available, using mock data for vote submission');
        
        // Find the submission in our mock data
        const submission = MOCK_DATA.submissions.find(s => s.id === submission_id);
        
        if (!submission) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Submission not found' }));
          return;
        }
        
        // Create a new vote
        const newVote = {
          id: `vote-${Date.now()}`,
          submission_id,
          user_id,
          rating,
          created_at: new Date().toISOString()
        };
        
        // Add to votes array
        MOCK_DATA.votes.push(newVote);
        
        // Update submission stats
        submission.vote_count = (submission.vote_count || 0) + 1;
        submission.total_rating = (submission.total_rating || 0) + rating;
        submission.average_rating = parseFloat((submission.total_rating / submission.vote_count).toFixed(1));
        
        // Update leaderboard
        const competition = MOCK_DATA.competitions.find(c => c.id === submission.competition_id);
        if (competition) {
          const leaderboard = MOCK_DATA.leaderboards.find(lb => lb.competition_id === competition.id);
          
          if (leaderboard) {
            // Find this submission in the leaderboard
            const entry = leaderboard.entries.find(e => e.submission_id === submission_id);
            
            if (entry) {
              // Update the entry
              entry.average_rating = submission.average_rating;
              entry.vote_count = submission.vote_count;
              
              // Sort and update ranks
              leaderboard.entries.sort((a, b) => {
                if (a.average_rating !== b.average_rating) {
                  return b.average_rating - a.average_rating;
                }
                return b.vote_count - a.vote_count;
              });
              
              leaderboard.entries.forEach((entry, index) => {
                entry.rank = index + 1;
              });
            } else {
              // Add new entry if not present
              const username = MOCK_DATA.submissions.find(s => s.id === submission_id)?.username || 'Anonymous';
              
              leaderboard.entries.push({
                submission_id,
                title: submission.title,
                username,
                average_rating: submission.average_rating,
                vote_count: submission.vote_count,
                rank: leaderboard.entries.length + 1
              });
              
              // Resort and rerank
              leaderboard.entries.sort((a, b) => {
                if (a.average_rating !== b.average_rating) {
                  return b.average_rating - a.average_rating;
                }
                return b.vote_count - a.vote_count;
              });
              
              leaderboard.entries.forEach((entry, index) => {
                entry.rank = index + 1;
              });
            }
            
            // Update the leaderboard timestamp
            leaderboard.updated_at = new Date().toISOString();
          }
        }
        
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          vote: newVote,
          submission: {
            id: submission.id,
            vote_count: submission.vote_count,
            average_rating: submission.average_rating
          }
        }));
        return;
      }
      
      // In a real implementation with Supabase, this would be a transaction
      // First, check if user has already voted for this submission
      const { data: existingVote, error: voteError } = await supabase
        .from('votes')
        .select('id, rating')
        .eq('submission_id', submission_id)
        .eq('user_id', user_id)
        .single();
      
      if (voteError && voteError.code !== 'PGRST116') { // PGRST116 is "No rows returned" error code
        console.error('Error checking existing vote:', voteError);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Failed to check existing vote' }));
        return;
      }
      
      let voteOperation;
      let oldRating = 0;
      
      if (existingVote) {
        // Update existing vote
        oldRating = existingVote.rating;
        voteOperation = supabase
          .from('votes')
          .update({ rating, updated_at: new Date().toISOString() })
          .eq('id', existingVote.id);
      } else {
        // Insert new vote
        voteOperation = supabase
          .from('votes')
          .insert([{
            submission_id,
            user_id,
            rating,
            weight: 1.0, // Default weight
            ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            user_agent: req.headers['user-agent']
          }]);
      }
      
      const { data: voteResult, error: voteOpError } = await voteOperation;
      
      if (voteOpError) {
        console.error('Error saving vote:', voteOpError);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Failed to save vote' }));
        return;
      }
      
      // Update submission statistics
      const ratingDelta = existingVote ? (rating - oldRating) : rating;
      const countDelta = existingVote ? 0 : 1;
      
      const { data: submission, error: subError } = await supabase.rpc('update_submission_ratings', {
        p_submission_id: submission_id,
        p_rating_delta: ratingDelta,
        p_count_delta: countDelta
      });
      
      if (subError) {
        console.error('Error updating submission stats:', subError);
        // We still saved the vote, so don't return an error to the client
      }
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        vote: voteResult || {
          submission_id,
          user_id,
          rating
        },
        submission
      }));
      return;
    } catch (error) {
      console.error('Error handling vote submission:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to process vote submission' }));
      return;
    }
  }
  
  // GET /api/user/:userId/votes - Get all votes by a user
  if (endpoint.match(/^\/user\/[\w-]+\/votes$/) && req.method === 'GET') {
    try {
      const userId = endpoint.split('/')[2];
      
      if (!supabase) {
        console.log('Supabase not available, using mock data for user votes');
        // Filter votes by user ID
        const userVotes = MOCK_DATA.votes.filter(vote => vote.user_id === userId);
        
        res.writeHead(200);
        res.end(JSON.stringify(userVotes));
        return;
      }
      
      // In a real implementation, this would fetch from Supabase
      const { data, error } = await supabase
        .from('votes')
        .select('*, submissions(title, competition_id)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching user votes:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Failed to fetch user votes' }));
        return;
      }
      
      res.writeHead(200);
      res.end(JSON.stringify(data));
      return;
    } catch (error) {
      console.error('Error handling user votes request:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to process user votes request' }));
      return;
    }
  }
  
  // GET /api/submission/:submissionId/votes - Get all votes for a submission
  if (endpoint.match(/^\/submission\/[\w-]+\/votes$/) && req.method === 'GET') {
    try {
      const submissionId = endpoint.split('/')[2];
      
      if (!supabase) {
        console.log('Supabase not available, using mock data for submission votes');
        // Filter votes by submission ID
        const submissionVotes = MOCK_DATA.votes.filter(vote => vote.submission_id === submissionId);
        
        res.writeHead(200);
        res.end(JSON.stringify(submissionVotes));
        return;
      }
      
      // In a real implementation, this would fetch from Supabase
      const { data, error } = await supabase
        .from('votes')
        .select('id, rating, created_at, user_id, users(username, profile_image)')
        .eq('submission_id', submissionId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching submission votes:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Failed to fetch submission votes' }));
        return;
      }
      
      res.writeHead(200);
      res.end(JSON.stringify(data));
      return;
    } catch (error) {
      console.error('Error handling submission votes request:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to process submission votes request' }));
      return;
    }
  }
  
  // GET /api/user/:userId/ranking - Get user's ranking in competitions
  if (endpoint.match(/^\/user\/[\w-]+\/ranking$/) && req.method === 'GET') {
    try {
      const userId = endpoint.split('/')[2];
      
      if (!supabase) {
        console.log('Supabase not available, using mock data for user rankings');
        // Find all submissions by this user
        const userSubmissions = MOCK_DATA.submissions.filter(sub => sub.user_id === userId);
        
        // For each submission, get the competition and ranking info
        const rankings = userSubmissions.map(submission => {
          const competition = MOCK_DATA.competitions.find(comp => comp.id === submission.competition_id);
          const leaderboard = MOCK_DATA.leaderboards.find(lb => lb.competition_id === submission.competition_id);
          const category = MOCK_DATA.categories.find(cat => competition && cat.id === competition.category_id);
          
          return {
            submission_id: submission.id,
            submission_title: submission.title,
            competition_id: submission.competition_id,
            competition_title: competition ? competition.title : 'Unknown Competition',
            category_id: category ? category.id : null,
            category_name: category ? category.name : 'Unknown Category',
            rank: submission.rank || 0,
            total_entries: leaderboard ? leaderboard.entries.length : 0,
            vote_count: submission.vote_count || 0,
            average_rating: submission.average_rating || 0,
            updated_at: leaderboard ? leaderboard.updated_at : null
          };
        });
        
        res.writeHead(200);
        res.end(JSON.stringify(rankings));
        return;
      }
      
      // In a real implementation, this would fetch from Supabase
      const { data: submissions, error: subError } = await supabase
        .from('submissions')
        .select(`
          id, title, rank, vote_count, average_rating,
          competitions(id, title, category_id, categories(id, name))
        `)
        .eq('user_id', userId);
      
      if (subError) {
        console.error('Error fetching user submissions for ranking:', subError);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Failed to fetch user rankings' }));
        return;
      }
      
      // Format the response
      const rankings = submissions.map(sub => {
        return {
          submission_id: sub.id,
          submission_title: sub.title,
          competition_id: sub.competitions?.id,
          competition_title: sub.competitions?.title || 'Unknown Competition',
          category_id: sub.competitions?.categories?.id,
          category_name: sub.competitions?.categories?.name || 'Unknown Category',
          rank: sub.rank || 0,
          total_entries: 0, // Would need another query to get this
          vote_count: sub.vote_count || 0,
          average_rating: sub.average_rating || 0
        };
      });
      
      res.writeHead(200);
      res.end(JSON.stringify(rankings));
      return;
    } catch (error) {
      console.error('Error handling user rankings request:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to process user rankings request' }));
      return;
    }
  }