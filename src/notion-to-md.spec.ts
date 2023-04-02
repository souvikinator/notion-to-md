import  { NotionToMarkdown } from './notion-to-md';

describe("setCustomTransformer", () => {

  test("blockToMarkdown sends parsing block to customTransformer", () => {
    const customTransformerMock =jest.fn()
    const n2m = new NotionToMarkdown({notionClient: {} as any})
    n2m.setCustomTransformer("test", customTransformerMock)
    n2m.blockToMarkdown({
      id: "test", name: "test", type: "test", test: {"foo": "bar"}
    } as any)
    expect(customTransformerMock).toHaveBeenCalledWith(expect.objectContaining({
      type: "test", test: {"foo": "bar"}
    }))
  })
  test("supports only one customTransformer per type ", () => {
    const customTransformerMock1 =jest.fn()
    const customTransformerMock2 = jest.fn()
    const n2m = new NotionToMarkdown({notionClient: {} as any})
    n2m.setCustomTransformer("test", customTransformerMock1)
    n2m.setCustomTransformer("test", customTransformerMock2)
    n2m.blockToMarkdown({
      id: "test", name: "test", type: "test", test: {"foo": "bar"}
    } as any)
    expect(customTransformerMock1).not.toHaveBeenCalled()
    expect(customTransformerMock2).toHaveBeenCalled()
  })


})