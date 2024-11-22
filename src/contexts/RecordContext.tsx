import React, { createContext, useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

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
  status: 'pre-review' | 'double-blind' | 'rejected' | 'accepted' | 'final-proofreading' | 'published';
  revisionStatus?: string;
  rejectionReason?: string;
  rejectionComment?: string;
  layoutDetails?: {
    dateAccepted: string;
    layoutArtist: string;
    status: 'pending' | 'in-progress' | 'completed' | 'revised';
    revisionStatus?: string;
  };
  proofreadingDetails?: {
    dateSent: string;
    proofreader: string;
    status: 'pending' | 'in-progress' | 'completed';
    revisionStatus?: string;
  };
  publishDetails?: {
    scopeNumber: string;
    volumeYear: string;
    datePublished: string;
    paymentStatus?: 'paid' | 'not-paid';
  };
}

interface RecordContextType {
  manuscriptRecords: ManuscriptDetails[];
  doubleBlindRecords: ManuscriptDetails[];
  rejectedRecords: ManuscriptDetails[];
  acceptedRecords: ManuscriptDetails[];
  finalProofreadingRecords: ManuscriptDetails[];
  publishedRecords: ManuscriptDetails[];
  addManuscript: (manuscript: ManuscriptDetails) => void;
  updateManuscriptStatus: (id: string, status: ManuscriptDetails['status'], details?: Partial<ManuscriptDetails>) => void;
  updateLayoutDetails: (id: string, layoutDetails: ManuscriptDetails['layoutDetails']) => void;
  updateProofreadingDetails: (id: string, proofreadingDetails: ManuscriptDetails['proofreadingDetails']) => void;
  updatePaymentStatus: (id: string, paymentStatus: 'paid' | 'not-paid') => void;
  removeFromPreReview: (id: string) => void;
}

const RecordContext = createContext<RecordContextType>({
  manuscriptRecords: [],
  doubleBlindRecords: [],
  rejectedRecords: [],
  acceptedRecords: [],
  finalProofreadingRecords: [],
  publishedRecords: [],
  addManuscript: () => {},
  updateManuscriptStatus: () => {},
  updateLayoutDetails: () => {},
  updateProofreadingDetails: () => {},
  updatePaymentStatus: () => {},
  removeFromPreReview: () => {},
});

export const useRecords = () => useContext(RecordContext);

export const RecordProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [manuscriptRecords, setManuscriptRecords] = useLocalStorage<ManuscriptDetails[]>('manuscriptRecords', []);
  const [doubleBlindRecords, setDoubleBlindRecords] = useLocalStorage<ManuscriptDetails[]>('doubleBlindRecords', []);
  const [rejectedRecords, setRejectedRecords] = useLocalStorage<ManuscriptDetails[]>('rejectedRecords', []);
  const [acceptedRecords, setAcceptedRecords] = useLocalStorage<ManuscriptDetails[]>('acceptedRecords', []);
  const [finalProofreadingRecords, setFinalProofreadingRecords] = useLocalStorage<ManuscriptDetails[]>('finalProofreadingRecords', []);
  const [publishedRecords, setPublishedRecords] = useLocalStorage<ManuscriptDetails[]>('publishedRecords', []);

  const addManuscript = (manuscript: ManuscriptDetails) => {
    setManuscriptRecords((prev: ManuscriptDetails[]) => [...prev, manuscript]);
  };

  const removeFromPreReview = (id: string) => {
    setManuscriptRecords((prev: ManuscriptDetails[]) => prev.filter((m: ManuscriptDetails) => m.id !== id));
  };

  const updateLayoutDetails = (id: string, layoutDetails: ManuscriptDetails['layoutDetails']) => {
    setAcceptedRecords((prev: ManuscriptDetails[]) => prev.map(record => 
      record.id === id ? { ...record, layoutDetails } : record
    ));
  };

  const updateProofreadingDetails = (id: string, proofreadingDetails: ManuscriptDetails['proofreadingDetails']) => {
    setFinalProofreadingRecords(prev => prev.map(record => 
      record.id === id ? { ...record, proofreadingDetails } : record
    ));
  };

  const updatePaymentStatus = (id: string, paymentStatus: 'paid' | 'not-paid') => {
    setPublishedRecords(prev => prev.map(record => 
      record.id === id ? {
        ...record,
        publishDetails: {
          ...record.publishDetails,
          paymentStatus
        }
      } : record
    ));
  };

  const updateManuscriptStatus = (
    id: string,
    status: ManuscriptDetails['status'],
    details?: Partial<ManuscriptDetails>
  ) => {
    const manuscript = manuscriptRecords.find(m => m.id === id) ||
                      doubleBlindRecords.find(m => m.id === id) ||
                      acceptedRecords.find(m => m.id === id) ||
                      finalProofreadingRecords.find(m => m.id === id);

    if (!manuscript) return;

    const updatedManuscript = { ...manuscript, ...details, status };

    // Remove from current list
    if (manuscript.status === 'pre-review') {
      setManuscriptRecords(prev => prev.filter(m => m.id !== id));
    } else if (manuscript.status === 'double-blind') {
      setDoubleBlindRecords(prev => prev.filter(m => m.id !== id));
    } else if (manuscript.status === 'accepted') {
      setAcceptedRecords(prev => prev.filter(m => m.id !== id));
    } else if (manuscript.status === 'final-proofreading') {
      setFinalProofreadingRecords(prev => prev.filter(m => m.id !== id));
    }

    // Add to appropriate list based on status
    switch (status) {
      case 'double-blind':
        setDoubleBlindRecords((prev: ManuscriptDetails[]) => [...prev, updatedManuscript]);
        break;
      case 'rejected':
        setRejectedRecords((prev: ManuscriptDetails[]) => [...prev, updatedManuscript]);
        break;
      case 'accepted':
        setAcceptedRecords((prev: ManuscriptDetails[]) => [...prev, updatedManuscript]);
        break;
      case 'final-proofreading':
        setFinalProofreadingRecords((prev: ManuscriptDetails[]) => [...prev, updatedManuscript]);
        break;
      case 'published':
        setPublishedRecords((prev: ManuscriptDetails[]) => [...prev, {
          ...updatedManuscript,
          publishDetails: {
            ...updatedManuscript.publishDetails,
            paymentStatus: 'not-paid'
          }
        }]);
        break;
    }
  };
  return (
    <RecordContext.Provider value={{
      manuscriptRecords,
      doubleBlindRecords,
      rejectedRecords,
      acceptedRecords,
      finalProofreadingRecords,
      publishedRecords,
      addManuscript,
      updateManuscriptStatus,
      updateLayoutDetails,
      updateProofreadingDetails,
      updatePaymentStatus,
      removeFromPreReview,
    }}>
      {children}
    </RecordContext.Provider>
  );
};

export default RecordContext;