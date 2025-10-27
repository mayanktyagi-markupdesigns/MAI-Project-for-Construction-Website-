import React from "react";
import Navigater from "./Navigater";
import { ProfileProvider } from "./Contexts/ProfileContext";
import { ProjectProvider } from "./Contexts/ProjectContext";

const App = () => {
  return (
    <div>
      <ProjectProvider>
        <ProfileProvider>
          <Navigater />
        </ProfileProvider>
      </ProjectProvider>
    </div>
  );
};

export default App;
