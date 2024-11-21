import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardCards from './DashboardCards';
import DashboardCharts from './DashboardCharts';
import DetailedRecordsModal from './DetailedRecordsModal';
import { useDashboard } from '../contexts/DashboardContext';
import { useDirectors } from '../contexts/DirectorsContext';

const DashboardContent: React.FC = () => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const location = useLocation();
  const isDirectorDashboard = location.pathname.includes('/director');
  
  const {
    uploadCount: staffUploadCount,
    preReviewCount: staffPreReviewCount,
    doubleBlindCount: staffDoubleBlindCount,
    acceptedCount,
    publishedCount: staffPublishedCount,
    rejectedCount: staffRejectedCount,
    reviewersCount: staffReviewersCount,
    editorsCount: staffEditorsCount,
    firstHalfSubmissions,
    secondHalfSubmissions
  } = useDashboard();

  const {
    uploadCount: directorUploadCount,
    preReviewCount: directorPreReviewCount,
    doubleBlindCount: directorDoubleBlindCount,
    publishedCount: directorPublishedCount,
    rejectedCount: directorRejectedCount,
    reviewersCount: directorReviewersCount,
    editorsCount: directorEditorsCount,
  } = useDirectors();

  const cardData = {
    preReviewCount: isDirectorDashboard ? directorPreReviewCount : staffPreReviewCount,
    doubleBlindCount: isDirectorDashboard ? directorDoubleBlindCount : staffDoubleBlindCount,
    ...(isDirectorDashboard ? {} : { acceptedCount }),
    publishedCount: isDirectorDashboard ? directorPublishedCount : staffPublishedCount,
    rejectedCount: isDirectorDashboard ? directorRejectedCount : staffRejectedCount,
    uploadCount: isDirectorDashboard ? directorUploadCount : staffUploadCount,
    reviewersCount: isDirectorDashboard ? directorReviewersCount : staffReviewersCount,
    editorsCount: isDirectorDashboard ? directorEditorsCount : staffEditorsCount,
  };

  const handleCardExpand = (cardId: string) => {
    setSelectedCard(cardId);
  };

  const getCardTitle = (cardId: string) => {
    const titles: { [key: string]: string } = {
      'pre-review': 'Pre-Review',
      'double-blind': 'Double-Blind',
      'accepted': 'Accepted',
      'published': 'Published',
      'rejected': 'Rejected',
      'reviewers': 'Reviewers',
      'editors': 'Editors'
    };
    return titles[cardId] || cardId;
  };

  return (
    <div className="p-6">
      {/* Cards */}
      <div className="mb-8">
        <DashboardCards 
          cardData={cardData} 
          onCardExpand={handleCardExpand} 
          isDirector={isDirectorDashboard}
        />
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Review Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h4 className="text-lg font-semibold mb-4">Review Status Distribution</h4>
          <div className="h-[300px]">
            <DashboardCharts.PieChart
              data={[
                { name: 'Pre-Review', value: cardData.preReviewCount },
                { name: 'Double-Blind', value: cardData.doubleBlindCount },
                ...(isDirectorDashboard ? [] : [{ name: 'Accepted', value: acceptedCount || 0 }])
              ].filter(item => item.value > 0)}
            />
          </div>
        </div>

        {/* Submission Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h4 className="text-lg font-semibold mb-4">Submission Status Distribution</h4>
          <div className="h-[300px]">
            <DashboardCharts.PieChart
              data={[
                { name: 'Published', value: cardData.publishedCount },
                { name: 'Rejected', value: cardData.rejectedCount },
                { name: 'Upload', value: cardData.uploadCount }
              ].filter(item => item.value > 0)}
            />
          </div>
        </div>
      </div>

      {/* Monthly Submissions Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* First Half */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h4 className="text-lg font-semibold mb-4">Monthly Submissions (January - May)</h4>
          <div className="h-[300px]">
            <DashboardCharts.BarChart data={firstHalfSubmissions} />
          </div>
        </div>

        {/* Second Half */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h4 className="text-lg font-semibold mb-4">Monthly Submissions (June - December)</h4>
          <div className="h-[300px]">
            <DashboardCharts.BarChart data={secondHalfSubmissions} />
          </div>
        </div>
      </div>

      {/* Records Modal */}
      {selectedCard && (
        <DetailedRecordsModal
          cardId={selectedCard}
          cardTitle={getCardTitle(selectedCard)}
          onClose={() => setSelectedCard(null)}
          isDirector={isDirectorDashboard}
        />
      )}
    </div>
  );
};

export default DashboardContent;