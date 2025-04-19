import apiService, { ThreadPreview } from "@/services/api";
import { useEffect, useState } from "react";

interface ThreadListProps {
  isAuthenticated: boolean;
  onSelectThread: (threadId: string) => void;
}

export default function ThreadList({isAuthenticated, onSelectThread}: ThreadListProps) {
  const [threads, setThreads] = useState<ThreadPreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('has:attachment filename:pdf');
  

  useEffect(() => {
    if (isAuthenticated) {
      fetchThreads();
    }
  }, [isAuthenticated]);

  const fetchThreads = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.getThreads(searchQuery);
      setThreads(response.threads);
    } catch (error) {
      console.error('Error fetching threads:', error);
      setError('Failed to fetch threads. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="p-4 text-gray-900 text-center">
        Please login to view your emails
      </div>
    )
  }

  return (
    <div className="p-4">
      {isLoading ? (
        <div className="text-gray-900 text-center py-8">Loading email threads...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : threads.length === 0 ? (
        <div className="text-gray-900 text-center py-8">No email threads found matching your search.</div>
      ) : (
        <div className="border rounded divide-y">
          {threads.map((thread) => (
            <div
              onClick={() => onSelectThread(thread.id)}
              key={thread.id}
              className="p-4 hover:bg-gray-100 cursor-pointer transition duration-150"
            >
              <div className="flex justify-between items-start">
                <div className="font-semibold text-lg text-gray-900">{thread.subject}</div>
                <div className="text-sm text-gray-600">{thread.date}</div>
              </div>
              <div className="text-sm text-gray-600 mt-1">From: {thread.from}</div>
              <div className="text-sm text-gray-500 mt-2 line-clamp-2">{thread.snippet}</div>
              <div className="text-xs text-gray-400 mt-2">{thread.messageCount} message{thread.messageCount !== 1 ? 's' : ''}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}