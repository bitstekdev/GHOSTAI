import { useState, useCallback } from 'react';

/**
 * Custom hook for managing Joyride tour state
 * @param {string} tourKey - Unique key for the tour (stored in localStorage)
 * @returns {Object} Tour state and handlers
 */
export const useTour = (tourKey) => {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const startTour = useCallback(() => {
    setRun(true);
    setStepIndex(0);
  }, []);

  const resetTour = useCallback(() => {
    setRun(false);
    setStepIndex(0);
  }, []);

  const handleJoyrideCallback = useCallback((data) => {
    const { status, type, index } = data;
    const finishedStatuses = ['finished', 'skipped'];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      // Save to localStorage that user has seen this tour
      if (tourKey) {
        localStorage.setItem(`tour_${tourKey}_completed`, 'true');
      }
    }

    if (type === 'step:after') {
      setStepIndex(index + 1);
    }
  }, [tourKey]);

  const shouldShowTour = useCallback(() => {
    if (!tourKey) return true;
    return !localStorage.getItem(`tour_${tourKey}_completed`);
  }, [tourKey]);

  return {
    run,
    stepIndex,
    startTour,
    resetTour,
    handleJoyrideCallback,
    shouldShowTour,
  };
};
