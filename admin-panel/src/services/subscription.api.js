import api from "./axiosInstance";

export const fetchPlansByContext = async (context) => {
  const { data } = await api.get(
    `/api/v1/subscriptions/plans/byShowOnContext?context=${context}`
  );

  // BACKEND RETURNS ALL → WE FILTER HERE
  return data.plans.filter(
    (p) =>
      p.isActive &&
      !p.isArchived &&
      (context === "all" ||
        p.showOnContext?.includes("all") ||
        p.showOnContext?.includes(context))
  );
};
