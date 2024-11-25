import React, { useState } from 'react';
import { Eye, X } from 'lucide-react';
import { useRecords } from '../contexts/RecordContext';
import SearchBar from './SearchBar';

const StaffFinalProofreading: React.FC = () => {
  const { finalProofreadingRecords, updateManuscriptStatus } = useRecords();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isReviseModalOpen, setIsReviseModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [revisionComments, setRevisionComments] = useState('');
  const [publishDetails, setPublishDetails] = useState({
    scopeNumber: '',
    volumeYear: new Date().getFullYear().toString(),
    datePublished: new Date().toISOString().split('T')[0]
  });

  const scopeOptions = ['1', '2', 'Special Issue'];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 76 }, (_, i) => (currentYear + i).toString());

  const filteredRecords = finalProofreadingRecords.filter(record => 
    record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.scopeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.proofreadingDetails?.proofreader.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (record: any) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleRevise = () => {
    if (selectedRecord && revisionComments) {
      const updatedManuscript = {
        ...selectedRecord,
        proofreadingDetails: {
          ...selectedRecord.proofreadingDetails,
          status: 'revised',
          revisionComments
        }
      };
      updateManuscriptStatus(selectedRecord.id, 'final-proofreading', updatedManuscript);
      setIsReviseModalOpen(false);
      setRevisionComments('');
    }
  };

  const handlePublish = () => {
    if (selectedRecord && publishDetails.scopeNumber && publishDetails.volumeYear && publishDetails.datePublished) {
      const updatedManuscript = {
        ...selectedRecord,
        publishDetails: {
          ...publishDetails
        }
      };
      updateManuscriptStatus(selectedRecord.id, 'published', updatedManuscript);
      setIsPublishModalOpen(false);
      setPublishDetails({
        scopeNumber: '',
        volumeYear: new Date().getFullYear().toString(),
        datePublished: new Date().toISOString().split('T')[0]
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Final Proofreading Records</h3>
      <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">File Code</th>
              <th className="py-3 px-4 text-left">Journal/Research Title</th>
              <th className="py-3 px-4 text-left">Author</th>
              <th className="py-3 px-4 text-left">Date Sent</th>
              <th className="py-3 px-4 text-left">Proofreader</th>
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
                <td className="py-4 px-4">{record.proofreadingDetails?.dateSent}</td>
                <td className="py-4 px-4">{record.proofreadingDetails?.proofreader}</td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    record.proofreadingDetails?.status === 'revised'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {record.proofreadingDetails?.status === 'revised' 
                      ? 'Revised'
                      : 'In Progress'}
                  </span>
                  {record.proofreadingDetails?.revisionComments && (
                    <button
                      onClick={() => handleViewDetails(record)}
                      className="ml-2 bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm hover:bg-gray-200 transition-colors"
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

      {/* Details Modal */}
      {isModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[800px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Proofreading Details</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="font-semibold block">File Code:</label>
                <p className="text-gray-700">{selectedRecord.scopeCode}</p>
              </div>
              <div>
                <label className="font-semibold block">Journal/Research Title:</label>
                <p className="text-gray-700">{selectedRecord.title}</p>
              </div>
              <div>
                <label className="font-semibold block">Author/s:</label>
                <p className="text-gray-700">{selectedRecord.authors}</p>
              </div>
              <div>
                <label className="font-semibold block">Field/Scope:</label>
                <p className="text-gray-700">{`${selectedRecord.scopeType.charAt(0).toUpperCase() + selectedRecord.scopeType.slice(1)} ${selectedRecord.scope}`}</p>
              </div>

              {/* Layout Details Section */}
              <div className="mt-6 border-t pt-4">
                <h4 className="text-lg font-semibold mb-4">Layout Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block">Layout Artist:</label>
                    <p className="text-gray-700">{selectedRecord.layoutDetails?.layoutArtist}</p>
                  </div>
                  <div>
                    <label className="font-semibold block">Layout Artist Email:</label>
                    <p className="text-gray-700">{selectedRecord.layoutDetails?.layoutArtistEmail}</p>
                  </div>
                  <div>
                    <label className="font-semibold block">Date Finished:</label>
                    <p className="text-gray-700">{selectedRecord.layoutDetails?.dateFinished}</p>
                  </div>
                  {selectedRecord.layoutDetails?.revisionComments && (
                    <div className="col-span-2">
                      <label className="font-semibold block">Layout Revision Comments:</label>
                      <p className="text-gray-700">{selectedRecord.layoutDetails.revisionComments}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Proofreading Details Section */}
              <div className="mt-6 border-t pt-4">
                <h4 className="text-lg font-semibold mb-4">Proofreading Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block">Date Sent:</label>
                    <p className="text-gray-700">{selectedRecord.proofreadingDetails?.dateSent}</p>
                  </div>
                  <div>
                    <label className="font-semibold block">Proofreader:</label>
                    <p className="text-gray-700">{selectedRecord.proofreadingDetails?.proofreader}</p>
                  </div>
                  <div>
                    <label className="font-semibold block">Proofreader Email:</label>
                    <p className="text-gray-700">{selectedRecord.proofreadingDetails?.proofreaderEmail}</p>
                  </div>
                  {selectedRecord.proofreadingDetails?.revisionComments && (
                    <div className="col-span-2">
                      <label className="font-semibold block">Revision Comments:</label>
                      <p className="text-gray-700">{selectedRecord.proofreadingDetails.revisionComments}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Close
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
                  setIsPublishModalOpen(true);
                }}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revise Modal */}
      {isReviseModalOpen && selectedRecord && (
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
              <p className="text-gray-700">{selectedRecord.title}</p>
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
                onClick={() => setIsReviseModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRevise}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
                disabled={!revisionComments}
              >
                Submit Revision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Modal */}
      {isPublishModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Publish Manuscript</h3>
              <button onClick={() => setIsPublishModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-2">Manuscript Title:</h4>
              <p className="text-gray-700">{selectedRecord.title}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scope Number
                </label>
                <select
                  value={publishDetails.scopeNumber}
                  onChange={(e) => setPublishDetails({ ...publishDetails, scopeNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Scope Number</option>
                  {scopeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volume Year
                </label>
                <select
                  value={publishDetails.volumeYear}
                  onChange={(e) => setPublishDetails({ ...publishDetails, volumeYear: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Published
                </label>
                <input
                  type="date"
                  value={publishDetails.datePublished}
                  onChange={(e) => setPublishDetails({ ...publishDetails, datePublished: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                disabled={!publishDetails.scopeNumber || !publishDetails.volumeYear || !publishDetails.datePublished}
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffFinalProofreading;