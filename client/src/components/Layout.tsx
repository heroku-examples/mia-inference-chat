import React from 'react';
import { Outlet } from 'react-router-dom';
import logo from '@/assets/mia-logo.png';

const Layout: React.FC = () => {
  return (
    <div className='min-h-screen flex flex-col bg-gray-50'>
      <header className='text-heroku-purple-30 h-12 fixed top-0 left-0 right-0 z-10 shadow-sm'>
        <div className='h-full flex items-center px-4'>
          <img src={logo} alt='Heroku MIA' className='h-8 w-8 mr-2' />
          <h1 className='text-lg font-semibold'>Heroku Managed Inference and Agents</h1>
        </div>
      </header>

      <main className='flex-1 pt-12'>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
