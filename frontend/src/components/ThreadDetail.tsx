import apiService, { Attachment, Thread } from "@/services/api";
import { useEffect, useState } from "react";

interface ThreadDetailProps {
  threadId: string;
  onBack: () => void;
}

export default function ThreadDetail({threadId, onBack}: ThreadDetailProps) {
  const [thread, setThread] = useState<Thread | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);


  useEffect(() => {
    if (threadId) {
      fetchThreadDetail(threadId);
    }
  }, [threadId]);

  const fetchThreadDetail = async (threadId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const threadData = await apiService.getThreadDetail(threadId);
      console.log(threadData);
      setThread(threadData);
    } catch (error) {
      console.error('Failed to fetch thread details: ', error);
      setError('Failed to fetch thread details');
    } finally {
      setIsLoading(false);
    }
  }

  const toggleAIAssistant = () => {

  }

  const handleDownloadAttachment = (messageId: string, attachment: Attachment) => {
    
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Email List
          </button>
        </div>
        <div className="text-center text-black py-8">Loading thread...</div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Email List
          </button>
        </div>
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  if (!threadId || !thread) {
    return null;
  }

  // Get the latest message's subject for the thread title
  const latestMessage = thread.messages[thread.messages.length - 1];
  const threadSubject = latestMessage?.headers?.Subject || 'No subject';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Email List
        </button>
        
        <button
          onClick={toggleAIAssistant}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {showAIAssistant ? 'Hide AI Assistant' : 'Show AI Assistant'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        {/* Thread Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {threadSubject}
          </h2>
          <div className="text-sm text-gray-600">
            {thread.messages.length} message{thread.messages.length !== 1 ? 's' : ''} in this conversation
          </div>
        </div>

        {/* Thread Messages */}
        <div className="divide-y divide-gray-200">
          {thread.messages.map((message, index) => (
            <div key={message.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="font-medium text-gray-900">{message.headers.From}</div>
                  <div className="text-sm text-gray-600 mt-1">To: {message.headers.To}</div>
                  <div className="text-sm text-gray-600">{message.headers.Date}</div>
                </div>
                <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {index + 1} of {thread.messages.length}
                </div>
              </div>
              
              {/* Email Body */}
              <div 
                className="prose prose-sm text-gray-800 mt-4 max-w-none"
                dangerouslySetInnerHTML={{ __html: message.body }}
              />
              
              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Attachments</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {message.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="bg-gray-50 rounded-lg border border-gray-200 p-3 flex items-center justify-between hover:bg-gray-100"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="flex-shrink-0">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {attachment.filename}
                            </p>
                            <p className="text-xs text-gray-500">
                              {attachment.mimeType}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadAttachment(message.id, attachment)}
                          className="ml-2 flex-shrink-0 bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded text-xs font-medium transition-colors"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}