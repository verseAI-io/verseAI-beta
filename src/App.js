import logo from './logo.svg';
import './App.css';
import LandingPage from './LandingPage';
import MatrixLogin from './Login';
import Home from './Home';
import SQLEditorV2 from './SQLEditorV2';
import SQLInterviewV2 from './SQLInterviewV2';
import AICodingChallenge from './AICodingChallenge';
import SQLPlayground from './SQLPlayground';
import ProblemSolving from './ProblemSolving';
import React, { useState } from 'react';
import NeocortexCharacter from './NeocortexCharacter';

function App() {
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing', 'matrix', 'home', 'sqleditor', 'interview', 'aicoding', 'playground', 'character'
  const [isAuthed, setIsAuthed] = useState(false);
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false);
  const [isProblemSolvingOpen, setIsProblemSolvingOpen] = useState(false);

  const handleEnterMatrix = () => {
    setCurrentPage('matrix');
  };

  const handleMatrixSuccess = () => {
    setIsAuthed(true);
    setCurrentPage('home');
  };

  const handleOpenSQLEditor = () => {
    setCurrentPage('sqleditor');
  };

  const handleOpenInterview = () => {
    setCurrentPage('interview');
  };

  const handleOpenAICoding = () => {
    setCurrentPage('aicoding');
  };

  const handleOpenPlayground = () => {
    setIsPlaygroundOpen(true);
  };

  const handleClosePlayground = () => {
    setIsPlaygroundOpen(false);
  };

  const handleOpenProblemSolving = () => {
    setIsProblemSolvingOpen(true);
  };

  const handleCloseProblemSolving = () => {
    setIsProblemSolvingOpen(false);
  };

  const handleOpenCharacter = () => {
    setCurrentPage('character');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  return (
    <div className="App">
      {currentPage === 'landing' && (
        <LandingPage onEnterMatrix={handleEnterMatrix} />
      )}
      {currentPage === 'matrix' && (
        <MatrixLogin onSuccess={handleMatrixSuccess} />
      )}
      {currentPage === 'home' && isAuthed && (
        <Home
          onOpenSQLEditor={handleOpenSQLEditor}
          onOpenInterview={handleOpenInterview}
          onOpenAICoding={handleOpenAICoding}
          onOpenPlayground={handleOpenPlayground}
          onOpenProblemSolving={handleOpenProblemSolving}
          onOpenCharacter={handleOpenCharacter}
        />
      )}
      {currentPage === 'sqleditor' && isAuthed && (
        <SQLEditorV2 onBackToHome={handleBackToHome} />
      )}
      {currentPage === 'interview' && isAuthed && (
        <SQLInterviewV2 onBackToHome={handleBackToHome} />
      )}
      {currentPage === 'aicoding' && isAuthed && (
        <AICodingChallenge onBackToHome={handleBackToHome} />
      )}

      {/* Floating SQL Playground Modal */}
      {isAuthed && (
        <SQLPlayground isOpen={isPlaygroundOpen} onClose={handleClosePlayground} />
      )}

      {/* Floating Problem Solving Modal */}
      {isAuthed && (
        <ProblemSolving isOpen={isProblemSolvingOpen} onClose={handleCloseProblemSolving} />
      )}

      {/* Neocortex Character View */}
      {currentPage === 'character' && isAuthed && (
        <NeocortexCharacter 
          characterId="cd1c5109-0c34-42d6-8611-0d8bc15e5d51" 
        />
      )}
    </div>
  );
}

export default App;
