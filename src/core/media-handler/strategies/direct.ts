import { BaseStrategy } from "./base";
import { DirectStrategyConfig, MediaInfo } from "../../../types";

export class DirectStrategy extends BaseStrategy {
  constructor(private config: DirectStrategyConfig) {
    super();
  }

  async handleMedia(mediaInfo: MediaInfo): Promise<string> {
    if (mediaInfo.isExternal && this.config.preserveExternalUrls) {
      return mediaInfo.url;
    }

    this.manifestManager?.updateEntry(mediaInfo.blockId, {
      lastEdited: mediaInfo.lastEdited,
      originalPath: mediaInfo.url,
      mediaType: mediaInfo.mediaType,
      strategy: "direct",
    });

    return mediaInfo.url;
  }
}
