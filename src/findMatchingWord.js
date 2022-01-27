const getWords = require('./words')
const words = getWords()

module.exports = function findMatchingWord(matchConfig) {
  const nonMatchingLettersSet = new Set()
  if(matchConfig.nonMatchingLetters) {
    matchConfig.nonMatchingLetters.forEach(letter => nonMatchingLettersSet.add(letter))
  }

  let candidateWords = words.filter(word => {
    if(matchConfig.invalidWords && matchConfig.invalidWords.includes(word)) return false
    if(matchConfig.nonMatchingWords && matchConfig.nonMatchingWords.includes(word)) return false

    for(let i = 0; i < 5; i++) {
      const letter = word[i]
      const letterMatch = matchConfig.wordMatch[i]
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
  if(matchConfig.matchingUnknownPositionLetters) {
    candidateWords = candidateWords.filter(word => {
      return matchConfig.matchingUnknownPositionLetters.every(letter => word.includes(letter))
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
