import React from 'react';

const steps = [
  { id: 1, label: '1 · Data Ingestor' },
  { id: 2, label: '2 · Research Agent' },
  { id: 3, label: '3 · Recommendation & CAM' },
];

export function Stepper({ activeStep, onStepChange }) {
  return (
    <div className="stepper">
      {steps.map((step) => {
        const isActive = step.id === activeStep;
        return (
          <button
            key={step.id}
            type="button"
            className={`stepper-step ${isActive ? 'active' : ''}`}
            onClick={() => onStepChange(step.id)}
          >
            <span className="step-index">{step.id}</span>
            <span className="step-label">{step.label}</span>
          </button>
        );
      })}
    </div>
  );
}

