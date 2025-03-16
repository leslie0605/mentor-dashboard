
import React from 'react';
import { LoginForm } from '@/components/LoginForm';

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1603468620905-8de7d86b781e?q=80&w=2076')] bg-cover bg-center opacity-5 z-0"></div>
      
      <div className="relative z-10 max-w-screen-xl mx-auto flex flex-col items-center">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Index;
