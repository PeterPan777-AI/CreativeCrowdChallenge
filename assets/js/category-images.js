/**
 * Functions to work with category images for CreativeCrowdChallenge
 */

// Map category IDs to image paths
const categoryImageMap = {
  // Individual categories
  'cat-i1': '/assets/images/categories/music.svg',
  'cat-i2': '/assets/images/categories/writing.svg',
  'cat-i3': '/assets/images/categories/photography.svg',
  'cat-i4': '/assets/images/categories/art.svg',
  'cat-i5': '/assets/images/categories/design.svg',
  'cat-i6': '/assets/images/categories/film.svg',
  
  // Business categories
  'cat-b1': '/assets/images/categories/tech.svg',
  'cat-b2': '/assets/images/categories/product.svg',
  'cat-b3': '/assets/images/categories/marketing.svg',
  'cat-b4': '/assets/images/categories/sustainability.svg',
  'cat-b5': '/assets/images/categories/social.svg',
  'cat-b6': '/assets/images/categories/startup.svg'
};

// Category name mapping
const categoryNameMap = {
  // Individual categories
  'cat-i1': 'Music Competition',
  'cat-i2': 'Writing Competition',
  'cat-i3': 'Photography Competition',
  'cat-i4': 'Art Competition',
  'cat-i5': 'Design Competition',
  'cat-i6': 'Film Competition',
  
  // Business categories
  'cat-b1': 'AI & Tech Competition',
  'cat-b2': 'Product Innovation',
  'cat-b3': 'Marketing Competition',
  'cat-b4': 'Sustainability Challenge',
  'cat-b5': 'Social Impact Challenge',
  'cat-b6': 'Startup Challenge'
};

// Category description mapping
const categoryDescriptionMap = {
  // Individual categories
  'cat-i1': 'Submit your original musical compositions and compete with musicians around the world.',
  'cat-i2': 'Share your poetry, short stories, or other written works in this creative writing competition.',
  'cat-i3': 'Show your best photographic work and compete for recognition in various styles and themes.',
  'cat-i4': 'Submit your paintings, drawings, or other visual art in this creative competition.',
  'cat-i5': 'Showcase your graphic design, UI/UX, or other design projects to a wider audience.',
  'cat-i6': 'Share your short films, animations, or video projects in this filmmaking competition.',
  
  // Business categories
  'cat-b1': 'Showcase innovative AI tools, applications, or other technological solutions.',
  'cat-b2': 'Present new product ideas, prototypes, or innovations that solve real-world problems.',
  'cat-b3': 'Compete with creative marketing campaigns, branding strategies, or advertising concepts.',
  'cat-b4': 'Present solutions for environmental challenges and sustainable business practices.',
  'cat-b5': 'Showcase projects that create positive social impact and address community needs.',
  'cat-b6': 'Present your startup idea, business model, or pitch to potential investors and partners.'
};

/**
 * Get the image path for a specific category
 * @param {string} categoryId - The ID of the category
 * @returns {string} The path to the category image
 */
function getCategoryImagePath(categoryId) {
  return categoryImageMap[categoryId] || '/assets/images/categories/default.svg';
}

/**
 * Get the name for a specific category
 * @param {string} categoryId - The ID of the category
 * @returns {string} The name of the category
 */
function getCategoryName(categoryId) {
  return categoryNameMap[categoryId] || 'Unknown Category';
}

/**
 * Get the description for a specific category
 * @param {string} categoryId - The ID of the category
 * @returns {string} The description of the category
 */
function getCategoryDescription(categoryId) {
  return categoryDescriptionMap[categoryId] || 'No description available.';
}

/**
 * Determine if a category is a business category
 * @param {string} categoryId - The ID of the category
 * @returns {boolean} True if it's a business category
 */
function isBusinessCategory(categoryId) {
  return categoryId && categoryId.startsWith('cat-b');
}

/**
 * Determine if a category is an individual category
 * @param {string} categoryId - The ID of the category
 * @returns {boolean} True if it's an individual category
 */
function isIndividualCategory(categoryId) {
  return categoryId && categoryId.startsWith('cat-i');
}

/**
 * Get all business category IDs
 * @returns {Array} Array of business category IDs
 */
function getAllBusinessCategories() {
  return ['cat-b1', 'cat-b2', 'cat-b3', 'cat-b4', 'cat-b5', 'cat-b6'];
}

/**
 * Get all individual category IDs
 * @returns {Array} Array of individual category IDs
 */
function getAllIndividualCategories() {
  return ['cat-i1', 'cat-i2', 'cat-i3', 'cat-i4', 'cat-i5', 'cat-i6'];
}

/**
 * Get all category IDs
 * @returns {Array} Array of all category IDs
 */
function getAllCategories() {
  return [...getAllBusinessCategories(), ...getAllIndividualCategories()];
}