import React, { useState } from 'react';
import { Eye, X } from 'lucide-react';
import { useRecords } from '../contexts/RecordContext';
import { useReviewers } from '../contexts/ReviewersContext';
import SearchBar from './SearchBar';

const StaffRecords: React.FC = () => {
  const { manuscriptRecords, updateManuscriptStatus } = useRecords();
  const { reviewers } = useReviewers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isReviseModalOpen, setIsReviseModalOpen] = useState(false);
  const [isReviewerModalOpen, setIsReviewerModalOpen] = useState(false);
  const [selectedManuscript, setSelectedManuscript] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [revisionStatus, setRevisionStatus] = useState('');
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>(['', '', '']);
  const [rejectionDetails, setRejectionDetails] = useState({
    reason: '',
    comment: ''
  });
  const [reviewerError, setReviewerError] = useState('');

  const revisionOptions = [
    'Accepted with revision',
    'Not acceptable',
    'Accepted',
    'Excellent'
  ];

  const rejectionReasons = [
    'Out of Scope',
    'Irrelevant',
    'High Plagiarism Rate',
    'Withdrawn by the Author',
    'Poor Adherence'
  ];

  const filteredRecords = manuscriptRecords.filter(record => 
    record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.authors?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.scope.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.scopeCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (manuscript: any) => {
    setSelectedManuscript(manuscript);
    setIsModalOpen(true);
  };

  const handleRevise = () => {
    if (selectedManuscript && revisionStatus) {
      const updatedManuscript = {
        ...selectedManuscript,
        revisionStatus
      };
      updateManuscriptStatus(selectedManuscript.id, 'pre-review', updatedManuscript);
      setIsReviseModalOpen(false);
      setRevisionStatus('');
    }
  };

  const handleReject = () => {
    if (selectedManuscript && rejectionDetails.reason) {
      const updatedManuscript = {
        ...selectedManuscript,
        rejectionReason: rejectionDetails.reason,
        rejectionComment: rejectionDetails.comment,
        date: new Date().toISOString().split('T')[0]
      };
      updateManuscriptStatus(selectedManuscript.id, 'rejected', updatedManuscript);
      setIsRejectModalOpen(false);
      setRejectionDetails({ reason: '', comment: '' });
    }
  };

  const handleProceedToDBR = () => {
    const filledReviewers = selectedReviewers.filter(r => r !== '');
    if (filledReviewers.length !== 3) {
      setReviewerError('Please select exactly 3 reviewers');
      return;
    }
    
    if (selectedManuscript) {
      const updatedManuscript = {
        ...selectedManuscript,
        reviewers: filledReviewers
      };
      updateManuscriptStatus(selectedManuscript.id, 'double-blind', updatedManuscript);
      setIsReviewerModalOpen(false);
      setSelectedReviewers(['', '', '']);
      setReviewerError('');
    }
  };

  const handleReviewerSelection = (index: number, reviewerName: string) => {
    const newSelectedReviewers = [...selectedReviewers];
    newSelectedReviewers[index] = reviewerName;
    setSelectedReviewers(newSelectedReviewers);
    setReviewerError('');
  };

  const getReviewerDisplayName = (reviewer: any) => {
    return `${reviewer.firstName} ${reviewer.lastName} - ${reviewer.fieldOfReview}`;
  };

  const availableReviewers = reviewers.filter(reviewer => 
    !selectedReviewers.includes(getReviewerDisplayName(reviewer))
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Pre-Review Records</h3>
      <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">File Code</th>
              <th className="py-3 px-4 text-left">Journal/Research Title</th>
              <th className="py-3 px-4 text-left">Field/Scope</th>
              <th className="py-3 px-4 text-left">Date Submitted</th>
              <th className="py-3 px-4 text-left">Authors</th>
              <th className="py-3 px-4 text-left">Affiliation</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredRecords.map((record, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-4 px-4">{record.scopeCode}</td>
                <td className="py-4 px-4">{record.title}</td>
                <td className="py-4 px-4">{`${record.scopeType.charAt(0).toUpperCase() + record.scopeType.slice(1)} ${record.scope}`}</td>
                <td className="py-4 px-4">{record.date}</td>
                <td className="py-4 px-4">{record.authors}</td>
                <td className="py-4 px-4">{record.affiliation}</td>
                <td className="py-4 px-4">
                  {record.revisionStatus && (
                    <span className="px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      {record.revisionStatus}
                    </span>
                  )}
                </td>
                <td className="py-4 px-4">
                  <button
                    onClick={() => handleViewDetails(record)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors inline-flex items-center"
                  >
                    <Eye size={16} className="mr-1" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {isModalOpen && selectedManuscript && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[600px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Manuscript Details</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="font-semibold block">File Code:</label>
                <p className="text-gray-700">{selectedManuscript.scopeCode}</p>
              </div>
              <div>
                <label className="font-semibold block">Manuscript Title:</label>
                <p className="text-gray-700">{selectedManuscript.title}</p>
              </div>
              <div>
                <label className="font-semibold block">Author/s:</label>
                <p className="text-gray-700">{selectedManuscript.authors}</p>
              </div>
              <div>
                <label className="font-semibold block">Scope:</label>
                <p className="text-gray-700">{`${selectedManuscript.scopeType.charAt(0).toUpperCase() + selectedManuscript.scopeType.slice(1)} ${selectedManuscript.scope}`}</p>
              </div>
              <div>
                <label className="font-semibold block">Date:</label>
                <p className="text-gray-700">{selectedManuscript.date}</p>
              </div>
              <div>
                <label className="font-semibold block">Email:</label>
                <p className="text-gray-700">{selectedManuscript.email}</p>
              </div>
              <div>
                <label className="font-semibold block">Affiliation:</label>
                <p className="text-gray-700">{selectedManuscript.affiliation}</p>
              </div>
              <div>
                <label className="font-semibold block">Editor:</label>
                <p className="text-gray-700">{selectedManuscript.editor}</p>
              </div>
              {selectedManuscript.revisionStatus && (
                <div>
                  <label className="font-semibold block">Revision Status:</label>
                  <p className="text-gray-700">{selectedManuscript.revisionStatus}</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setIsRejectModalOpen(true);
                }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                Reject Manuscript
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setIsReviseModalOpen(true);
                }}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
              >
                Revise
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setIsReviewerModalOpen(true);
                }}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
              >
                Proceed to DBR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {isReviseModalOpen && selectedManuscript && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Revise Manuscript</h3>
              <button onClick={() => setIsReviseModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-2">Manuscript Title:</h4>
              <p className="text-gray-700">{selectedManuscript.title}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Revision Status
                </label>
                <select
                  value={revisionStatus}
                  onChange={(e) => setRevisionStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Status</option>
                  {revisionOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setIsReviseModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRevise}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                disabled={!revisionStatus}
              >
                Submit Revision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviewer Selection Modal */}
      {isReviewerModalOpen && selectedManuscript && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Select Reviewers</h3>
              <button onClick={() => setIsReviewerModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-2">Manuscript Title:</h4>
              <p className="text-gray-700">{selectedManuscript.title}</p>
              <p className="text-gray-600 mt-2">Scope: {selectedManuscript.scope}</p>
            </div>
            {reviewerError && (
              <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                {reviewerError}
              </div>
            )}
            <div className="space-y-6">
              {[0, 1, 2].map((index) => (
                <div key={index} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Reviewer {index + 1}
                  </label>
                  <select
                    value={selectedReviewers[index]}
                    onChange={(e) => handleReviewerSelection(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Reviewer</option>
                    {[
                      ...availableReviewers,
                      ...(selectedReviewers[index] ? [reviewers.find(r => getReviewerDisplayName(r) === selectedReviewers[index])] : [])
                    ].filter(Boolean).map((reviewer) => (
                      <option key={reviewer.id} value={getReviewerDisplayName(reviewer)}>
                        {getReviewerDisplayName(reviewer)}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setIsReviewerModalOpen(false);
                  setSelectedReviewers(['', '', '']);
                  setReviewerError('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleProceedToDBR}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                disabled={selectedReviewers.filter(r => r !== '').length !== 3}
              >
                Proceed to DBR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && selectedManuscript && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Reject Manuscript</h3>
              <button onClick={() => setIsRejectModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-2">Manuscript Title:</h4>
              <p className="text-gray-700">{selectedManuscript.title}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason
                </label>
                <select
                  value={rejectionDetails.reason}
                  onChange={(e) => setRejectionDetails({ ...rejectionDetails, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Reason</option>
                  {rejectionReasons.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Comments
                </label>
                <textarea
                  value={rejectionDetails.comment}
                  onChange={(e) => setRejectionDetails({ ...rejectionDetails, comment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Enter additional comments (optional)"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                disabled={!rejectionDetails.reason}
              >
                Reject Manuscript
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffRecords;