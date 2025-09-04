// normalizer.test

import { describe, it } from 'node:test'
import assert from 'node:assert'

import { toISODateString } from './normalizer.js'

describe('test `normalizer` methods', () => {
  it('test toISODateString()', () => {
    assert.equal(toISODateString('Thu, 28 Jul 2022 08:59:58 GMT'), '2022-07-28T08:59:58.000Z')
    assert.equal(toISODateString('2022-07-28T02:43:00.000000000Z'), '2022-07-28T02:43:00.000Z')
    assert.equal(toISODateString(''), '')
    assert.equal(toISODateString('Thi, 280 Jul 2022 108:79:68 XMT'), '')
  })
})
