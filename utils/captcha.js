const svgCaptcha = require('svg-captcha');

module.exports = {
  async verify(member) {
    try {
      const captcha = svgCaptcha.create();
      await member.send({
        content: `Please enter the code from the image to verify:`,
        files: [{ attachment: Buffer.from(captcha.data), name: 'captcha.svg' }],
      });

      const filter = m => m.author.id === member.user.id;
      const collector = member.user.dmChannel.createMessageCollector({ filter, time: 60000, max: 1 });
      return new Promise(resolve => {
        collector.on('collect', m => {
          resolve(m.content === captcha.text);
        });
        collector.on('end', () => resolve(false));
      });
    } catch (error) {
      return false;
    }
  },
};
