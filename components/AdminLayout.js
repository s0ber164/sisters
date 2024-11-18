import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const AdminLayout = ({ children }) => {
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const router = useRouter();

  const isActive = (path) => router.pathname === path;
  const isProductsActive = router.pathname.startsWith('/admin/products');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold text-primary-900">
                  SIS PROPS
                </Link>
              </div>

              {/* Navigation Links */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/admin"
                  className={`${
                    isActive('/admin')
                      ? 'border-primary-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Dashboard
                </Link>

                {/* Products Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProductsDropdownOpen(!productsDropdownOpen)}
                    className={`${
                      isProductsActive
                        ? 'border-primary-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium group`}
                  >
                    Products
                    <svg
                      className={`ml-2 h-5 w-5 text-gray-400 group-hover:text-gray-500 ${
                        productsDropdownOpen ? 'transform rotate-180' : ''
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {/* Dropdown menu */}
                  {productsDropdownOpen && (
                    <div
                      className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="products-menu"
                    >
                      <div className="py-1" role="none">
                        <Link
                          href="/admin/products"
                          className={`${
                            isActive('/admin/products')
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-700'
                          } block px-4 py-2 text-sm hover:bg-gray-100`}
                          role="menuitem"
                        >
                          Manage Products
                        </Link>
                        <Link
                          href="/admin/products/upload"
                          className={`${
                            isActive('/admin/products/upload')
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-700'
                          } block px-4 py-2 text-sm hover:bg-gray-100`}
                          role="menuitem"
                        >
                          Upload Products
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  href="/admin/categories"
                  className={`${
                    isActive('/admin/categories')
                      ? 'border-primary-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Categories
                </Link>
              </div>
            </div>

            {/* Right side navigation items */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                View Site
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
};

export default AdminLayout;
