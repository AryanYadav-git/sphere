import All from '@/components/All'
import { Sidebar } from '@/components/Sidebar'
import React from 'react'

const Dashboard = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <All />
    </div>
  );
}

export default Dashboard