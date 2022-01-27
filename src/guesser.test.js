const { initGuessConfig, findNextGuess, modifyConfigFromGuess } = require('./guesser')

describe('find next guess', () => {

  it('should match all exact letters', () => {
    expect(findNextGuess({
      wordMatch: [
        { match: 'exact', letter: 'b' },
        { match: 'exact', letter: 'o' },
        { match: 'exact', letter: 'a' },
        { match: 'exact', letter: 't' },
        { match: 'exact', letter: 's' }
      ]
    })).toBe('boats')

    expect(findNextGuess({
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
    expect(findNextGuess({
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
    expect(findNextGuess({
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
    expect(findNextGuess({
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
    expect(findNextGuess({
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

describe('modify config from guess', () => {

  it('should mark letters at exact when they match exactly', () => {
    const guessConfig = initGuessConfig()
    modifyConfigFromGuess(guessConfig, [
      { evaluation: 'correct', letter: 'b' },
      { evaluation: 'correct', letter: 'o' },
      { evaluation: 'correct', letter: 'a' },
      { evaluation: 'correct', letter: 't' },
      { evaluation: 'correct', letter: 's' },
    ])
    expect(guessConfig).toEqual({
      wordMatch: [
        { match: 'exact', letter: 'b', nonMatchingLetters: [] },
        { match: 'exact', letter: 'o', nonMatchingLetters: [] },
        { match: 'exact', letter: 'a', nonMatchingLetters: [] },
        { match: 'exact', letter: 't', nonMatchingLetters: [] },
        { match: 'exact', letter: 's', nonMatchingLetters: [] }
      ],
      nonMatchingLetters: [],
      matchingUnknownPositionLetters: [],
      nonMatchingWords: [],
      invalidWords: []
    })
  })

})
