import React, { useState, useEffect } from 'react';
import { Eye, X } from 'lucide-react';
import { useRecords } from '../contexts/RecordContext';
import SearchBar from './SearchBar';

const StaffLayouting: React.FC = () => {
  const { acceptedRecords, updateLayoutDetails, updateManuscriptStatus } = useRecords();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviseModalOpen, setIsReviseModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [dateFinished, setDateFinished] = useState('');
  const [proofreader, setProofreader] = useState('');
  const [proofreaderEmail, setProofreaderEmail] = useState('');
  const [revisionComments, setRevisionComments] = useState('');
  const [missingFields, setMissingFields] = useState<string[]>([]);

  // Filter only records that have layout details
  const layoutRecords = acceptedRecords.filter(record => record.layoutDetails);

  const filteredRecords = layoutRecords.filter(record => 
    record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.scopeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.layoutDetails?.layoutArtist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (record: any) => {
    setSelectedRecord(record);
    setDateFinished(new Date().toISOString().split('T')[0]);
    setProofreader('');
    setProofreaderEmail('');
    setIsModalOpen(true);
  };

  const handleRevise = () => {
    if (selectedRecord && revisionComments) {
      // Get the current record from acceptedRecords
      const currentRecord = acceptedRecords.find(record => record.id === selectedRecord.id);
      if (!currentRecord) return;

      // Create updated layout details while preserving ALL layout information
      const updatedLayoutDetails = {
        ...currentRecord.layoutDetails,
        status: 'revised',
        revisionComments,
        layoutArtist: currentRecord.layoutDetails?.layoutArtist || '',
        layoutArtistEmail: currentRecord.layoutDetails?.layoutArtistEmail || '',
        dateAccepted: currentRecord.layoutDetails?.dateAccepted || '',
        dateFinished: currentRecord.layoutDetails?.dateFinished || ''
      };

      // Create complete updated record
      const updatedRecord = {
        ...currentRecord,
        layoutDetails: updatedLayoutDetails,
        revisionComments,
        firstRevisionDate: currentRecord.firstRevisionDate || new Date().toISOString().split('T')[0]
      };

      // Update the record in context
      updateLayoutDetails(selectedRecord.id, updatedRecord);
      
      // Close the modal and reset only the revision comments
      setRevisionComments('');
      setIsReviseModalOpen(false);
    }
  };

  useEffect(() => {
    if (selectedRecord?.layoutDetails) {
      const { layoutArtist, layoutArtistEmail } = selectedRecord.layoutDetails;
      if (layoutArtist && layoutArtistEmail) {
        setSelectedRecord(prevRecord => ({
          ...prevRecord,
          layoutDetails: {
            ...prevRecord?.layoutDetails,
            layoutArtist,
            layoutArtistEmail
          }
        }));
      }
    }
  }, [selectedRecord?.id]);

  const handleProceedToFPR = () => {
    if (selectedRecord && dateFinished && proofreader && proofreaderEmail) {
      // Preserve all the existing layout details
      const updatedManuscript = {
        ...selectedRecord,
        proofreadingDetails: {
          dateSent: dateFinished,
          proofreader,
          proofreaderEmail,
          status: 'pending',
          revisionStatus: selectedRecord.layoutDetails?.revisionStatus,
          revisionComments: selectedRecord.layoutDetails?.revisionComments
        },
        layoutDetails: {
          ...selectedRecord.layoutDetails!,
          dateFinished,
          layoutArtist: selectedRecord.layoutDetails!.layoutArtist,
          layoutArtistEmail: selectedRecord.layoutDetails!.layoutArtistEmail
        }
      };

      // Update the manuscript status
      updateManuscriptStatus(selectedRecord.id, 'final-proofreading', updatedManuscript);
      
      // Reset form fields
      setIsModalOpen(false);
      setDateFinished('');
      setProofreader('');
      setProofreaderEmail('');
      setMissingFields([]);
    }
  };

  const handleConfirmProceedToFPR = () => {
    const missing = [];
    if (!dateFinished) missing.push('Date Finished');
    if (!proofreader) missing.push('Proofreader Name');
    if (!proofreaderEmail) missing.push('Proofreader Email');

    if (missing.length > 0) {
      setMissingFields(missing);
      return;
    }

    handleProceedToFPR();
    setIsConfirmationModalOpen(false);
    setMissingFields([]);
  };

  const validateFields = () => {
    const missing = [];
    if (!dateFinished) missing.push('Date Finished');
    if (!proofreader) missing.push('Proofreader Name');
    if (!proofreaderEmail) missing.push('Proofreader Email');
    setMissingFields(missing);
    return missing.length === 0;
  };

  const handleProceedToFPRClick = () => {
    if (validateFields()) {
      setIsConfirmationModalOpen(true);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Records</h3>
      <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">File Code</th>
              <th className="py-3 px-4 text-left">Journal/Research Title</th>
              <th className="py-3 px-4 text-left">Author</th>
              <th className="py-3 px-4 text-left">Date Accepted</th>
              <th className="py-3 px-4 text-left">Layout Artist</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredRecords.map((record, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-4 px-4">{record.scopeCode}</td>
                <td className="py-4 px-4">{record.title}</td>
                <td className="py-4 px-4">{record.authors}</td>
                <td className="py-4 px-4">{record.layoutDetails?.dateAccepted}</td>
                <td className="py-4 px-4">
                  <div>
                    <p>{record.layoutDetails?.layoutArtist}</p>
                    <p className="text-sm text-gray-500">{record.layoutDetails?.layoutArtistEmail}</p>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    record.layoutDetails?.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : record.layoutDetails?.status === 'revised'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {record.layoutDetails?.status === 'completed' 
                      ? 'Completed' 
                      : record.layoutDetails?.status === 'revised'
                      ? 'Revised'
                      : 'In Progress'}
                  </span>
                  {record.layoutDetails?.revisionComments && (
                    <button
                      onClick={() => {
                        setSelectedRecord(record);
                        setIsStatusModalOpen(true);
                      }}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm hover:bg-gray-200 transition-colors"
                    >
                      View Comments
                    </button>
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

      {/* Layout Details Modal */}
      {isModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[800px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Layout Details</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            {/* Top section - Basic Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="font-semibold block">File Code:</label>
                <p className="text-gray-700">{selectedRecord.scopeCode}</p>
              </div>
              <div>
                <label className="font-semibold block">Field/Scope:</label>
                <p className="text-gray-700">{`${selectedRecord.scopeType.charAt(0).toUpperCase() + selectedRecord.scopeType.slice(1)} ${selectedRecord.scope}`}</p>
              </div>
              <div className="col-span-2">
                <label className="font-semibold block">Journal/Research Title:</label>
                <p className="text-gray-700">{selectedRecord.title}</p>
              </div>
              <div>
                <label className="font-semibold block">Author/s:</label>
                <p className="text-gray-700">{selectedRecord.authors}</p>
              </div>
              <div>
                <label className="font-semibold block">Layout Artist:</label>
                <p className="text-gray-700">{selectedRecord.layoutDetails?.layoutArtist}</p>
              </div>
              <div>
                <label className="font-semibold block">Layout Artist Email:</label>
                <p className="text-gray-700">{selectedRecord.layoutDetails?.layoutArtistEmail}</p>
              </div>
            </div>

            {/* Middle section - Status and Dates */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="font-semibold block">Status:</label>
                <div className="space-y-2">
                  {selectedRecord.layoutDetails?.revisionComments && (
                    <button
                      onClick={() => {
                        setSelectedRecord(selectedRecord);
                        setIsStatusModalOpen(true);
                      }}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm hover:bg-gray-200 transition-colors"
                    >
                      View Comments
                    </button>
                  )}
                </div>
              </div>
              {selectedRecord.firstRevisionDate && (
                <div>
                  <label className="font-semibold block">First Revision Date:</label>
                  <p className="text-gray-700">{selectedRecord.firstRevisionDate}</p>
                </div>
              )}
            </div>

            {/* Form section */}
            <div className="border-t pt-4">
              {missingFields.length > 0 && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 font-medium mb-2">Please fill out the following required fields:</p>
                  <ul className="list-disc list-inside text-red-600">
                    {missingFields.map((field, index) => (
                      <li key={index}>{field}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date Finished
                    </label>
                    <input
                      type="date"
                      value={dateFinished}
                      onChange={(e) => setDateFinished(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Proofreader Name
                    </label>
                    <input
                      type="text"
                      value={proofreader}
                      onChange={(e) => setProofreader(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter proofreader name"
                      required
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Proofreader Email
                    </label>
                    <input
                      type="email"
                      value={proofreaderEmail}
                      onChange={(e) => setProofreaderEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter proofreader email"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setMissingFields([]);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={handleProceedToFPRClick}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Proceed to FPR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {isReviseModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Revise Layout</h3>
              <button
                onClick={() => setIsReviseModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            {/* Layout Artist Information Section - Always visible */}
            <div className="mb-6 p-4 bg-gray-50 rounded-md">
              <h4 className="text-md font-semibold mb-3">Layout Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Layout Artist:</label>
                  <p className="text-gray-800">{selectedRecord.layoutDetails?.layoutArtist}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Email:</label>
                  <p className="text-gray-800">{selectedRecord.layoutDetails?.layoutArtistEmail}</p>
                </div>
              </div>
            </div>
            {/* Revision Section */}
            <div className="space-y-4">
              <div>
                <h4 className="text-md font-semibold mb-2">Manuscript Title:</h4>
                <p className="text-gray-700">{selectedRecord.title}</p>
              </div>
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
                onClick={() => setIsReviseModalOpen(false)}
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

      {/* Confirmation Modal */}
      {isConfirmationModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Confirm Proceed to Final Proofreading</h3>
              <button onClick={() => setIsConfirmationModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-700">Are you sure you want to proceed with this manuscript to Final Proofreading?</p>
              {missingFields.length > 0 && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 font-medium mb-2">Please fill out the following required fields:</p>
                  <ul className="list-disc list-inside text-red-600">
                    {missingFields.map((field, index) => (
                      <li key={index}>{field}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Manuscript Details:</h4>
                <p className="text-gray-700"><span className="font-medium">Title:</span> {selectedRecord.title}</p>
                <p className="text-gray-700"><span className="font-medium">Author(s):</span> {selectedRecord.authors}</p>
                <p className="text-gray-700"><span className="font-medium">Proofreader:</span> {proofreader}</p>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsConfirmationModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmProceedToFPR}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {isStatusModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Layout Status</h3>
              <button onClick={() => setIsStatusModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Manuscript Title:</h4>
                <p className="text-gray-700">{selectedRecord.title}</p>
              </div>
              {selectedRecord.firstRevisionDate && (
                <div>
                  <h4 className="font-semibold mb-2">First Revision Date:</h4>
                  <p className="text-gray-700">{selectedRecord.firstRevisionDate}</p>
                </div>
              )}
              {selectedRecord.layoutDetails?.revisionComments && (
                <div>
                  <h4 className="font-semibold mb-2">Revision Comments:</h4>
                  <p className="text-gray-700">{selectedRecord.layoutDetails.revisionComments}</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsStatusModalOpen(false)}
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

export default StaffLayouting;