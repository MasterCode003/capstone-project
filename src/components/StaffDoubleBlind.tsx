import React, { useState } from 'react';
import { Eye, X } from 'lucide-react';
import { useRecords } from '../contexts/RecordContext';
import { useReviewers } from '../contexts/ReviewersContext';
import SearchBar from './SearchBar';
import { ManuscriptDetails, Status, UpdateDetails } from '../contexts/RecordContext';

interface ExtendedManuscriptDetails extends ManuscriptDetails {
  firstRevisionDate?: string;
  revisionComments?: string;
}

const StaffDoubleBlind: React.FC = () => {
  const { doubleBlindRecords, updateManuscriptStatus } = useRecords();
  const { reviewers } = useReviewers();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalState, setModalState] = useState<{
    isModalOpen: boolean;
    isRejectModalOpen: boolean;
    isLayoutModalOpen: boolean;
    isReviseModalOpen: boolean;
    isLayoutConfirmModalOpen: boolean;
    isStatusModalOpen: boolean;
  }>({
    isModalOpen: false,
    isRejectModalOpen: false,
    isLayoutModalOpen: false,
    isReviseModalOpen: false,
    isLayoutConfirmModalOpen: false,
    isStatusModalOpen: false,
  });
  const [selectedManuscript, setSelectedManuscript] = useState<ExtendedManuscriptDetails | null>(null);
  const [layoutArtist, setLayoutArtist] = useState('');
  const [layoutArtistEmail, setLayoutArtistEmail] = useState('');
  const [revisionComments, setRevisionComments] = useState('');
  const [rejectionComments, setRejectionComments] = useState('');
  const [firstRevisionDate, setFirstRevisionDate] = useState<string | null>(null);

  const filteredRecords = doubleBlindRecords.filter(record => 
    record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.authors?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.scope.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.scopeCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const closeAllModals = () => {
    setModalState({
      isModalOpen: false,
      isRejectModalOpen: false,
      isLayoutModalOpen: false,
      isReviseModalOpen: false,
      isLayoutConfirmModalOpen: false,
      isStatusModalOpen: false,
    });
  };

  const handleViewDetails = (manuscript: ManuscriptDetails) => {
    setSelectedManuscript(manuscript as ExtendedManuscriptDetails);
    setModalState(prev => ({ ...prev, isModalOpen: true }));
  };

  const handleProceedToLayout = () => {
    if (selectedManuscript && layoutArtist && layoutArtistEmail) {
      try {
        const acceptedManuscript: UpdateDetails = {
          status: 'accepted' as Status,
          layoutDetails: {
            layoutArtist,
            layoutArtistEmail,
            status: 'pending' as const
          }
        };
        updateManuscriptStatus(selectedManuscript.id, 'accepted', acceptedManuscript);
        closeAllModals();
        setLayoutArtist('');
        setLayoutArtistEmail('');
      } catch (error) {
        console.error('Error updating manuscript status:', error);
        // Handle error appropriately (e.g., show error message to user)
      }
    }
  };

  const handleProceedToLayoutConfirm = () => {
    setModalState(prev => ({
      ...prev,
      isLayoutModalOpen: false,
      isLayoutConfirmModalOpen: true
    }));
  };

  const handleRevise = () => {
    if (selectedManuscript && revisionComments) {
      try {
        const currentDate = new Date().toISOString().split('T')[0];
        const updatedManuscript: UpdateDetails = {
          revisionStatus: 'Acceptable with revision',
          revisionComments,
          firstRevisionDate: selectedManuscript.firstRevisionDate || currentDate
        };
        updateManuscriptStatus(selectedManuscript.id, 'double-blind', updatedManuscript);
        closeAllModals();
        setRevisionComments('');
      } catch (error) {
        console.error('Error updating manuscript status:', error);
        // Handle error appropriately
      }
    }
  };

  const handleReject = () => {
    if (selectedManuscript && rejectionComments) {
      try {
        const updatedManuscript: UpdateDetails = {
          rejectionComment: rejectionComments
        };
        updateManuscriptStatus(selectedManuscript.id, 'rejected', updatedManuscript);
        closeAllModals();
        setRejectionComments('');
      } catch (error) {
        console.error('Error updating manuscript status:', error);
        // Handle error appropriately
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Double-Blind Records</h3>
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
                  {record.revisionComments && (
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setSelectedManuscript(record);
                          setModalState(prev => ({ ...prev, isStatusModalOpen: true }));
                        }}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm hover:bg-gray-200 transition-colors"
                      >
                        View Status
                      </button>
                    </div>
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
      {modalState.isModalOpen && selectedManuscript && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[900px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Manuscript Details</h3>
              <button onClick={() => closeAllModals()} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="flex gap-6">
              <div className="flex-1 space-y-4">
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
              </div>
              
              <div className="w-[350px] border-l pl-6">
                <h4 className="text-lg font-semibold mb-4">Assigned Reviewers</h4>
                {selectedManuscript.reviewers && selectedManuscript.reviewers.length > 0 ? (
                  <div className="space-y-4">
                    {selectedManuscript.reviewers.map((reviewerId) => {
                      const reviewer = reviewers.find(r => r.id === Number(reviewerId));
                      return reviewer ? (
                        <div key={reviewer.id} className="bg-gray-50 p-4 rounded-lg border">
                          <p className="font-medium text-lg">{`${reviewer.firstName} ${reviewer.middleName ? reviewer.middleName + ' ' : ''}${reviewer.lastName}`}</p>
                          <div className="mt-2 space-y-1 text-gray-600">
                            <p className="flex items-center">
                              <span className="w-20 font-medium">Email:</span>
                              <span>{reviewer.email}</span>
                            </p>
                            <p className="flex items-center">
                              <span className="w-20 font-medium">Affiliation:</span>
                              <span>{reviewer.affiliation}</span>
                            </p>
                            <p className="flex items-center">
                              <span className="w-20 font-medium">Expertise:</span>
                              <span>{reviewer.fieldOfExpertise}</span>
                            </p>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No reviewers assigned yet</p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => {
                  closeAllModals();
                  setModalState(prev => ({ ...prev, isRejectModalOpen: true }));
                }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                Reject Manuscript
              </button>
              <button
                onClick={() => {
                  closeAllModals();
                  setModalState(prev => ({ ...prev, isReviseModalOpen: true }));
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Revise
              </button>
              <button
                onClick={() => {
                  closeAllModals();
                  setModalState(prev => ({ ...prev, isLayoutModalOpen: true }));
                }}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
              >
                Proceed to Layout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Layout Modal */}
      {modalState.isLayoutModalOpen && selectedManuscript && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Layouting Details</h3>
              <button onClick={() => closeAllModals()} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Manuscript Title:</h4>
                <p className="text-gray-700">{selectedManuscript.title}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Author/s:</h4>
                <p className="text-gray-700">{selectedManuscript.authors}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Layout Artist
                </label>
                <input
                  type="text"
                  value={layoutArtist}
                  onChange={(e) => setLayoutArtist(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter layout artist name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Layout Artist Email
                </label>
                <input
                  type="email"
                  value={layoutArtistEmail}
                  onChange={(e) => setLayoutArtistEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter layout artist email"
                  required
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => closeAllModals()}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleProceedToLayoutConfirm}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                disabled={!layoutArtist || !layoutArtistEmail}
              >
                Proceed To Layout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Layout Confirmation Modal */}
      {modalState.isLayoutConfirmModalOpen && selectedManuscript && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Confirm Layout Transition</h3>
              <button onClick={() => closeAllModals()} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to proceed with layouting for this manuscript?
              </p>
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-semibold mb-2">Manuscript Details:</h4>
                <div className="space-y-2">
                  <p><span className="font-medium">Title:</span> {selectedManuscript.title}</p>
                  <p><span className="font-medium">Author(s):</span> {selectedManuscript.authors}</p>
                  <p><span className="font-medium">Layout Artist:</span> {layoutArtist}</p>
                  <p><span className="font-medium">Layout Artist Email:</span> {layoutArtistEmail}</p>
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-md">
                <p className="text-yellow-800">
                  <span className="font-bold">Note:</span> Once you proceed to layout, this manuscript will be moved to the Staff Layouting section and can no longer be edited in the Double-Blind Review process.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => closeAllModals()}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleProceedToLayout();
                  closeAllModals();
                }}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
              >
                Confirm and Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {modalState.isReviseModalOpen && selectedManuscript && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Revise Manuscript</h3>
              <button onClick={() => closeAllModals()} className="text-gray-500 hover:text-gray-700">
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
                  Revision Comments
                </label>
                <textarea
                  value={revisionComments}
                  onChange={(e) => setRevisionComments(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Enter revision comments"
                  required
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => closeAllModals()}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRevise}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                disabled={!revisionComments}
              >
                Submit Revision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {modalState.isRejectModalOpen && selectedManuscript && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Reject Manuscript</h3>
              <button onClick={() => closeAllModals()} className="text-gray-500 hover:text-gray-700">
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
                  Rejection Comments
                </label>
                <textarea
                  value={rejectionComments}
                  onChange={(e) => setRejectionComments(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Enter rejection comments"
                  required
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => closeAllModals()}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                disabled={!rejectionComments}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {modalState.isStatusModalOpen && selectedManuscript && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Revision Status</h3>
              <button onClick={() => closeAllModals()} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Manuscript Title:</h4>
                <p className="text-gray-700">{selectedManuscript.title}</p>
              </div>
              {selectedManuscript.firstRevisionDate && (
                <div>
                  <h4 className="font-semibold mb-2">First Revision Date:</h4>
                  <p className="text-gray-700">{selectedManuscript.firstRevisionDate}</p>
                </div>
              )}
              {selectedManuscript.revisionComments && (
                <div>
                  <h4 className="font-semibold mb-2">Revision Comments:</h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedManuscript.revisionComments}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => closeAllModals()}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDoubleBlind;