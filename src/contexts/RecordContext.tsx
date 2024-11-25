import React, { createContext, useContext, Dispatch, SetStateAction } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

export type Status = 'pre-review' | 'double-blind' | 'rejected' | 'accepted' | 'final-proofreading' | 'published';
export type PaymentStatus = 'paid' | 'not-paid';

export interface LayoutDetails {
  layoutArtist: string;
  layoutArtistEmail: string;
  status: 'pending' | 'in-progress' | 'completed' | 'revised';
  revisionStatus?: string;
  revisionComments?: string;
  dateFinished?: string;
}

export interface ProofreadingDetails {
  dateSent: string;
  proofreader: string;
  proofreaderEmail: string;
  status: 'pending' | 'in-progress' | 'completed' | 'revised';
  revisionStatus?: string;
  revisionComments?: string;
}

export interface PublishDetails {
  issue: string;
  volumeNumber: string;
  year: string;
  datePublished: string;
  paymentStatus?: PaymentStatus;
}

export interface ManuscriptDetails {
  id: string;
  title: string;
  authors: string;
  scope: string;
  scopeType: 'internal' | 'external';
  scopeCode: string;
  affiliation: string;
  date: string;
  email: string;
  editor?: string;
  assistantEditor?: string;
  status: Status;
  revisionStatus?: string;
  rejectionReason?: string;
  rejectionComment?: string;
  grammarScore?: number;
  plagiarismScore?: number;
  reviewers?: string[];
  layoutDetails?: LayoutDetails;
  proofreadingDetails?: ProofreadingDetails;
  publishDetails?: PublishDetails;
  firstRevisionDate?: string;
  revisionComments?: string;
}

export type SetManuscriptRecords = Dispatch<SetStateAction<ManuscriptDetails[]>>;

export interface UpdateDetails {
  layoutDetails?: LayoutDetails;
  proofreadingDetails?: ProofreadingDetails;
  publishDetails?: Partial<PublishDetails>;
  revisionStatus?: string;
  rejectionReason?: string;
  rejectionComment?: string;
  reviewers?: string[];
  firstRevisionDate?: string;
  revisionComments?: string;
  status?: Status;
}

interface RecordContextType {
  manuscriptRecords: ManuscriptDetails[];
  doubleBlindRecords: ManuscriptDetails[];
  rejectedRecords: ManuscriptDetails[];
  acceptedRecords: ManuscriptDetails[];
  finalProofreadingRecords: ManuscriptDetails[];
  publishedRecords: ManuscriptDetails[];
  addManuscript: (manuscript: ManuscriptDetails) => void;
  updateManuscriptStatus: (id: string, status: Status, details?: UpdateDetails) => void;
  updateLayoutDetails: (id: string, layoutDetails: LayoutDetails) => void;
  updateProofreadingDetails: (id: string, proofreadingDetails: ProofreadingDetails) => void;
  updatePaymentStatus: (id: string, paymentStatus: PaymentStatus) => void;
  removeFromPreReview: (id: string) => void;
}

const defaultContext: RecordContextType = {
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
};

const RecordContext = createContext<RecordContextType>(defaultContext);

export const useRecords = () => useContext(RecordContext);

export const RecordProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [manuscriptRecords, setManuscriptRecords] = useLocalStorage<ManuscriptDetails[]>('manuscriptRecords', []);
  const [doubleBlindRecords, setDoubleBlindRecords] = useLocalStorage<ManuscriptDetails[]>('doubleBlindRecords', []);
  const [rejectedRecords, setRejectedRecords] = useLocalStorage<ManuscriptDetails[]>('rejectedRecords', []);
  const [acceptedRecords, setAcceptedRecords] = useLocalStorage<ManuscriptDetails[]>('acceptedRecords', []);
  const [finalProofreadingRecords, setFinalProofreadingRecords] = useLocalStorage<ManuscriptDetails[]>('finalProofreadingRecords', []);
  const [publishedRecords, setPublishedRecords] = useLocalStorage<ManuscriptDetails[]>('publishedRecords', []);

  const findManuscript = (id: string): { manuscript: ManuscriptDetails; listType: string } | null => {
    const inPreReview = manuscriptRecords.find(m => m.id === id);
    if (inPreReview) return { manuscript: inPreReview, listType: 'pre-review' };

    const inDoubleBlind = doubleBlindRecords.find(m => m.id === id);
    if (inDoubleBlind) return { manuscript: inDoubleBlind, listType: 'double-blind' };

    const inAccepted = acceptedRecords.find(m => m.id === id);
    if (inAccepted) return { manuscript: inAccepted, listType: 'accepted' };

    const inFinalProofreading = finalProofreadingRecords.find(m => m.id === id);
    if (inFinalProofreading) return { manuscript: inFinalProofreading, listType: 'final-proofreading' };

    const inRejected = rejectedRecords.find(m => m.id === id);
    if (inRejected) return { manuscript: inRejected, listType: 'rejected' };

    const inPublished = publishedRecords.find(m => m.id === id);
    if (inPublished) return { manuscript: inPublished, listType: 'published' };

    return null;
  };

  const removeFromCurrentList = (id: string, currentStatus: Status): void => {
    const updateRecords = (records: ManuscriptDetails[], setRecords: SetManuscriptRecords) => {
      setRecords(records.filter(m => m.id !== id));
    };

    switch (currentStatus) {
      case 'pre-review':
        updateRecords(manuscriptRecords, setManuscriptRecords);
        break;
      case 'double-blind':
        updateRecords(doubleBlindRecords, setDoubleBlindRecords);
        break;
      case 'accepted':
        updateRecords(acceptedRecords, setAcceptedRecords);
        break;
      case 'final-proofreading':
        updateRecords(finalProofreadingRecords, setFinalProofreadingRecords);
        break;
      case 'rejected':
        updateRecords(rejectedRecords, setRejectedRecords);
        break;
      case 'published':
        updateRecords(publishedRecords, setPublishedRecords);
        break;
    }
  };

  const addToNewList = (manuscript: ManuscriptDetails, newStatus: Status): void => {
    const updatedManuscript = {
      ...manuscript,
      status: newStatus,
      date: manuscript.date || new Date().toISOString()
    };

    const updateRecords = (setRecords: SetManuscriptRecords) => {
      setRecords(prev => [...prev, updatedManuscript]);
    };

    switch (newStatus) {
      case 'pre-review':
        updateRecords(setManuscriptRecords);
        break;
      case 'double-blind':
        updateRecords(setDoubleBlindRecords);
        break;
      case 'rejected':
        updateRecords(setRejectedRecords);
        break;
      case 'accepted':
        updateRecords(setAcceptedRecords);
        break;
      case 'final-proofreading':
        updateRecords(setFinalProofreadingRecords);
        break;
      case 'published':
        setPublishedRecords(prev => [...prev, {
          ...updatedManuscript,
          publishDetails: {
            ...updatedManuscript.publishDetails,
            datePublished: updatedManuscript.publishDetails?.datePublished || new Date().toISOString(),
            paymentStatus: 'not-paid'
          }
        }]);
        break;
    }
  };

  const addManuscript = (manuscript: ManuscriptDetails): void => {
    if (!manuscript.id || !manuscript.title) {
      console.error('Invalid manuscript data');
      return;
    }
    setManuscriptRecords((prev: ManuscriptDetails[]) => [...prev, manuscript]);
  };

  const updateLayoutDetails = (id: string, layoutDetails: LayoutDetails): void => {
    setAcceptedRecords((prev: ManuscriptDetails[]) => prev.map(record => 
      record.id === id ? { ...record, layoutDetails } : record
    ));
  };

  const updateProofreadingDetails = (id: string, proofreadingDetails: ProofreadingDetails): void => {
    setFinalProofreadingRecords((prev: ManuscriptDetails[]) => prev.map(record => 
      record.id === id ? { ...record, proofreadingDetails } : record
    ));
  };

  const updatePaymentStatus = (id: string, paymentStatus: PaymentStatus): void => {
    setPublishedRecords((prev: ManuscriptDetails[]) => prev.map(record => 
      record.id === id ? {
        ...record,
        publishDetails: {
          ...record.publishDetails,
          paymentStatus
        }
      } : record
    ));
  };

  const removeFromPreReview = (id: string): void => {
    setManuscriptRecords((prev: ManuscriptDetails[]) => prev.filter(m => m.id !== id));
  };

  const updateManuscriptStatus = (
    id: string,
    newStatus: Status,
    details?: UpdateDetails
  ): void => {
    const found = findManuscript(id);
    if (!found) {
      console.error(`Manuscript with id ${id} not found`);
      return;
    }

    const { manuscript, listType } = found;

    // Create updated manuscript with proper type handling
    const updatedManuscript: ManuscriptDetails = {
      ...manuscript,
      ...details,
      status: newStatus,
      // Preserve existing fields if not in details
      reviewers: details?.reviewers ?? manuscript.reviewers,
      revisionStatus: details?.revisionStatus ?? manuscript.revisionStatus,
      rejectionReason: details?.rejectionReason ?? manuscript.rejectionReason,
      rejectionComment: details?.rejectionComment ?? manuscript.rejectionComment,
      firstRevisionDate: details?.firstRevisionDate ?? manuscript.firstRevisionDate,
      revisionComments: details?.revisionComments ?? manuscript.revisionComments
    };

    // Remove from current list and add to new list
    removeFromCurrentList(id, manuscript.status);
    addToNewList(updatedManuscript, newStatus);
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