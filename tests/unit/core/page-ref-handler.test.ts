import { describe, it, expect, beforeEach } from 'vitest';
import { PageReferenceHandler } from '@/core/page-ref-handler';
import { PageReferenceManifestManager } from '@/utils/manifest-manager';
import { PageRefConfig } from '@/types/configuration';
import { PageReferenceHandlerError } from '@/core/errors';
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended';

describe('PageReferenceHandler', () => {
  let mockManifestManager: DeepMockProxy<PageReferenceManifestManager>;
  const pageId = 'test-page-id';

  beforeEach(() => {
    mockManifestManager = mockDeep<PageReferenceManifestManager>();
  });

  describe('Configuration Testing', () => {
    it('Should throw an error if config is missing `UrlPropertyNameNotion`', () => {
      const config = {} as PageRefConfig;

      const createHandler = () =>
        new PageReferenceHandler(pageId, config, mockManifestManager);

      expect(createHandler).toThrow(PageReferenceHandlerError);
    });

    it('Should initialize successfully if `UrlPropertyNameNotion` is provided', () => {
      const config: PageRefConfig = {
        UrlPropertyNameNotion: 'URL',
      };

      const createHandler = () =>
        new PageReferenceHandler(pageId, config, mockManifestManager);

      expect(createHandler).not.toThrow();
    });
  });
});
