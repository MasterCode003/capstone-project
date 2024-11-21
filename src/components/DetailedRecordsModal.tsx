import React from 'react';
import { X } from 'lucide-react';
import { useRecords } from '../contexts/RecordContext';

interface DetailedRecordsModalProps {
  cardId: string;
  cardTitle: string;
  onClose: () => void;
  isDirector?: boolean;
}

const DetailedRecordsModal: React.FC<DetailedRecordsModalProps> = ({ 
  cardId, 
  cardTitle, 
  onClose,
  isDirector = false 
}) => {
  const { 
    manuscriptRecords, 
    doubleBlindRecords, 
    acceptedRecords,
    finalProofreadingRecords,
    publishedRecords,
    rejectedRecords 
  } = useRecords();

  const getRecordsByType = () => {
    switch (cardId) {
      case 'pre-review':
        return manuscriptRecords;
      case 'double-blind':
        return doubleBlindRecords;
      case 'accepted':
        return isDirector ? [] : acceptedRecords;
      case 'published':
        return publishedRecords;
      case 'rejected':
        return rejectedRecords;
      case 'pending':
        return manuscriptRecords.filter(record => !record.status || record.status === 'pending');
      case 'final-proofreading':
        return finalProofreadingRecords;
      default:
        return [];
    }
  };

  const records = getRecordsByType();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[800px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">{cardTitle} Details</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        <div className="overflow-x-auto">
          {records.length > 0 ? (
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left">File Code</th>
                  <th className="py-2 px-4 text-left">Title</th>
                  <th className="py-2 px-4 text-left">Author</th>
                  <th className="py-2 px-4 text-left">Date</th>
                  <th className="py-2 px-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4">{record.scopeCode}</td>
                    <td className="py-2 px-4">{record.title}</td>
                    <td className="py-2 px-4">{record.authors}</td>
                    <td className="py-2 px-4">{record.date}</td>
                    <td className="py-2 px-4">
                      {record.revisionStatus ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          {record.revisionStatus}
                        </span>
                      ) : (
                        record.status || 'Pending'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-500 py-4">No records available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailedRecordsModal;