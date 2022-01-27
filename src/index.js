const findMatchingWord = require('./findMatchingWord')

const delayBeforeCloseModalMs = 1000
const delayBeforeStartMs = 1000
const delayAfterInvalidWordMs = 500
const delayBetweenEnterLetterMs = 200
const delayBetweenDeleteLetterMs = 100
const delayWaitForGuessToBeReadyMs = 3000
const numberOfLetters = 5
const numberOfGuesses = 6

main()

async function main() {
  var gameApp = document.querySelector('game-app')
  var gameThemeManager = gameApp.shadowRoot.querySelector('game-theme-manager')
  var gameRows = gameThemeManager.querySelectorAll('game-row')

  await closeModalIfOpen(gameThemeManager)

  await wait(delayBeforeStartMs)

  const guessConfig = {
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
  await makeGuesses(guessConfig)
  async function closeModalIfOpen(gameThemeManager) {
    if(gameThemeManager.querySelector('game-modal').hasAttribute('open')) {
      await wait(delayBeforeCloseModalMs)
      gameThemeManager.querySelector('game-modal').removeAttribute('open')
    }
  }

  async function makeGuesses(guessConfig) {
    let success = false
    let rowIndex = 0
    while(rowIndex < numberOfGuesses && !success) {
      success = await makeGuess(guessConfig, rowIndex)
      rowIndex++
    }
  }

  async function makeGuess(guessConfig, rowIndex) {
    let isGuessValidBool = false
    while(!isGuessValidBool) {
      const guessWord = findMatchingWord(guessConfig)
      await enterGuess(guessWord)
      await submitGuess()
      if(isGuessValid(rowIndex)) {
        isGuessValidBool = true
      } else {
        // Clear existing word and guess again.
        await wait(delayAfterInvalidWordMs) // Make it look like it's stopping to think
        await clearGuess()
        guessConfig.invalidWords.push(guessWord)

      }
    }
    await waitForRowGuessToBeReady(rowIndex)
    const isSuccessBool = isSuccess(rowIndex)
    if(!isSuccessBool) {
      modifyConfigFromGuess(guessConfig, getRowWord(rowIndex))
    }
    return isSuccessBool
  }

  async function waitForRowGuessToBeReady(rowIndex) {
    return await wait(delayWaitForGuessToBeReadyMs)
  }

  function modifyConfigFromGuess(guessConfig, guessResponse) {
    let guessWord = ''
    for(let i = 0; i < numberOfLetters; i++) {
      const guessResponseLetter = guessResponse[i]
      guessWord += guessResponseLetter.letter
      if(guessResponseLetter.evaluation === 'correct') {
        guessConfig.wordMatch[i] = {
          match: 'exact',
          letter: guessResponseLetter.letter
        }
      } else if(guessResponseLetter.evaluation === 'present') {
        guessConfig.wordMatch[i].nonMatchingLetters.push(guessResponseLetter.letter)
        guessConfig.matchingUnknownPositionLetters.push(guessResponseLetter.letter)
      } else {
        guessConfig.wordMatch[i].nonMatchingLetters.push(guessResponseLetter.letter)
        guessConfig.nonMatchingLetters.push(guessResponseLetter.letter)
      }
    }
    guessConfig.nonMatchingWords.push(guessWord)
  }

  function isGuessValid(rowIndex) {
    const isInvalid = gameRows[rowIndex].hasAttribute('invalid')
    return !isInvalid
  }

  function isSuccess(rowIndex) {
    return [...getRowTiles(rowIndex)].every(tile => tile.attributes.evaluation.value === 'correct')
  }

  async function enterGuess(word) {
    for(const letter of word.split('')) {
      enterLetter(letter)
      await wait(delayBetweenEnterLetterMs)
    }
  }

  async function submitGuess() {
    enterLetter('Enter')
  }

  async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async function clearGuess() {
    for(let i = 0; i < numberOfLetters; i++) {
      enterLetter('Backspace')
      await wait(delayBetweenDeleteLetterMs)
    }
  }

  function enterLetter(letter) {
    gameThemeManager.querySelector('#game').dispatchEvent(new CustomEvent("game-key-press", {
      detail: { key: letter }
    }));
  }

  function getRowWord(rowIndex) {
    const tiles = getRowTiles(rowIndex)
    const rowLetters = [...tiles].map(tile => ({
      letter: tile.attributes.letter.value,
      evaluation: tile.attributes.evaluation.value,
    }))
    return rowLetters
  }

  function getRowTiles(rowIndex) {
    return gameRows[rowIndex].shadowRoot.querySelectorAll('game-tile')
  }
}
