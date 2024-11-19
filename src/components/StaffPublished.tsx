import React, { useState } from 'react';
import { Eye, X, DollarSign } from 'lucide-react';
import { useRecords } from '../contexts/RecordContext';
import SearchBar from './SearchBar';

const StaffPublished: React.FC = () => {
  const { publishedRecords, updatePaymentStatus } = useRecords();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'not-paid'>('not-paid');

  // Generate year options from 2025 to 2100
  const yearOptions = Array.from({ length: 76 }, (_, i) => (2025 + i).toString());

  const filteredRecords = publishedRecords.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.scope.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.scopeCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesYear = selectedYear === 'all' || 
      record.publishDetails?.volumeYear === selectedYear;

    return matchesSearch && matchesYear;
  });

  const handleViewDetails = (record: any) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handlePaymentStatus = (record: any) => {
    setSelectedRecord(record);
    setPaymentStatus(record.publishDetails?.paymentStatus || 'not-paid');
    setIsPaymentModalOpen(true);
  };

  const handleUpdatePaymentStatus = () => {
    if (selectedRecord) {
      updatePaymentStatus(selectedRecord.id, paymentStatus);
      setIsPaymentModalOpen(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Published Records</h3>
      <div className="mb-6">
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        
        {/* Year Filter */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <label className="text-sm font-medium text-gray-700 mr-2">Filter by Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Years</option>
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">File Code</th>
              <th className="py-3 px-4 text-left">Journal/Research Title</th>
              <th className="py-3 px-4 text-left">Field/Scope</th>
              <th className="py-3 px-4 text-left">Authors</th>
              <th className="py-3 px-4 text-left">Scope #</th>
              <th className="py-3 px-4 text-left">Volume Year</th>
              <th className="py-3 px-4 text-left">Date Published</th>
              <th className="py-3 px-4 text-left">Payment Status</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredRecords.map((record, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-4 px-4">{record.scopeCode}</td>
                <td className="py-4 px-4">{record.title}</td>
                <td className="py-4 px-4">{`${record.scopeType.charAt(0).toUpperCase() + record.scopeType.slice(1)} ${record.scope}`}</td>
                <td className="py-4 px-4">{record.authors}</td>
                <td className="py-4 px-4">{record.publishDetails?.scopeNumber}</td>
                <td className="py-4 px-4">{record.publishDetails?.volumeYear}</td>
                <td className="py-4 px-4">{record.publishDetails?.datePublished}</td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    record.publishDetails?.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {record.publishDetails?.paymentStatus === 'paid' ? 'Paid' : 'Not Paid'}
                  </span>
                </td>
                <td className="py-4 px-4 space-x-2">
                  <button
                    onClick={() => handleViewDetails(record)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors inline-flex items-center"
                  >
                    <Eye size={16} className="mr-1" />
                    View
                  </button>
                  <button
                    onClick={() => handlePaymentStatus(record)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors inline-flex items-center"
                  >
                    <DollarSign size={16} className="mr-1" />
                    Status
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
          <div className="bg-white p-6 rounded-lg w-[600px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Published Record Details</h3>
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
                <label className="font-semibold block">Title:</label>
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
              <div>
                <label className="font-semibold block">Scope Number:</label>
                <p className="text-gray-700">{selectedRecord.publishDetails?.scopeNumber}</p>
              </div>
              <div>
                <label className="font-semibold block">Volume Year:</label>
                <p className="text-gray-700">{selectedRecord.publishDetails?.volumeYear}</p>
              </div>
              <div>
                <label className="font-semibold block">Date Published:</label>
                <p className="text-gray-700">{selectedRecord.publishDetails?.datePublished}</p>
              </div>
              <div>
                <label className="font-semibold block">Payment Status:</label>
                <span className={`inline-block mt-1 px-2 py-1 rounded-full text-sm ${
                  selectedRecord.publishDetails?.paymentStatus === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedRecord.publishDetails?.paymentStatus === 'paid' ? 'Paid' : 'Not Paid'}
                </span>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Status Modal */}
      {isPaymentModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Update Payment Status</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-gray-500 hover:text-gray-700">
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
                  Payment Status
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="paid"
                      checked={paymentStatus === 'paid'}
                      onChange={() => setPaymentStatus('paid')}
                      className="mr-2"
                    />
                    <label htmlFor="paid">Paid</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="not-paid"
                      checked={paymentStatus === 'not-paid'}
                      onChange={() => setPaymentStatus('not-paid')}
                      className="mr-2"
                    />
                    <label htmlFor="not-paid">Not Paid</label>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePaymentStatus}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPublished;