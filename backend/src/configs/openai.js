const OpenAI = require("openai");
const config = require("./config");

let openai;
function getOpenAI() {
  if (!config.configurations.openAiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }
  if (!openai) {
    openai = new OpenAI({
      apiKey: config.configurations.openAiKey,
    });
  }
  return openai;
}

module.exports = {
  getOpenAI,
};
