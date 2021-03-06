const { initGuessConfig, findNextGuess, reportGuessResponse } = require('./guesser')
const testGuesserAgainstWord = require('./guesser-test-utils')

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
    })).toBe('radio')
  })

  it('should not match a non-matching letter', () => {
    expect(findNextGuess({
      wordMatch: [
        { match: 'unknown', nonMatchingLetters: ['a'] },
        { match: 'unknown' },
        { match: 'unknown' },
        { match: 'unknown' },
        { match: 'unknown' }
      ],
      nonMatchingLetters: ['a']
    })).toBe('goier')
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
    })).toBe('feria')
  })

})

describe('modify config from guess', () => {

  it('should mark letters as exact when they match exactly', () => {
    const guessConfig = initGuessConfig()
    reportGuessResponse(guessConfig, [
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

  it('should mark letters as unknown and not matching when they do not match at all', () => {
    const guessConfig = initGuessConfig()
    reportGuessResponse(guessConfig, [
      { evaluation: 'absent', letter: 'b' },
      { evaluation: 'absent', letter: 'o' },
      { evaluation: 'absent', letter: 'a' },
      { evaluation: 'absent', letter: 't' },
      { evaluation: 'absent', letter: 's' },
    ])
    expect(guessConfig).toEqual({
      wordMatch: [
        { match: 'unknown', nonMatchingLetters: ['b'] },
        { match: 'unknown', nonMatchingLetters: ['o'] },
        { match: 'unknown', nonMatchingLetters: ['a'] },
        { match: 'unknown', nonMatchingLetters: ['t'] },
        { match: 'unknown', nonMatchingLetters: ['s'] }
      ],
      nonMatchingLetters: ['b', 'o', 'a', 't', 's'],
      matchingUnknownPositionLetters: [],
      nonMatchingWords: ['boats'],
      invalidWords: []
    })
  })

  it('should mark letters as unknown and matching but unknown position if appropriate', () => {
    const guessConfig = initGuessConfig()
    reportGuessResponse(guessConfig, [
      { evaluation: 'present', letter: 'b' },
      { evaluation: 'present', letter: 'o' },
      { evaluation: 'present', letter: 'a' },
      { evaluation: 'present', letter: 't' },
      { evaluation: 'present', letter: 's' },
    ])
    expect(guessConfig).toEqual({
      wordMatch: [
        { match: 'unknown', nonMatchingLetters: ['b'] },
        { match: 'unknown', nonMatchingLetters: ['o'] },
        { match: 'unknown', nonMatchingLetters: ['a'] },
        { match: 'unknown', nonMatchingLetters: ['t'] },
        { match: 'unknown', nonMatchingLetters: ['s'] }
      ],
      nonMatchingLetters: [],
      matchingUnknownPositionLetters: ['b', 'o', 'a', 't', 's'],
      nonMatchingWords: ['boats'],
      invalidWords: []
    })
  })

  it('more complex example', () => {
    const guessConfig = initGuessConfig()
    reportGuessResponse(guessConfig, [
      { evaluation: 'present', letter: 'b' },
      { evaluation: 'absent', letter: 'o' },
      { evaluation: 'absent', letter: 'a' },
      { evaluation: 'correct', letter: 't' },
      { evaluation: 'present', letter: 's' },
    ])
    expect(guessConfig).toEqual({
      wordMatch: [
        { match: 'unknown', nonMatchingLetters: ['b'] },
        { match: 'unknown', nonMatchingLetters: ['o'] },
        { match: 'unknown', nonMatchingLetters: ['a'] },
        { match: 'exact', letter: 't', nonMatchingLetters: [] },
        { match: 'unknown', nonMatchingLetters: ['s'] }
      ],
      nonMatchingLetters: ['o', 'a'],
      matchingUnknownPositionLetters: ['b', 's'],
      nonMatchingWords: ['boats'],
      invalidWords: []
    })
  })

})

describe('guesser full tests', () => {

  it('should guess boats', () => testGuesserAgainstWordAndAssert('boats'))
  it('should guess watch', () => testGuesserAgainstWordAndAssert('watch'))
  it('should guess tools', () => testGuesserAgainstWordAndAssert('tools'))
  it('should guess stool', () => testGuesserAgainstWordAndAssert('stool'))
  it('should guess gypsy', () => testGuesserAgainstWordAndAssert('gypsy'))
  it('should guess crypt', () => testGuesserAgainstWordAndAssert('crypt'))
  it('should guess knoll', () => testGuesserAgainstWordAndAssert('knoll'))

  function testGuesserAgainstWordAndAssert(word) {
    const isCorrect = testGuesserAgainstWord(word)
    expect(isCorrect).toBe(true)
  }

})
