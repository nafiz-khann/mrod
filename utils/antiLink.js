module.exports = {
  async check(message) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return urlRegex.test(message.content);
  },
};
