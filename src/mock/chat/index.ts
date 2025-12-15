import Mock from "mockjs";

export const setupChatMock = () => {
  Mock.mock(/\/api\/chat\/send/, "post", () => {
    return {
      code: 0,
      message: "ok",
      data: {
        reply: "（Mock）我收到你的消息啦，后续这里接真实 AI 接口。",
      },
    };
  });
};
