import React from 'react';

export function SectionCard({ title, description, children, badge }) {
  return (
    <section className="section-card">
      <header className="section-card-header">
        <div>
          <h2>{title}</h2>
          {description && <p className="section-description">{description}</p>}
        </div>
        {badge && <span className={`section-badge ${badge.type || ''}`}>{badge.text}</span>}
      </header>
      <div className="section-card-body">{children}</div>
    </section>
  );
}

