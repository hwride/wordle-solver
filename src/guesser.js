const {
  numberOfLetters,
} = require('./config')

const getWords = require('./words')
const words = getWords()

/**
 * Create a guesser you can use for making guesses and reporting results of guesses to.
 */
function createGuesser() {
  const guessConfig = initGuessConfig()
  return {
    findNextGuess: () => findNextGuess(guessConfig),
    reportGuessResponse: guessResponse => reportGuessResponse(guessConfig, guessResponse),
    registerInvalidWord: word => guessConfig.invalidWords.push(word)
  }
}

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
  let mostUniqueLettersCount = 0
  const mapUniqueLettersToWords = {}
  candidateWords.forEach(word => {
    const lettersSet = new Set()
    word.split('').forEach(letter => lettersSet.add(letter))
    const uniqueLettersCount = Array.from(lettersSet).length
    mapUniqueLettersToWords[uniqueLettersCount] = mapUniqueLettersToWords[uniqueLettersCount] || []
    mapUniqueLettersToWords[uniqueLettersCount].push(word)
    if(uniqueLettersCount > mostUniqueLettersCount) {
      mostUniqueLettersCount = uniqueLettersCount
    }
  })

  const wordsMostUniqueLetters = mapUniqueLettersToWords[mostUniqueLettersCount]

  // From the words with the most unique letters, find the one with the most vowels.
  let largestVowelsCount = 0
  const mapVowelsCount = {}
  const isCommonVowel = letter => ['a', 'e', 'i', 'o', 'u'].includes(letter) // Leaving out less common y for now.
  wordsMostUniqueLetters.forEach(word => {
    let vowelsCount = 0
    word.split('').forEach(letter => {
      if(isCommonVowel(letter)) vowelsCount += 1
    })
    mapVowelsCount[vowelsCount] = mapVowelsCount[vowelsCount] || []
    mapVowelsCount[vowelsCount].push(word)
    if(vowelsCount > largestVowelsCount) {
      largestVowelsCount = vowelsCount
    }
  })
  const wordToUse = mapVowelsCount[largestVowelsCount][0]

  if(wordToUse == null) {
    throw new Error('Found no matching words')
  }

  return wordToUse
}

/**
 * Modify some given guess config according to the response to a guess.
 */
function reportGuessResponse(guessConfig, guessResponse) {
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
    } else { // absent
      guessConfig.wordMatch[i].nonMatchingLetters.push(guessResponseLetter.letter)
      guessConfig.nonMatchingLetters.push(guessResponseLetter.letter)
      isCorrect = false
    }
  }
  if(!isCorrect) {
    guessConfig.nonMatchingWords.push(guessWord)
  }
}

exports.createGuesser = createGuesser

// Exported for test only
exports.initGuessConfig = initGuessConfig
exports.findNextGuess = findNextGuess
exports.reportGuessResponse = reportGuessResponse
