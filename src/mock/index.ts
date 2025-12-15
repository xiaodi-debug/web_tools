import Mock from "mockjs";
import { setupChatMock } from "./chat";
import { setupWallpaperMock } from "./wallpaper";
import { setupResourceMock } from "./resource";
import { setupMusicMock } from "./music";

export const setupMock = () => {
  const enabled = import.meta.env.VITE_USE_MOCK !== "false";
  if (!enabled) return;

  Mock.setup({ timeout: "200-600" });

  setupChatMock();
  setupWallpaperMock();
  setupResourceMock();
  setupMusicMock();
};
