import React, { useState, useRef } from 'react';
import { Upload, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEditors } from '../contexts/EditorsContext';
import { useRecords } from '../contexts/RecordContext';
import { useDashboard } from '../contexts/DashboardContext';

interface ManuscriptDetails {
  id: string;
  title: string;
  authors: string;
  scope: string;
  scopeType: 'internal' | 'external';
  scopeCode: string;
  date: string;
  email: string;
  affiliation: string;
  editor: string;
  status: 'pre-review' | 'double-blind' | 'rejected';
}

const scopeCounters: { [key: string]: number } = {
  EA: 1087,
  IA: 905,
  ECBE: 1285,
  ICBE: 942,
  EECT: 1458,
  IECT: 1009,
  EMSP: 977,
  IMSP: 914,
  ORS: 1160,
};

export const SCOPE_OPTIONS = [
  { code: 'EA', name: 'Agriculture', type: 'external', baseNumber: 1087 },
  { code: 'IA', name: 'Agriculture', type: 'internal', baseNumber: 905 },
  { code: 'ECBE', name: 'Chemistry Biology Environmental Science', type: 'external', baseNumber: 1285 },
  { code: 'ICBE', name: 'Chemistry Biology Environmental Science', type: 'internal', baseNumber: 942 },
  { code: 'EECT', name: 'Engineering, Communication, Technology', type: 'external', baseNumber: 1458 },
  { code: 'IECT', name: 'Engineering, Communication, Technology', type: 'internal', baseNumber: 1009 },
  { code: 'EMSP', name: 'Mathematics, Statistics, and Physics', type: 'external', baseNumber: 977 },
  { code: 'IMSP', name: 'Mathematics, Statistics, and Physics', type: 'internal', baseNumber: 914 },
  { code: 'ORS', name: 'Other Related Studies', type: 'other', baseNumber: 1160 },
];

