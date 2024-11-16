import React from 'react';

const Home = () => {
  return (
    <div>
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl text-primary-900 font-libre">
              <span className="font-bold">SIS</span>{' '}
              <span className="font-normal">PROPS</span>
            </h1>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-[500px] bg-gray-900">
        <img
          src="https://images.unsplash.com/photo-1618220179428-22790b461013?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
          alt="Vintage Furniture Collection"
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent">
          <div className="container mx-auto px-4 h-full flex flex-col justify-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white max-w-2xl">
              Premium Props for Your Production
            </h2>
            <p className="mt-4 text-xl text-white/90 max-w-xl">
              Discover our extensive collection of high-quality furniture and props 
              for film, television, and theatrical productions.
            </p>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-primary-900">
          Available Props
        </h2>
        <div className="text-center text-gray-600">
          <p>Please check back soon - our product catalog is being updated.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
