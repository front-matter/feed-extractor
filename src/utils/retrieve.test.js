// retrieve.test

import { describe, it } from 'node:test'
import assert from 'node:assert'

import nock from 'nock'

import retrieve from './retrieve.js'

const parseUrl = (url) => {
  const re = new URL(url)
  return {
    baseUrl: `${re.protocol}//${re.host}`,
    path: re.pathname,
  }
}

describe('test retrieve() method', () => {
  it('test retrieve with bad status code', async () => {
    const url = 'https://some.where/bad/page'
    const { baseUrl, path } = parseUrl(url)
    nock(baseUrl).get(path).reply(500, 'Error 500')
    try {
      await retrieve(url)
    } catch (err) {
      assert.equal(err.message, 'Request failed with error code 500')
    }
  })

  it('test retrieve with bad conten type', async () => {
    const url = 'https://some.where/bad/page'
    const { baseUrl, path } = parseUrl(url)
    nock(baseUrl).get(path).reply(200, '<?xml version="1.0"?><tag>this is xml</tag>', {
      'Content-Type': 'something/type',
    })
    try {
      await retrieve(url)
    } catch (err) {
      assert.equal(err.message, 'Invalid content type: something/type')
    }
  })

  it('test retrieve from good source', async () => {
    const url = 'https://some.where/good/page'
    const { baseUrl, path } = parseUrl(url)
    nock(baseUrl).get(path).reply(200, '<div>this is content</div>', {
      'Content-Type': 'application/rss+xml',
    })
    const result = await retrieve(url)
    assert.equal(result.type, 'xml')
    assert.equal(result.text, '<div>this is content</div>')
  })

  it('test retrieve from good source, but having \\r\\n before/after root xml', async () => {
    const url = 'https://some.where/good/page'
    const { baseUrl, path } = parseUrl(url)
    nock(baseUrl).get(path).reply(200, '\n\r\r\n\n<div>this is content</div>\n\r\r\n\n', {
      'Content-Type': 'text/xml',
    })
    const result = await retrieve(url)
    assert.equal(result.type, 'xml')
    assert.equal(result.text, '<div>this is content</div>')
  })

  it('test retrieve using proxy', async () => {
    const url = 'https://some.where/good/source-with-proxy'
    const { baseUrl, path } = parseUrl(url)
    nock(baseUrl).get(path).reply(200, 'something bad', {
      'Content-Type': 'bad/thing',
    })
    nock('https://proxy-server.com')
      .get('/api/proxy?url=https%3A%2F%2Fsome.where%2Fgood%2Fsource-with-proxy')
      .reply(200, '<?xml version="1.0"?><tag>this is xml</tag>', {
        'Content-Type': 'text/xml',
      })

    const result = await retrieve(url, {
      proxy: {
        target: 'https://proxy-server.com/api/proxy?url=',
      },
    })
    assert.equal(result.type, 'xml')
    assert.equal(result.text, '<?xml version="1.0"?><tag>this is xml</tag>')
    nock.cleanAll()
  })
})
