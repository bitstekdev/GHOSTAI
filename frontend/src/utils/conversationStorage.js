export const getAllConversations = () =>
  JSON.parse(localStorage.getItem("conversationData") || "{}");

export const getConversationByStoryId = (storyId) =>
  getAllConversations()[storyId]?.conversation || null;

export const saveConversationByStoryId = (storyId, conversation) => {
  const all = getAllConversations();
  all[storyId] = {
    conversation,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem("conversationData", JSON.stringify(all));
};
