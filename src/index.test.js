const getWords = require('./words')

it('should return an array from getWords', () => {
  expect(getWords()).toHaveLength(12972)
})

function test() {
  testFullMatch('boats')

  function testFullMatch(word) {
    const guessConfig = {
      wordMatch: [
        { match: 'unknown', nonMatchingLetters: [] },
        { match: 'unknown', nonMatchingLetters: [] },
        { match: 'unknown', nonMatchingLetters: [] },
        { match: 'unknown', nonMatchingLetters: [] },
        { match: 'unknown', nonMatchingLetters: [] }
      ],
      nonMatchingLetters: [],
      matchingUnknownPositionLetters: [], // TODO: Make this a set
      invalidWords: []
    }

    makeGuess(guessConfig, 1)
    makeGuess(guessConfig, 2)
    makeGuess(guessConfig, 3)
    makeGuess(guessConfig, 4)
    makeGuess(guessConfig, 5)
    makeGuess(guessConfig, 6)

    function makeGuess(guessConfig, num) {
      console.log('Guess ' + num)
      const guessWord = findWordMatching(guessConfig)
      console.log('Guess: %o', guessWord)
      const guessResponse = guess(guessWord)
      console.log('Guess response: %o', guessResponse)
      reportGuessResponse(guessConfig, guessResponse)
      console.log('Guess config: %o', guessConfig)
    }

    function guess(guessWord) {
      if (guessWord === word) {
        console.log('Great success!')
      }

      const guessResponse = {
        wordMatch: []
      }
      const wordCharacters = new Set(Array.from(word))
      for (let i = 0; i < 5; i++) {
        const letter = word[i]
        const guessLetter = guessWord[i]
        const letterResponse = {
          letter: guessLetter
        }
        if (letter === guessLetter) {
          letterResponse.evaluation = 'correct'
        } else if (wordCharacters.has(guessLetter)) {
          letterResponse.evaluation = 'present'
        } else {
          letterResponse.evaluation = 'absent'
        }
        guessResponse.wordMatch.push(letterResponse)
      }
      return guessResponse
    }

    function reportGuessResponse(guessConfig, guessResponse) {
      for (let i = 0; i < 5; i++) {
        const guessResponseLetter = guessResponse.wordMatch[i]
        if (guessResponseLetter.evaluation === 'correct') {
          guessConfig.wordMatch[i] = {
            match: 'exact',
            letter: guessResponseLetter.letter
          }
        } else if (guessResponseLetter.evaluation === 'present') {
          guessConfig.wordMatch[i].nonMatchingLetters.push(guessResponseLetter.letter)
          guessConfig.matchingUnknownPositionLetters.push(guessResponseLetter.letter)
        } else {
          guessConfig.nonMatchingLetters.push(guessResponseLetter.letter)
        }
      }
    }
  }
}
