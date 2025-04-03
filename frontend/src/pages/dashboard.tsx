import All from "@/components/All";
import { Sidebar } from "@/components/Sidebar";
// import React from 'react'

const Dashboard = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <All />
      </div>
    </div>
  );
};

export default Dashboard;
