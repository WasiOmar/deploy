const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const fetch = require('node-fetch');

// Initialize Groq client
const GROQ_API_KEY = process.env.GROQ_API_KEY;
console.log(GROQ_API_KEY);

// Helper function to search listings
const searchListings = (listings, searchTerm) => {
  const term = searchTerm.toLowerCase();
  return listings.filter(listing => {
    return listing.title?.toLowerCase().includes(term) ||
           listing.description?.toLowerCase().includes(term) ||
           listing.category?.toLowerCase().includes(term);
  });
};

// Chat endpoint
router.post('/', async (req, res) => {
  try {
    const { messages, listings } = req.body;
    
    // Get the last user message
    const lastUserMessage = messages[messages.length - 1].content.toLowerCase();
    
    // Basic response logic based on user input
    let response = '';
    
    if (lastUserMessage.includes('help')) {
      response = `I can help you find items in the marketplace! Try:
📌 Search for specific items (e.g., "I need a bottle" or "Show me books")
💰 Ask about prices (e.g., "Items under $50" or "Price between $20 and $100")
📁 Browse categories (e.g., "Show categories" or "What categories are available")
🔍 View listings (e.g., "Show available listings")`;
    } else if (lastUserMessage.includes('category') || lastUserMessage.includes('categories')) {
      const categories = [...new Set(listings.map(l => l.category))];
      response = 'Here are the available categories:\n\n' +
        categories.map(cat => `📁 ${cat}`).join('\n');
    } else {
      // Check for price queries first
      const underMatch = lastUserMessage.match(/under\s*\$?(\d+)/i);
      const betweenMatch = lastUserMessage.match(/between\s*\$?(\d+)\s*(?:and|to)\s*\$?(\d+)/i);
      
      if (betweenMatch) {
        const [minPrice, maxPrice] = [Number(betweenMatch[1]), Number(betweenMatch[2])];
        const matchingListings = listings
          .filter(listing => listing.price >= minPrice && listing.price <= maxPrice)
          .slice(0, 5);

        if (matchingListings.length > 0) {
          response = `Here are items between $${minPrice} and $${maxPrice}:\n\n` +
            matchingListings.map(listing =>
              `📌 ${listing.title}\n💰 $${listing.price}\n📝 ${listing.description?.slice(0, 100)}...\n`
            ).join('\n');
        } else {
          response = `I couldn't find any items between $${minPrice} and $${maxPrice}. Try a different price range.`;
        }
      } else if (underMatch) {
        const maxPrice = Number(underMatch[1]);
        const matchingListings = listings
          .filter(listing => listing.price <= maxPrice)
          .slice(0, 5);

        if (matchingListings.length > 0) {
          response = `Here are items under $${maxPrice}:\n\n` +
            matchingListings.map(listing =>
              `📌 ${listing.title}\n💰 $${listing.price}\n📝 ${listing.description?.slice(0, 100)}...\n`
            ).join('\n');
        } else {
          response = `I couldn't find any items under $${maxPrice}. Try a higher price range.`;
        }
      } else {
        // Extract search terms by removing common words
        const searchTerms = lastUserMessage
          .replace(/show|me|find|search|for|available|items|listings|need|a|an|the|some|i|want|to|buy/gi, '')
          .trim()
          .split(/\s+/)
          .filter(term => term.length > 2);

        if (searchTerms.length > 0) {
          // Search for each term and combine results
          let relevantListings = [];
          for (const term of searchTerms) {
            const results = searchListings(listings, term);
            relevantListings = [...new Set([...relevantListings, ...results])];
          }
          relevantListings = relevantListings.slice(0, 5);

          if (relevantListings.length > 0) {
            response = `Here are some relevant items:\n\n` +
              relevantListings.map(listing =>
                `📌 ${listing.title}\n💰 $${listing.price}\n📝 ${listing.description?.slice(0, 100)}...\n`
              ).join('\n');
          } else {
            response = `I couldn't find any items matching "${searchTerms.join(' ')}". Try different keywords or browse all listings.`;
          }
        } else if (lastUserMessage.includes('show') || lastUserMessage.includes('available') || lastUserMessage.includes('listings')) {
          // Show recent listings
          const recentListings = listings.slice(0, 5);
          response = 'Here are some recent listings:\n\n' +
            recentListings.map(listing =>
              `📌 ${listing.title}\n💰 $${listing.price}\n📝 ${listing.description?.slice(0, 100)}...\n`
            ).join('\n');
        } else {
          response = `I can help you find items! Try:
• Searching for specific items (e.g., "Show me bottles")
• Asking about prices (e.g., "Items under $50")
• Browsing categories (e.g., "Show categories")
• Viewing all listings (e.g., "Show available items")`;
        }
      }
    }

    res.json({ message: response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'An error occurred while processing your request.' });
  }
});

module.exports = router; 