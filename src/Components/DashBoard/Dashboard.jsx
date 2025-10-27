import React, { useState, useEffect } from "react";
import Overview from "./Overview";
import ProjectsPage from "./ProjectsPage";
import ReportsPage from "./ReportsPage";
import SubmittalsPage from "./SubmittalsPage";
import FormsPage from "./FormsPage";
import CalendarPage from "./CalendarPage";
import TasksPage from "./TasksPage";
import MessagesPage from "./MessagesPage";
import DirectoryPage from "./DirectoryPage";
import TopNav from "./TopNav";

// Report
import ReoportAFG from "./Reports/ReoportAFG";
import ReportDPC from "./Reports/ReportDPC";
import ReportMDN from "./Reports/ReportMDN";
import ReportSCA from "./Reports/ReportSCA";
import ReportTRE from "./Reports/ReportTRE";
import ReportYTG from "./Reports/ReportYTG";
import DocumentParsing from "./DocumentParsing";
import ProjectDetails from "./ProjectDetails";

import BID from "./Projects/BID";
import DrawingsSpecs from "./Projects/DrawingsSpecs";
import ProjectDocs from "./Projects/ProjectDocs";
import Photos from "./Projects/Photos";
import Submittals from "./Projects/Submittals";
import Schedule from "./Projects/Schedule";
import Permit from "./Projects/Permit";
import Meetings from "./Projects/Meetings";
import Payment from "./Projects/Payment";
import Insurance from "./Projects/Insurance";
import DailyReports from "./Projects/DailyReports";
import Safety from "./Projects/Safety";
import Inspections from "./Projects/Inspections";
import RFI from "./Projects/RFI";
import Correspondence from "./Projects/Correspondence";
import ChangeOrder from "./Projects/ChangeOrder";
import CADDFiles from "./Projects/CADDFiles";
import Closeout from "./Projects/Closeout";
import Misc from "./Projects/Misc";
import Templates from "./Projects/Templates";
import Procurement from "./Projects/Procurement";

const Dashboard = ({
  activeSection,
  setActiveSection,
  projectId,
  projectName,
  
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProjectName, setSelectedProjectName] = useState("");


  const handleViewDetails = (projectId, projectName) => {
    setSelectedProjectId(projectId);
    setSelectedProjectName(projectName);
    setActiveSection("ProjectDetail");
  };


  console.log("Dashboard - projectId:", projectId);

  useEffect(() => {
    setSelectedProjectId(projectId);
    setSelectedProjectName(projectName);
  }, [projectId, projectName]);

  const renderSection = () => {
    switch (activeSection) {
      case "DashBorad":
        return <Overview setActiveSection={setActiveSection} />;

      case "projects":
        return (
          <ProjectsPage
            onViewTasks={(projectId) => {
              setSelectedProjectId(projectId);
              setActiveSection("tasks");
            }}
            onViewDetails={handleViewDetails}
          />
        );

      // Project modules
      case "BID":
        return <BID />;
      case "Correspondence":
        return <Correspondence />;
      case "ChangeOrder":
        return <ChangeOrder />;
      case "CADDFiles":
        return <CADDFiles />;
      case "Closeout":
        return <Closeout />;
      case "DrawingsSpecs":
        return <DrawingsSpecs />;
      case "ProjectDocs":
        return <ProjectDocs />;
      case "Photos":
        return <Photos />;
      case "Submittals":
        return <Submittals />;
      case "Schedule":
        return <Schedule />;
      case "Permit":
        return <Permit />;
      case "Meetings":
        return <Meetings />;
      case "Payment":
        return <Payment />;
      case "Insurance":
        return <Insurance />;
      case "DailyReports":
        return <DailyReports />;
      case "Inspections":
        return <Inspections />;
      case "RFI":
        return <RFI />;
      case "Safety":
        return <Safety />;
      case "Misc":
        return <Misc />;
      case "Templates":
        return <Templates />;
      case "Procurement":
        return <Procurement />;

      // Reports
      case "reports":
        return <ReportsPage />;
      case "ReoportAFG":
        return <ReoportAFG />;
      case "ReportDPC":
        return <ReportDPC />;
      case "ReportMDN":
        return <ReportMDN />;
      case "ReportSCA":
        return <ReportSCA />;
      case "ReportTRE":
        return <ReportTRE />;
      case "ReportYTG":
        return <ReportYTG />;

      // Other pages
      case "submittals":
        return <SubmittalsPage />;

      case "ai-document-parsing":
        return <DocumentParsing />;

      case "calendar":
        return <CalendarPage />;

      case "ProjectDetail":
        return (
          <ProjectDetails
            projectId={selectedProjectId}
            projectName={selectedProjectName}
            setActiveSection={setActiveSection}
          />
        );

      case "tasks":
        return (
          <TasksPage
            projectId={selectedProjectId}
            setActiveSection={setActiveSection}
          />
        );

      case "forms":
        return <FormsPage />;
      case "messages":
        return <MessagesPage />;
      case "directory":
        return <DirectoryPage />;

      default:
        return <Overview setActiveSection={setActiveSection} />;
    }
  };

  return (
    <main className="flex-1 bg-white relative">
      {/* Top Navigation */}
      <div className="sticky top-0 z-50 w-full bg-white hidden sm:block">
        <TopNav
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
      </div>

      {/* Content Area */}
      <div className="p-4">{renderSection()}</div>
    </main>
  );
};

export default Dashboard;
