import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardCards from './DashboardCards';
import DashboardCharts from './DashboardCharts';
import DetailedRecordsModal from './DetailedRecordsModal';
import { useDashboard } from '../contexts/DashboardContext';

const DashboardContent: React.FC = () => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const location = useLocation();
  const isDirectorDashboard = location.pathname.includes('/director');
  
  const {
    uploadCount,
    preReviewCount,
    doubleBlindCount,
    acceptedCount,
    publishedCount,
    rejectedCount,
    reviewersCount,
    editorsCount,
    firstHalfSubmissions,
    secondHalfSubmissions,
    internalSubmissions,
    externalSubmissions,
  } = useDashboard();

  const cardData = {
    preReviewCount,
    doubleBlindCount,
    acceptedCount: isDirectorDashboard ? undefined : acceptedCount,
    publishedCount,
    rejectedCount,
    uploadCount,
    reviewersCount,
    editorsCount,
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

  const getChartData = () => {
    // Review Status Distribution data
    const reviewStatusData = [
      { name: 'Pre-Review', value: preReviewCount },
      { name: 'Double-Blind', value: doubleBlindCount },
      { name: 'Published', value: publishedCount },
      { name: 'Rejected', value: rejectedCount }
    ].filter(item => item.value > 0);

    // Submission Type Distribution data
    const submissionTypeData = [
      { name: 'Internal', value: internalSubmissions },
      { name: 'External', value: externalSubmissions }
    ].filter(item => item.value > 0);

    return { reviewStatusData, submissionTypeData };
  };

  const { reviewStatusData, submissionTypeData } = getChartData();

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
            <DashboardCharts.PieChart data={reviewStatusData} />
          </div>
        </div>

        {/* Submission Type Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h4 className="text-lg font-semibold mb-4">Submission Type Distribution</h4>
          <div className="h-[300px]">
            <DashboardCharts.PieChart data={submissionTypeData} />
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