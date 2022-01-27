const {
  numberOfLetters,
} = require('./config')

const getWords = require('./words')
const words = getWords()

/**
 * Returns some guess config that can be used for a new game.
 */
function initGuessConfig() {
  return {
    wordMatch: [
      { match: 'unknown', nonMatchingLetters: [] },
      { match: 'unknown', nonMatchingLetters: [] },
      { match: 'unknown', nonMatchingLetters: [] },
      { match: 'unknown', nonMatchingLetters: [] },
      { match: 'unknown', nonMatchingLetters: [] }
    ],
    nonMatchingLetters: [],
    matchingUnknownPositionLetters: [],
    nonMatchingWords: [],
    invalidWords: []
  }
}

/**
 * Given some guess config, returns the next word which should be used to guess.
 */
function findNextGuess(guessConfig) {
  const nonMatchingLettersSet = new Set()
  if(guessConfig.nonMatchingLetters) {
    guessConfig.nonMatchingLetters.forEach(letter => nonMatchingLettersSet.add(letter))
  }

  let candidateWords = words.filter(word => {
    if(guessConfig.invalidWords && guessConfig.invalidWords.includes(word)) return false
    if(guessConfig.nonMatchingWords && guessConfig.nonMatchingWords.includes(word)) return false

    for(let i = 0; i < 5; i++) {
      const letter = word[i]
      const letterMatch = guessConfig.wordMatch[i]
      if(letterMatch.match === 'exact') {
        if(letter !== letterMatch.letter) {
          return false
        }
      } else if(letterMatch.match === 'unknown') {
        if(nonMatchingLettersSet.has(letter)) {
          return false
        }
        if(letterMatch.nonMatchingLetters && letterMatch.nonMatchingLetters.includes(letter)) {
          return false
        }
      }
    }
    return true
  })

  // If we have some letters we know exist but don't know where, filter out words without these letters.
  if(guessConfig.matchingUnknownPositionLetters) {
    candidateWords = candidateWords.filter(word => {
      return guessConfig.matchingUnknownPositionLetters.every(letter => word.includes(letter))
    })
  }

  // Find the first candidate word with the most unique letters.
  let lastUniqueLettersCount = 0
  let wordMostUniqueLetters
  candidateWords.forEach(word => {
    const lettersSet = new Set()
    word.split('').forEach(letter => lettersSet.add(letter))
    const uniqueLetters = Array.from(lettersSet).length
    if(uniqueLetters > lastUniqueLettersCount) {
      wordMostUniqueLetters = word
      lastUniqueLettersCount = uniqueLetters
    }
  })

  if(wordMostUniqueLetters == null) {
    throw new Error('Found no matching words')
  }

  return wordMostUniqueLetters
}

/**
 * Modify some given guess config according to the response to a guess.
 */
function modifyConfigFromGuess(guessConfig, guessResponse) {
  let isCorrect = true
  let guessWord = ''
  for(let i = 0; i < numberOfLetters; i++) {
    const guessResponseLetter = guessResponse[i]
    guessWord += guessResponseLetter.letter
    if(guessResponseLetter.evaluation === 'correct') {
      guessConfig.wordMatch[i].match = 'exact'
      guessConfig.wordMatch[i].letter = guessResponseLetter.letter
    } else if(guessResponseLetter.evaluation === 'present') {
      guessConfig.wordMatch[i].nonMatchingLetters.push(guessResponseLetter.letter)
      guessConfig.matchingUnknownPositionLetters.push(guessResponseLetter.letter)
      isCorrect = false
    } else {
      guessConfig.wordMatch[i].nonMatchingLetters.push(guessResponseLetter.letter)
      guessConfig.nonMatchingLetters.push(guessResponseLetter.letter)
      isCorrect = false
    }
  }
  if(!isCorrect) {
    guessConfig.nonMatchingWords.push(guessWord)
  }
}

exports.initGuessConfig = initGuessConfig
exports.findNextGuess = findNextGuess
exports.modifyConfigFromGuess = modifyConfigFromGuess
