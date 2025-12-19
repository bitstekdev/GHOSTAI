import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/axiosInstance';
import { AppContext } from './AppContext';

const TourContext = createContext();

export const useTourContext = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTourContext must be used within TourProvider');
  }
  return context;
};

export const TourProvider = ({ children }) => {
  const navigate = useNavigate();
  const { backendUrl, userData, setUserData } = useContext(AppContext);
  const [activeTour, setActiveTour] = useState(null);
  const [tourSteps, setTourSteps] = useState([]);
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // Keys are user-scoped so one user's completion doesn't block another
  const { completedKey, startedKey } = useMemo(() => {
    const userId = userData?.id || userData?._id || 'anonymous';
    return {
      completedKey: `tour_onboarding_completed_${userId}`,
      startedKey: `tour_onboarding_started_${userId}`,
    };
  }, [userData]);

  // Tour flow configuration
  const tourFlow = {
    onboarding: [
      { page: 'dashboard', nextPage: 'generatestory' },
      { page: 'generatestory', nextPage: 'stories' },
      { page: 'stories', nextPage: null }, // End of tour
    ],
  };

  const startOnboardingTour = useCallback(() => {
    setActiveTour('onboarding');
    setStepIndex(0);
    setRun(true);
    
    // Mark tour as started for this user
    localStorage.setItem(startedKey, 'true');
    
    // Navigate to dashboard if not already there
    navigate('/dashboard');
  }, [navigate]);

  const handleTourCallback = useCallback((data) => {
    const { status, type, index, action } = data;
    const finishedStatuses = ['finished', 'skipped'];

    // Keep stepIndex in sync for controlled Joyride
    if (type === 'step:after') {
      if (action === 'next') {
        setStepIndex(index + 1);
      } else if (action === 'prev') {
        setStepIndex(Math.max(0, index - 1));
      }
    }

    // Handle navigation between pages
    if (type === 'tour:end' || finishedStatuses.includes(status)) {
      const currentFlow = tourFlow[activeTour];
      if (currentFlow && currentFlow[0]) {
        const currentPageIndex = currentFlow.findIndex(
          (f) => window.location.pathname.includes(f.page)
        );
        
        const nextPage = currentFlow[currentPageIndex]?.nextPage;
        
        // Only navigate forward when tour finishes, not on back
        if (nextPage && status === 'finished') {
          // Navigate to next page and continue tour
          setTimeout(() => {
            navigate(`/${nextPage}`);
            setStepIndex(0);
            setRun(true);
          }, 500);
        } else {
          // Tour completed
          setRun(false);
          setActiveTour(null);
          localStorage.setItem(completedKey, 'true');
          // Persist to server for cross-device reliability
          (async () => {
            try {
              await api.patch(`${backendUrl}/api/auth/onboarding-tour`, { completed: true });
              // Update userData in AppContext if available
              if (userData) {
                setUserData({ ...userData, onboardingTourCompleted: true });
              }
            } catch (e) {
              // Silently ignore network errors; localStorage still prevents re-show
              console.error('Failed to persist onboarding tour completion:', e);
            }
          })();
        }
      } else {
        setRun(false);
        setActiveTour(null);
      }
    }
  }, [activeTour, navigate, backendUrl, userData, setUserData, completedKey]);

  const shouldShowOnboardingTour = useCallback(() => {
    // Prefer server-side flag if available
    if (userData && userData.onboardingTourCompleted) {
      return false;
    }

    // Fallback to per-user localStorage for users without server flag yet
    return !localStorage.getItem(completedKey);
  }, [userData, completedKey]);

  const resetTour = useCallback(() => {
    setRun(false);
    setStepIndex(0);
    setActiveTour(null);
    localStorage.removeItem(completedKey);
    localStorage.removeItem(startedKey);
  }, [completedKey, startedKey]);

  const value = {
    activeTour,
    tourSteps,
    run,
    stepIndex,
    setRun,
    setStepIndex,
    startOnboardingTour,
    handleTourCallback,
    shouldShowOnboardingTour,
    resetTour,
  };

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
};
