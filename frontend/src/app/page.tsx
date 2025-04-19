"use client";

import Auth from "@/components/Auth";
import ThreadDetail from "@/components/ThreadDetail";
import ThreadList from "@/components/ThreadList";
import { useState } from "react";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedThreadID, setSelectedThreadID] = useState<string | null>(null);
  
  const handleSelectThread = (threadId: string) => {
    setSelectedThreadID(threadId);
  };

  const handleAuthChange = (authStatus: boolean) => {
    setIsAuthenticated(authStatus);
    // clear selected email if user logs out
    if (!authStatus) {
      setSelectedThreadID(null);
    }
  }

  const handleBackToList = () => {
    setSelectedThreadID(null);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-black">Email Digital Twin</h1>
            <Auth onAuthChange={handleAuthChange}/>
          </div>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
        <div className="bg-white shadow rounded-lg">
          {selectedThreadID ? (
            <ThreadDetail threadId={selectedThreadID} onBack={handleBackToList}/>
          ) : (
            <ThreadList 
              isAuthenticated={isAuthenticated}
              onSelectThread={handleSelectThread}
            />
          )}
        </div>
      </div>
    </main>
  );
}
