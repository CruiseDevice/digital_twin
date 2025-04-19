import apiService, { Attachment, EmailDetail as EmailDetailType } from "@/services/api";
import { useEffect, useState } from "react";

interface EmailDetailProps {
  emailId: string | null;
  onBack: () => void;
}
export default function EmailDetail({emailId, onBack}: EmailDetailProps) {
  const [email, setEmail] = useState<EmailDetailType | null>(null);

  useEffect(() => {
    if (emailId) {
      fetchEmailDetail(emailId);
    }
  }, [emailId]);

  const fetchEmailDetail = async (emailId: string) => {
    try {
      const emailData = await apiService.getEmailDetail(emailId);
      console.log('Email headers:', emailData.headers);
      setEmail(emailData);
    } catch (error) {
      console.error('Failed to fetch email details: ', error);
    }
  }

  const handleDownloadAttachment = (attachment: Attachment) => {
    // TODO: Implement attachment download
  }

  if (!emailId) {
    return null;
  }

  if (!email) {
    return null;
  }

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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Email Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {email.headers.subject || email.headers.Subject || 'No subject'}
          </h2>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start">
              <span className="font-medium text-gray-900 w-16">From:</span>
              <span className="flex-1">{email.headers.From}</span>
            </div>
            {email.headers.To && (
              <div className="flex items-start">
                <span className="font-medium text-gray-900 w-16">To:</span>
                <span className="flex-1">{email.headers.To}</span>
              </div>
            )}
            {email.headers.Date && (
              <div className="flex items-start">
                <span className="font-medium text-gray-900 w-16">Date:</span>
                <span className="flex-1">{email.headers.Date}</span>
              </div>
            )}
          </div>
        </div>

        {/* Email Body */}
        <div className="p-6">
          <div 
            className="prose max-w-none prose-sm sm:prose-base"
            dangerouslySetInnerHTML={{ __html: email.body }}
          />
        </div>

        {/* Attachments */}
        {email.attachments.length > 0 && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {email.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    onClick={() => handleDownloadAttachment(attachment)}
                    className="ml-4 flex-shrink-0 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}