import apiService, { AIAnalysis } from "@/services/api";
import { useEffect, useState } from "react";

interface EmailAIAssistantProps {
  emailId: string;
}

export default function EmailAIAssistant({emailId}: EmailAIAssistantProps) {
  const [activeTab, setActiveTab] = useState<'analysis' | 'response'>('analysis');
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [generatedResponse, setGeneratedResponse] = useState<string | null>(null);
  const [isResponseLoading, setIsResponseLoading] = useState(false);

  useEffect(() => {
    if(emailId && activeTab === 'analysis') {
      fetchAnalysis();
    }
  }, [emailId, activeTab]);

  const fetchAnalysis = async () => {
    setIsAnalysisLoading(true);
    setError(null);
    try {
      const result = await apiService.analyzeEmail(emailId);
      setAnalysis(result);
    } catch (error) {
      console.error('Failed to fetch analysis: ', error);
      setError('Failed to fetch analysis. Please try again later.');
    } finally {
      setIsAnalysisLoading(false);
    }
  }

  const fetchResponse = async () => {
    setIsResponseLoading(true);
    setError(null);
    try{
      const result = await apiService.generateEmailResponse(emailId);
      console.log('Generated response: ', result);
      setGeneratedResponse(result.response);
    } catch (error) {
      console.error('Error generating response: ', error);
      setError('Failed to generate response. Please try again later.');
    } finally {
      setIsResponseLoading(false);
    }
  }

  const handleTabChange = (tab: 'analysis'  | 'response') => {
    setActiveTab(tab);
    if(tab === 'analysis' && !generatedResponse && !isResponseLoading) {
      fetchResponse();
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'analysis'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => handleTabChange('analysis')}
          >
            AI Analysis
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'response'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => handleTabChange('response')}
          >
            Generate Response
          </button>
        </div>
      </div>
      <div className="p-4">
        {
          error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
              {error}
            </div>
          )
        }
        {activeTab === 'analysis' && (
          <>
            {isAnalysisLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-pulse text-gray-500">
                  Analyzing email and attachments...
                </div>
              </div>
            ) : analysis ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Sumamry
                  </h3>
                  <p className="text-gray-600">
                    {analysis.email_analysis.summary}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Key Points
                  </h3>
                  <p className="text-gray-600 whitespace-pre-line">
                    {analysis.email_analysis.key_points}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Suggested Next Steps
                  </h3>
                  <p className="text-gray-600 whitespace-pre-line">
                    {analysis.email_analysis.suggested_response}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <button
                  onClick={fetchAnalysis}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Analyze Email
                </button>
              </div>
            )}
          </>
        )}
        {activeTab === 'response' && (
          <>
            {isResponseLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-pulse text-gray-500">
                  Generating email response...
                </div>
              </div>
            ) : generatedResponse ? (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Generated Response</h3>
                <div className="bg-gray-50 p-4 rounded-md whitespace-pre-line">
                  {generatedResponse}
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedResponse);
                      // Add some notification here that text was copied
                    }}
                  >
                    Copy to Clipboard
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  onClick={fetchResponse}
                >
                  Generate Response
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}