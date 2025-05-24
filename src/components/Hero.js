import React from 'react';

const Hero = () => {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Buy, Sell, and Trade</span>{' '}
            <span className="block text-indigo-600">With Your Peers</span>
          </h1>
          <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto">
            A platform for students to buy, sell, and trade with each other. No more wasting time searching for what you need. All you need is here.
          </p>
        </div>
        
        <div className="mt-12">
          <img
            className="w-full h-96 object-cover rounded-lg shadow-xl"
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80"
            alt="Students collaborating"
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
