const { createGuesser } = require('./guesser')
const { numberOfGuesses } = require('./config')

module.exports = function testGuesserAgainstWord(word, logResults) {
  const makeGuess = createGameBoard(word)
  const guesser = createGuesser()

  let logStr = `Word to guess: ${word}\n`;

  let isCorrect = false
  for(let i = 0; i < numberOfGuesses; i++) {
    const guess = guesser.findNextGuess()
    logStr += `Guess ${i + 1}/${numberOfGuesses}: ${guess}\n`
    const guessResponse = makeGuess(guess)
    if(guessResponse.correct) {
      isCorrect = true
      break
    }
    guesser.reportGuessResponse(guessResponse.wordMatch)
  }
  logStr += isCorrect ? 'Success!' : 'Fail'
  if(logResults) {
    console.log(logStr)
  }

  return isCorrect
}

function createGameBoard(word) {
  return (guessWord) => {
    const guessResponse = {
      wordMatch: []
    }
    let allLettersCorrect = true
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
        allLettersCorrect = false
      } else {
        letterResponse.evaluation = 'absent'
        allLettersCorrect = false
      }
      guessResponse.wordMatch.push(letterResponse)
    }
    guessResponse.correct = allLettersCorrect
    return guessResponse
  }
}
