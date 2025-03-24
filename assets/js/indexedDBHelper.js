// IndexedDB Helper Utility for Offline Operations
const DB_NAME = 'cccOfflineDB';
const DB_VERSION = 1;

// Open IndexedDB database
function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not supported in this browser'));
      return;
    }
    
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject(event.target.error);
    };
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains('votes')) {
        const voteStore = db.createObjectStore('votes', { keyPath: 'id', autoIncrement: true });
        voteStore.createIndex('submissionId', 'submissionId', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('submissions')) {
        const submissionStore = db.createObjectStore('submissions', { keyPath: 'id', autoIncrement: true });
        submissionStore.createIndex('competitionId', 'data.competitionId', { unique: false });
      }
    };
  });
}

// Add vote to IndexedDB for background sync
async function saveVoteForSync(vote) {
  try {
    const db = await openDatabase();
    const tx = db.transaction('votes', 'readwrite');
    const store = tx.objectStore('votes');
    
    // Add vote to store
    const id = await store.add(vote);
    await tx.complete;
    
    console.log('Vote saved for background sync with ID:', id);
    return id;
  } catch (error) {
    console.error('Error saving vote for background sync:', error);
    throw error;
  }
}

// Add submission to IndexedDB for background sync
async function saveSubmissionForSync(submission, file) {
  try {
    const db = await openDatabase();
    const tx = db.transaction('submissions', 'readwrite');
    const store = tx.objectStore('submissions');
    
    // Create submission entry
    const submissionEntry = {
      data: submission,
      file: file,
      timestamp: new Date().toISOString()
    };
    
    // Add submission to store
    const id = await store.add(submissionEntry);
    await tx.complete;
    
    console.log('Submission saved for background sync with ID:', id);
    return id;
  } catch (error) {
    console.error('Error saving submission for background sync:', error);
    throw error;
  }
}

// Get all pending votes
async function getPendingVotes() {
  try {
    const db = await openDatabase();
    const tx = db.transaction('votes', 'readonly');
    const store = tx.objectStore('votes');
    
    const votes = await store.getAll();
    return votes;
  } catch (error) {
    console.error('Error getting pending votes:', error);
    return [];
  }
}

// Get all pending submissions
async function getPendingSubmissions() {
  try {
    const db = await openDatabase();
    const tx = db.transaction('submissions', 'readonly');
    const store = tx.objectStore('submissions');
    
    const submissions = await store.getAll();
    return submissions;
  } catch (error) {
    console.error('Error getting pending submissions:', error);
    return [];
  }
}

// Register for background sync
async function registerBackgroundSync(syncName) {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(syncName);
      console.log(`Background sync registered: ${syncName}`);
      return true;
    } catch (error) {
      console.error('Background sync registration failed:', error);
      return false;
    }
  } else {
    console.warn('Background Sync is not supported in this browser');
    return false;
  }
}

// Export all functions
window.dbHelper = {
  openDatabase,
  saveVoteForSync,
  saveSubmissionForSync,
  getPendingVotes,
  getPendingSubmissions,
  registerBackgroundSync
};