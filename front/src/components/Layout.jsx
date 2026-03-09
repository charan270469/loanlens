import React from 'react';

export function Layout({ children }) {
  return (
    <div className="app-root">
      <header className="app-header">
        <div>
          <h1>Intelli-Credit Workbench</h1>
          <p className="app-subtitle">
            Next-gen corporate credit appraisal &amp; CAM generation.
          </p>
        </div>
      </header>
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        <span>Powered by your FastAPI backend, Landing AI &amp; Groq.</span>
      </footer>
    </div>
  );
}

