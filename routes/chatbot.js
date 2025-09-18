const express = require('express');
const { generateResponse } = require('../utils/groqClient.js');
const Listing = require('../models/listing.js');
const Booking = require('../models/booking.js');

const router = express.Router();

// System prompt for the chatbot
const systemPrompt = `
You are a helpful AI assistant for the RoamingRoof app, a platform for booking vacation rentals and properties.

App Features:
- Users can browse and book listings (properties like apartments, villas, cottages, etc.)
- Listings have details: title, description, images, price, location, country, category
- Users can leave reviews and ratings (1-5 stars) for listings
- Bookings include start date, end date, and status (pending, confirmed, cancelled)
- Users have username, email, and are authenticated via passport-local
- Owners can create and manage their listings

Your Capabilities:
1. Help users find properties by location, category, or title
2. Assist with booking properties - you can help initiate bookings
3. Show all properties in a specific category and/or location
4. Provide detailed information about specific listings
5. Guide users through the booking process

When users ask to book a property:
- Ask for check-in and check-out dates if not provided
- Confirm the booking details
- Guide them to complete the booking on the website

When users ask to show properties:
- List relevant properties with their details
- Provide links or guidance on how to view them

Be friendly, helpful, and provide accurate information based on the app's functionality and the provided data.
Always encourage users to log in for the best experience and to complete bookings through the website.
`;

// GET /chatbot - Render chatbot page
router.get('/', (req, res) => {
  res.render('chatbot');
});

// POST /chatbot/query
router.post('/query', async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  try {
    // Check if user is asking for booking or property search
    const lowerQuestion = question.toLowerCase();
    let isBookingRequest = lowerQuestion.includes('book') || lowerQuestion.includes('reserve') || lowerQuestion.includes('rent');
    let isSearchRequest = lowerQuestion.includes('show') || lowerQuestion.includes('find') || lowerQuestion.includes('search') || lowerQuestion.includes('list');

    // Fetch real data from the database
    const recentListings = await Listing.find({}).limit(5).select('title description price location category');
    let userBookings = [];
    if (req.user && req.user._id) {
      userBookings = await Booking.find({ user: req.user._id }).populate('listing', 'title location').limit(5);
    }

    // Handle specific search requests
    let searchResults = [];
    if (isSearchRequest) {
      // Extract location and category from question
      const locationMatch = lowerQuestion.match(/(?:in|at|near)\s+([a-zA-Z\s]+)/i);
      const categoryMatch = lowerQuestion.match(/(?:category|type)\s+([a-zA-Z\s]+)/i);

      let searchQuery = {};

      if (locationMatch) {
        searchQuery.location = { $regex: locationMatch[1].trim(), $options: 'i' };
      }

      if (categoryMatch) {
        searchQuery.category = { $regex: categoryMatch[1].trim(), $options: 'i' };
      }

      if (Object.keys(searchQuery).length > 0) {
        searchResults = await Listing.find(searchQuery).limit(10).select('title description price location category');
      }
    }

    // Construct data context
    let dataContext = `Recent Listings:\n`;
    recentListings.forEach(listing => {
      dataContext += `- ${listing.title}: ${listing.description}, Price: $${listing.price}, Location: ${listing.location}, Category: ${listing.category}\n`;
    });

    if (searchResults.length > 0) {
      dataContext += `\nSearch Results:\n`;
      searchResults.forEach(listing => {
        dataContext += `- ${listing.title}: ${listing.description}, Price: $${listing.price}, Location: ${listing.location}, Category: ${listing.category}\n`;
      });
    }

    if (userBookings.length > 0) {
      dataContext += `\nYour Recent Bookings:\n`;
      userBookings.forEach(booking => {
        if (booking.listing) {
          dataContext += `- ${booking.listing.title} in ${booking.listing.location}, Dates: ${booking.startDate.toDateString()} to ${booking.endDate.toDateString()}, Status: ${booking.status}\n`;
        } else {
          dataContext += `- Booking ID: ${booking._id}, Dates: ${booking.startDate.toDateString()} to ${booking.endDate.toDateString()}, Status: ${booking.status}\n`;
        }
      });
    }

    // Add booking/search specific instructions
    let additionalInstructions = '';
    if (isBookingRequest) {
      additionalInstructions = '\n\nThe user is asking to book a property. Please:\n1. Ask for check-in and check-out dates if not provided\n2. Confirm the booking details\n3. Guide them to complete the booking on the website\n4. Mention they need to be logged in to book';
    }

    if (isSearchRequest) {
      additionalInstructions = '\n\nThe user is asking to search for properties. Please:\n1. List the relevant properties with their details\n2. Provide guidance on how to view or book them\n3. If no results found, suggest alternative searches';
    }

    // Construct full prompt with real data
    const fullPrompt = `${systemPrompt}\n\nCurrent App Data:\n${dataContext}${additionalInstructions}\n\nUser Question: ${question}\n\nAnswer:`;

    // Generate response using GROQ
    const answer = await generateResponse(fullPrompt);

    res.json({ answer });
  } catch (error) {
    console.error('Error processing chatbot query:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
