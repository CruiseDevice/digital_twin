import apiService, { EmailPreview } from "@/services/api";
import { useEffect, useState } from "react";

interface EmailListProps {
  isAuthenticated: boolean;
  onSelectEmail: (emailId: string) => void;
}

export default function EmailList({isAuthenticated, onSelectEmail}: EmailListProps) {
  const [searchQuery, setSearchQuery] = useState('has:attachment filename:pdf');
  const [emails, setEmails] = useState<EmailPreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchEmails();
    }
  }, [isAuthenticated]);

  const fetchEmails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.getEmails(searchQuery);
      setEmails(response.messages);
    } catch (error) {
      console.error('Error fetching emails:', error);
      setError('Failed to load emails. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="p-4 text-center">
        Please log in to view your emails
      </div>
    )
  }

  return (
    <div className="p-4">
      {isLoading ? (
        <div className="text-center py-8">Loading emails...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : emails.length === 0 ? (
        <div className="text-center py-8">No emails found matching your search.</div>
      ) : (
        <div className="border rounded divide-y">
          {emails.map((email) => (
            <div
              onClick={() => onSelectEmail(email.id)}
              key={email.id}
              className="p-4 hover:bg-gray-100 cursor-pointer transition duration-150"
            >
              <div className="flex justify-between items-start">
                <div className="font-semibold text-lg">{email.subject}</div>
                <div className="text-sm text-gray-500">{email.date}</div>
              </div>
              <div className="text-sm text-gray-600 mt-1">From: {email.from}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}