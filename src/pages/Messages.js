import React from 'react';
import { useParams } from 'react-router-dom';
import Chat from '../components/Chat';
import Conversations from '../components/Conversations';

const Messages = () => {
  const { userId, listingId } = useParams();

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {userId && listingId ? (
          <Chat receiverId={userId} listingId={listingId} />
        ) : (
          <Conversations />
        )}
      </div>
    </div>
  );
};

export default Messages; 