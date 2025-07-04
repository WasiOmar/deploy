const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');

// Get all conversations for the current user
router.get('/conversations', auth, async (req, res) => {
  try {
    console.log('User from auth middleware:', req.user);
    console.log('User ID:', req.user.id);

    // Find all messages where the user is either sender or receiver
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }]
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'firstName lastName')
      .populate('receiver', 'firstName lastName')
      .populate('listing', 'title');

    console.log('Found messages:', messages);

    // Group messages by conversation (unique combination of users and listing)
    const conversations = messages.reduce((acc, message) => {
      // Skip invalid messages
      if (!message.sender || !message.receiver || !message.listing) {
        console.log('Skipping invalid message:', message);
        return acc;
      }

      try {
        console.log('Processing message:', message);
        const otherUser = message.sender._id.toString() === req.user.id 
          ? message.receiver 
          : message.sender;
        
        // Skip if other user is not properly populated
        if (!otherUser._id || !otherUser.firstName || !otherUser.lastName) {
          console.log('Skipping message with invalid user:', message);
          return acc;
        }

        const conversationKey = `${otherUser._id}-${message.listing._id}`;
        
        if (!acc[conversationKey]) {
          acc[conversationKey] = {
            user: {
              _id: otherUser._id,
              firstName: otherUser.firstName,
              lastName: otherUser.lastName
            },
            listing: {
              _id: message.listing._id,
              title: message.listing.title || 'Untitled Listing'
            },
            lastMessage: {
              _id: message._id,
              content: message.content,
              createdAt: message.createdAt
            },
            unreadCount: message.receiver._id.toString() === req.user.id && !message.read ? 1 : 0
          };
        } else if (!message.read && message.receiver._id.toString() === req.user.id) {
          acc[conversationKey].unreadCount++;
        }
        
        return acc;
      } catch (err) {
        console.error('Error processing message:', err);
        return acc;
      }
    }, {});

    res.json(Object.values(conversations));
  } catch (err) {
    console.error('Error in /conversations route:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      user: req.user
    });
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get messages between two users for a specific listing
router.get('/:receiverId/:listingId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.receiverId, listing: req.params.listingId },
        { sender: req.params.receiverId, receiver: req.user.id, listing: req.params.listingId }
      ]
    })
      .sort({ createdAt: 1 })
      .populate('sender receiver', 'firstName lastName');

    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send a new message
router.post('/', auth, async (req, res) => {
  try {
    const { receiver, listing, content } = req.body;

    // Create new message
    const message = new Message({
      sender: req.user.id,
      receiver,
      listing,
      content
    });

    await message.save();

    // Populate sender and receiver details
    await message.populate('sender receiver', 'firstName lastName');

    res.status(201).json(message);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark messages as read
router.patch('/read/:senderId/:listingId', auth, async (req, res) => {
  try {
    await Message.updateMany(
      {
        sender: req.params.senderId,
        receiver: req.user.id,
        listing: req.params.listingId,
        read: false
      },
      { read: true }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    console.error('Error marking messages as read:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 