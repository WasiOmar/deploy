import React from 'react';

const ListingCard = ({ title, price, image, description }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="aspect-w-16 aspect-h-9">
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-2 line-clamp-2">{description}</p>
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-indigo-600">${price}</span>
          <button className="text-sm text-indigo-600 hover:text-indigo-500">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingCard; 