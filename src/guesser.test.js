const { findMatchingWord } = require('./guesser')

describe('find matching word', () => {

  it('should match all exact letters', () => {
    expect(findMatchingWord({
      wordMatch: [
        { match: 'exact', letter: 'b' },
        { match: 'exact', letter: 'o' },
        { match: 'exact', letter: 'a' },
        { match: 'exact', letter: 't' },
        { match: 'exact', letter: 's' }
      ]
    })).toBe('boats')

    expect(findMatchingWord({
      wordMatch: [
        { match: 'exact', letter: 's' },
        { match: 'exact', letter: 'h' },
        { match: 'exact', letter: 'o' },
        { match: 'exact', letter: 'e' },
        { match: 'exact', letter: 's' }
      ]
    })).toBe('shoes')
  })

  it('should match all unknown letters', () => {
    expect(findMatchingWord({
      wordMatch: [
        { match: 'unknown' },
        { match: 'unknown' },
        { match: 'unknown' },
        { match: 'unknown' },
        { match: 'unknown' }
      ]
    })).toBe('cigar')
  })

  it('should not match a non-matching letter', () => {
    expect(findMatchingWord({
      wordMatch: [
        { match: 'unknown', nonMatchingLetters: ['c'] },
        { match: 'unknown' },
        { match: 'unknown' },
        { match: 'unknown' },
        { match: 'unknown' }
      ],
      nonMatchingLetters: ['c']
    })).toBe('rebut')
  })

  it('should match a single unknown letter', () => {
    expect(findMatchingWord({
      wordMatch: [
        { match: 'exact', letter: 'b' },
        { match: 'exact', letter: 'o' },
        { match: 'unknown' },
        { match: 'exact', letter: 't' },
        { match: 'exact', letter: 's' }
      ],
    })).toBe('boats')
  })

  it('should match letters in an unknown position', () => {
    expect(findMatchingWord({
      wordMatch: [
        { match: 'unknown' },
        { match: 'unknown', nonMatchingLetters: ['f'] },
        { match: 'unknown' },
        { match: 'unknown' },
        { match: 'unknown' }
      ],
      matchingUnknownPositionLetters: ['f']
    })).toBe('focal')
  })

})
