// @utils/hydrateMessages.js

export const hydrateMessages = (messages) => {
  const messageMap = {};
  messages.forEach(msg => { messageMap[msg._id] = msg; });

  return messages.map(msg => {
    if (msg.replyTo && typeof msg.replyTo === 'string' && messageMap[msg.replyTo]) {
      return {
        ...msg,
        replyTo: {
          _id: messageMap[msg.replyTo]._id,
          from: messageMap[msg.replyTo].from,
          text: messageMap[msg.replyTo].text,
          senderAvatar: messageMap[msg.replyTo].senderAvatar,
        },
      };
    }
    return msg;
  });
};
