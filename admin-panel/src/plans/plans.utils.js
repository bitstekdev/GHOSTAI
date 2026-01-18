const LIMIT_LABELS = {
  maxPages: "Pages",
  maxBooks: "Books",
  faceSwaps: "Face swaps",
  regenerations: "Regenerations",
  edits: "Edits",
  erases: "Erases",
};

export const formatPlanFeatures = (limits = {}) => {
  return Object.entries(limits)
    .filter(([, value]) => value !== null)
    .map(([key, value]) => `${value} ${LIMIT_LABELS[key] || key}`);
};

export const preparePlans = (plans = [], context = "all") => {
  return plans
    .filter(plan => {
      if (context === "initial") {
        return plan.showOnContext?.includes("initial");
      }
      if (context === "purchase") {
        return plan.price > 0 && plan.isActive;
      }
      return true;
    })
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map(plan => ({
      ...plan,
      features: formatPlanFeatures(plan.limits),
    }));
};
