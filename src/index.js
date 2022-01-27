 const { createGuesser } = require('./guesser')

const {
  delayBeforeCloseModalMs,
  delayBeforeStartMs,
  delayAfterInvalidWordMs,
  delayBetweenEnterLetterMs,
  delayBetweenDeleteLetterMs,
  delayWaitForGuessToBeReadyMs,
  numberOfLetters,
  numberOfGuesses,
} = require('./config')

main()

async function main() {
  var gameApp = document.querySelector('game-app')
  var gameThemeManager = gameApp.shadowRoot.querySelector('game-theme-manager')
  var gameRows = gameThemeManager.querySelectorAll('game-row')

  const guesser = createGuesser()

  await closeModalIfOpen(gameThemeManager)

  await wait(delayBeforeStartMs)

  await makeGuesses(guesser)
  async function closeModalIfOpen(gameThemeManager) {
    if(gameThemeManager.querySelector('game-modal').hasAttribute('open')) {
      await wait(delayBeforeCloseModalMs)
      gameThemeManager.querySelector('game-modal').removeAttribute('open')
    }
  }

  async function makeGuesses(guesser) {
    let success = false
    let rowIndex = 0
    while(rowIndex < numberOfGuesses && !success) {
      success = await makeGuess(guesser, rowIndex)
      rowIndex++
    }
  }

  async function makeGuess(guesser, rowIndex) {
    let isGuessValidBool = false
    while(!isGuessValidBool) {
      const guessWord = guesser.findNextGuess()
      await enterGuess(guessWord)
      await submitGuess()
      if(isGuessValid(rowIndex)) {
        isGuessValidBool = true
      } else {
        // Clear existing word and guess again.
        await wait(delayAfterInvalidWordMs) // Make it look like it's stopping to think
        await clearGuess()
        guesser.registerInvalidWord(guessWord)
      }
    }
    await waitForRowGuessToBeReady(rowIndex)
    const isSuccessBool = isSuccess(rowIndex)
    if(!isSuccessBool) {
      const guessResult = getRowWord(rowIndex)
      guesser.modifyConfigFromGuess(guessResult)
    }
    return isSuccessBool
  }

  async function waitForRowGuessToBeReady() {
    return await wait(delayWaitForGuessToBeReadyMs)
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
