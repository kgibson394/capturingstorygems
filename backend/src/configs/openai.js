const OpenAI = require("openai");
const config = require("./config");

const openai = new OpenAI({
  apiKey: config.configurations.openAiKey,
});

module.exports = {
  openai,
};