const StaffUpload: React.FC = () => {
  const navigate = useNavigate();
  const { editors } = useEditors();
  const { addManuscript } = useRecords();
  const { updateStats } = useDashboard();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [manuscriptDetails, setManuscriptDetails] = useState<ManuscriptDetails>({
    id: '',
    title: '',
    authors: '',
    scope: '',
    scopeType: 'external',
    scopeCode: '',
    date: '',
    email: '',
    affiliation: '',
    editor: '',
    status: 'pre-review',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scopeCheckResult, setScopeCheckResult] = useState('');
  const [grammarCheckResult, setGrammarCheckResult] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setManuscriptDetails({ ...manuscriptDetails, [name]: value });
  };

  const generateScopeId = (scopeCode: string): string => {
    const scopePrefix = scopeCode.split('-')[0];
    scopeCounters[scopePrefix] = (scopeCounters[scopePrefix] || 1000) + 1;
    return `${scopePrefix}${scopeCounters[scopePrefix]}`;
  };

  const handleScopeChange = (scopeCode: string) => {
    const [prefix] = scopeCode.split('-');
    const selectedScope = SCOPE_OPTIONS.find(option => option.code === prefix);
    if (selectedScope) {
      const newScopeId = generateScopeId(prefix);
      setManuscriptDetails({
        ...manuscriptDetails,
        scopeCode: newScopeId,
        scope: selectedScope.name,
        scopeType: selectedScope.type as 'internal' | 'external'
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = () => {
    const newManuscript = {
      ...manuscriptDetails,
      id: manuscriptDetails.scopeCode,
      status: 'pre-review' as const,
    };
    addManuscript(newManuscript);
    updateStats();
    setShowConfirmation(false);
    setIsModalOpen(false);
    setIsSuccessModalOpen(true);
    setManuscriptDetails({
      id: '',
      title: '',
      authors: '',
      scope: '',
      scopeType: 'external',
      scopeCode: '',
      date: '',
      email: '',
      affiliation: '',
      editor: '',
      status: 'pre-review',
    });
    setSelectedFile(null);
  };

  const handleScopeCheck = () => {
    setScopeCheckResult('Checking scope compatibility...\nField: Environmental Science\nStatus: Compatible\nRecommendation: Proceed with submission');
  };

  const handleGrammarCheck = () => {
    setGrammarCheckResult('Grammar check complete...\nSpelling: 100%\nGrammar: 98%\nReadability: High\nSuggested improvements: 2 minor edits');
  };

  const handleViewRecords = () => {
    setShowConfirmation(true);
  };

  const handleConfirmViewRecords = () => {
    setShowConfirmation(false);
    setIsSuccessModalOpen(false);
    navigate('/staff/pre-review/records');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Upload File</h3>
      <div className="mb-6 flex justify-center">
        <div 
          className="w-32 h-32 bg-yellow-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-yellow-300 transition-colors"
          onClick={handleUploadClick}
        >
          <Upload size={48} className="text-blue-500 mb-2" />
          <span className="text-sm text-center">Click to upload PDF or DOCX</span>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx"
            className="hidden"
          />
        </div>
      </div>
      {selectedFile && (
        <p className="text-center mb-4">Selected file: {selectedFile.name}</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h4 className="text-lg font-semibold mb-2 flex items-center">
            <Search className="mr-2" size={20} />
            Scope Check result:
          </h4>
          <div className="h-64 bg-white rounded p-3 mb-2 overflow-y-auto whitespace-pre-line text-base">
            {scopeCheckResult || 'No scope check performed yet'}
          </div>
          <button
            onClick={handleScopeCheck}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors w-full"
          >
            Perform Scope Check
          </button>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <h4 className="text-lg font-semibold mb-2 flex items-center">
            <Search className="mr-2" size={20} />
            Grammar check results:
          </h4>
          <div className="h-64 bg-white rounded p-3 mb-2 overflow-y-auto whitespace-pre-line text-base">
            {grammarCheckResult || 'No grammar check performed yet'}
          </div>
          <button
            onClick={handleGrammarCheck}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors w-full"
          >
            Perform Grammar Check
          </button>
        </div>
      </div>
      <div className="flex justify-center">
        <button
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
          onClick={() => setIsModalOpen(true)}
        >
          Proceed
        </button>
      </div>
      {/* Add Manuscript Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[600px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Manuscript Details</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <input
                  type="text"
                  name="title"
                  value={manuscriptDetails.title}
                  onChange={handleInputChange}
                  placeholder="Manuscript Title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <textarea
                  name="authors"
                  value={manuscriptDetails.authors}
                  onChange={handleInputChange}
                  placeholder="Author/s"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Scope or Field</label>
                <div className="space-y-2">
                  {SCOPE_OPTIONS.map((option) => (
                    <div key={option.code} className="flex items-center">
                      <input
                        type="radio"
                        id={option.code}
                        name="scopeCode"
                        value={`${option.code}-${option.type}`}
                        checked={manuscriptDetails.scopeCode.startsWith(option.code)}
                        onChange={(e) => handleScopeChange(e.target.value)}
                        className="mr-2"
                      />
                      <label htmlFor={option.code} className="text-sm text-gray-700">
                        {`${option.code} - ${option.type.charAt(0).toUpperCase() + option.type.slice(1)} ${option.name}`}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <input
                  type="date"
                  name="date"
                  value={manuscriptDetails.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="email"
                  name="email"
                  value={manuscriptDetails.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  name="affiliation"
                  value={manuscriptDetails.affiliation}
                  onChange={handleInputChange}
                  placeholder="Affiliation"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Editor</label>
                <select
                  name="editor"
                  value={manuscriptDetails.editor}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Editor</option>
                  {editors.map((editor) => (
                    <option key={editor.id} value={`${editor.firstName} ${editor.lastName}`}>
                      {`${editor.firstName} ${editor.lastName} - ${editor.position} (${editor.department})`}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
              >
                Save Details
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <div className="mb-4">
              <h3 className="text-xl font-semibold">Confirm Submission</h3>
              <p className="text-gray-600 mt-2">Are you sure you want to save this manuscript?</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
              >
                No
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Success</h3>
              <button onClick={() => setIsSuccessModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div>
                <h4 className="text-lg font-semibold">Manuscript Added Successfully</h4>
                <p className="text-green-600">Scope: {manuscriptDetails.scope}</p>
              </div>
            </div>
            <button
              onClick={() => setIsSuccessModalOpen(false)}
              className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffUpload;