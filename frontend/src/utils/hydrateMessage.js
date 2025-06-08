// @utils/hydrateMessages.js
import { decrypt } from '@utils/aes256';


export const hydrateMessages = (messages) => {
  const messageMap = {};
  messages.forEach(msg => { messageMap[msg._id] = msg; });

  return messages.map(msg => {
    const decryptedText = msg.text ? decrypt(msg.text) : msg.text;

    if (msg.replyTo && typeof msg.replyTo === 'string' && messageMap[msg.replyTo]) {
      const replyMsg = messageMap[msg.replyTo];
      return {
        ...msg,
        text: decryptedText,
        replyTo: {
          _id: replyMsg._id,
          from: replyMsg.from,
          text: replyMsg.text ? decrypt(replyMsg.text) : replyMsg.text,
          senderAvatar: replyMsg.senderAvatar,
          deleted: replyMsg.deleted
        },
      };
    }

    if (msg.replyTo && typeof msg.replyTo === 'object' && msg.replyTo.from) {
      return {
        ...msg,
        text: decryptedText,
        replyTo: {
          ...msg.replyTo,
        },
      };
    }

    return {
      ...msg,
      text: decryptedText,
    };
  });
};
