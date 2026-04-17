import { test } from '@japa/runner'

import { RagService } from '#services/rag_service'
import { ZIMExtractionService } from '#services/zim_extraction_service'

test.group('RagService processZIMFile batching', (group) => {
  const originalExtract = ZIMExtractionService.prototype.extractZIMContent

  group.teardown(() => {
    ZIMExtractionService.prototype.extractZIMContent = originalExtract
  })

  test('uses unique article count to decide whether more ZIM batches remain', async ({ assert }) => {
    ZIMExtractionService.prototype.extractZIMContent = async () =>
      Array.from({ length: 100 }, (_, index) => ({
        text: `section ${index}`,
        articleTitle: 'Article A',
        articlePath: '/article-a',
        sectionTitle: `Section ${index}`,
        fullTitle: `Article A - Section ${index}`,
        hierarchy: `Article A > Section ${index}`,
        sectionLevel: 2,
        documentId: 'article-a-doc-id',
        archiveMetadata: {
          title: 'Archive',
          creator: null,
          publisher: null,
          date: null,
          language: 'en',
          description: null,
        },
        strategy: 'structured',
      })) as any

    const service = new RagService({} as any, {} as any)
    ;(service as any).embedAndStoreText = async () => ({ chunks: 1 })

    const result = await (service as any).processZIMFile('/tmp/archive.zim', false)

    assert.isFalse(result.hasMoreBatches)
    assert.equal(result.articlesProcessed, 1)
  })
})
