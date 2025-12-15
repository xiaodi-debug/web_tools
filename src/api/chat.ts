import { request } from "../utils/request";

export type ChatSendReq = {
  message: string;
};

export type ChatSendRes = {
  reply: string;
};

export const sendChat = (data: ChatSendReq) => {
  return request<ChatSendRes>({
    url: "/chat/send",
    method: "post",
    data,
  }).then((res) => res.data);
};
