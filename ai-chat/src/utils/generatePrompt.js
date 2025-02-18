const generatePrompt = async (query) => {
  const userPrompt = `
  You are an AI healthcare assistant. Answer the following question concisely, in short and logical sentences.  
  Provide factual, evidence-based responses while ensuring clarity and accuracy.  
  If a question requires medical attention, advise consulting a professional.  
  Keep responses under 20 words.  

  Question: "${query}"
  Answer:
  `;

  return userPrompt;
};

export default generatePrompt;
