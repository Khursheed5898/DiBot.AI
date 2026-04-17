import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DifficultyPage from "./pages/DifficultyPage";
import DebatePage from "./pages/DebatePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/difficulty" element={<DifficultyPage />} />
      <Route path="/difficulty-selection" element={<DifficultyPage />} />
      <Route path="/debate" element={<DebatePage />} />
      <Route path="/debate-room" element={<DebatePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
