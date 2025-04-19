"use client";

import Auth from "@/components/Auth";
import EmailDetail from "@/components/EmailDetail";
import EmailList from "@/components/EmailList";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  
  const handleSelectEmail = (emailId: string) => {
    setSelectedEmailId(emailId);
  };

  const handleAuthChange = (authStatus: boolean) => {
    setIsAuthenticated(authStatus);
    // clear selected email if user logs out
    if (!authStatus) {
      setSelectedEmailId(null);
    }
  }

  const handleBackToList = () => {
    setSelectedEmailId(null);
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
          {selectedEmailId ? (
            <EmailDetail emailId={selectedEmailId} onBack={handleBackToList}/>
          ) : (
            <EmailList 
              isAuthenticated={isAuthenticated}
              onSelectEmail={handleSelectEmail}
            />
          )}
        </div>
      </div>
    </main>
  );
}
