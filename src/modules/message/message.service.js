import { NotFoundException, SYS_MESSAGE } from "../../common/index.js";
import { messageRepository } from "../../DB/index.js";

export const sendMessage = async (
  content,
  files,
  receiver,
  sender = undefined,
) => {
  let paths = [];
  if (files) paths = files.map((file) => file.path);

  return await messageRepository.create({
    content,
    receiver,
    attachments: paths,
    sender,
  });
};

export const getSpecificMessage = async(id, userId)=>{
const message = await messageRepository.getOne({_id: id, $or:[{receiver: userId},{sender: userId}]},{},{
populate: [
    {
        path: "receiver",
        select: "userName email"
    },
    {
        path: "sender",
        select: "userName email"
    }
]
})
if(!message) throw new NotFoundException(SYS_MESSAGE.message.notFound)
return message
}

export const getAllMessages = async( userId)=>{
const messages = await messageRepository.getAll({ $or:[{receiver: userId},{sender: userId}]},{},{
populate: [
    {
        path: "receiver",
        select: "userName email"
    },
    {
        path: "sender",
        select: "userName email"
    }
],
limit: 10
})
if(messages.length == 0) throw new NotFoundException(SYS_MESSAGE.message.notFound)
return messages
}