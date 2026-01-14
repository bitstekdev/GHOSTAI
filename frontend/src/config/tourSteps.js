/**
 * Tour steps configuration for different pages
 * Each step object contains:
 * - target: CSS selector for the element to highlight
 * - content: Text content to display
 * - placement: Where to place the tooltip (top, bottom, left, right, center, auto)
 * - disableBeacon: Whether to show the beacon (pulsing dot)
 */

export const dashboardTourSteps = [
  {
    target: 'body',
    content:
      'Welcome to GHOSTAI. This is your private workspace for creating and managing personalized stories.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '.total-stories',
    content:
      'This reflects the total number of stories you have created. Your library grows with every new story.',
    placement: 'bottom',
  },
  {
    target: '.stories-in-progress',
    content:
      'Stories that are currently in progress appear here. You can resume and refine them at any time.',
    placement: 'bottom',
  },
  {
    target: '.credits-card',
    content:
      'Your available credits are shown here. Credits are used for story generation and enhancements.',
    placement: 'bottom',
  },
  {
    target: '.sidebar-menu-button',
    content:
      'Use the navigation menu to move between sections of the platform. Let’s proceed to story creation.',
    placement: 'right',
  },
];

export const generateStoryTourSteps = [
  {
    target: 'body',
    content:
      'This is where your story takes shape. Each step allows you to craft a narrative tailored to you.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '.story-title-input',
    content:
      'Provide a title for your story. This helps you identify and organize it within your collection.',
    placement: 'right',
  },
  {
    target: '.story-genre-select',
    content:
      'Select a genre to define the tone, atmosphere, and storytelling style.',
    placement: 'right',
  },
  {
    target: '.story-length-select',
    content:
      'Choose the length of your story to control the depth and detail of the narrative.',
    placement: 'right',
  },
  {
    target: '.add-character-button',
    content:
      'Add characters to your story and define their names, appearance, and personality.',
    placement: 'top',
  },
  {
    target: '.generate-button',
    content:
      'When everything is ready, generate your story. You will be able to review and refine it afterward.',
    placement: 'top',
  },
];

export const storiesTourSteps = [
  {
    target: 'body',
    content:
      'This is your story library, where all your narratives are stored.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '.stories-in-progress-section',
    content:
      'Stories that are not yet complete are listed here. Select any story to continue editing.',
    placement: 'bottom',
  },
  {
    target: '.completed-stories-section',
    content:
      'Your completed stories appear here. You may read, share, or order printed editions.',
    placement: 'top',
  },
  {
    target: '.create-new-story-button',
    content:
      'Begin a new story whenever you are ready.',
    placement: 'top',
  },
];

// Removed duplicate generateStoryTourSteps definition

export const sidebarTourSteps = [
  {
    target: '.sidebar-dashboard',
    content:
      'Return to the dashboard at any time for an overview of your activity.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '.sidebar-stories',
    content:
      'Access your complete story collection from here.',
    placement: 'right',
  },
  {
    target: '.sidebar-profile',
    content:
      'Manage your account details and personal preferences here.',
    placement: 'right',
  },
];

// Default styles for the tour
export const tourStyles = {
  options: {
    primaryColor: '#8b5cf6', // Purple to match your theme
    textColor: '#ffffff',
    backgroundColor: '#1f2937', // Dark gray
    overlayColor: 'rgba(0, 0, 0, 0.7)',
    arrowColor: '#1f2937',
    zIndex: 10000,
  },
  tooltip: {
    borderRadius: '12px',
    padding: '20px',
    animation: 'fadeInUp 280ms ease-out',
    transformOrigin: 'top center',
    boxShadow: '0 12px 24px rgba(0,0,0,0.35)',
  },
  tooltipContent: {
    padding: '10px 0',
  },
  overlay: {
    animation: 'overlayFadeIn 250ms ease-in',
  },
  buttonNext: {
    backgroundColor: '#8b5cf6',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '14px',
    transition: 'transform 160ms ease',
  },
  buttonBack: {
    color: '#9ca3af',
    marginRight: '10px',
    transition: 'transform 160ms ease',
  },
  buttonSkip: {
    color: '#9ca3af',
    transition: 'opacity 160ms ease',
  },
  beaconInner: {
    animation: 'pulseSlow 1400ms ease-in-out infinite',
  },
};
