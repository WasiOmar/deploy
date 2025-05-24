import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';

const Conversations = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get('/api/messages/conversations');
        setConversations(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load conversations');
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Your Conversations
        </h3>
      </div>
      <ul className="divide-y divide-gray-200">
        {conversations.map((conversation) => (
          <li key={`${conversation.user._id}-${conversation.listing._id}`}>
            <Link
              to={`/messages/${conversation.user._id}/${conversation.listing._id}`}
              className="block hover:bg-gray-50"
            >
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                        <span className="text-white font-medium">
                          {conversation.user.firstName[0]}
                          {conversation.user.lastName[0]}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {conversation.user.firstName} {conversation.user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {conversation.listing.title}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {conversation.unreadCount > 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {conversation.unreadCount} new
                      </span>
                    )}
                    <div className="ml-2 text-sm text-gray-500">
                      {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 truncate">
                    {conversation.lastMessage.content}
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
        {conversations.length === 0 && (
          <li className="px-4 py-5 sm:px-6">
            <div className="text-center text-gray-500">
              No conversations yet
            </div>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Conversations; 