// src/contexts/DashboardContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [totalChecklists, setTotalChecklists] = useState(0);
  const [completedChecklists, setCompletedChecklists] = useState(0);

  useEffect(() => {
    // TODO: Replace with API call
    setTotalChecklists(5);
    setCompletedChecklists(3);
  }, []);

  return (
    <DashboardContext.Provider
      value={{ totalChecklists, completedChecklists }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used inside a DashboardProvider");
  }
  return context;
};
