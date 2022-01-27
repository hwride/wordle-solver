const testGuesserAgainstWord = require('./guesser-test-utils')
const getWords = require('./words')

/*
  This is a test file while goes through the whole word dictionary and sees how the guesser would perform against each
  word. It tracks the total number of successful and failed guesses and prints at the end.
 */

const results = {
  success: [],
  fail: []
}

it(`should guess as many words as possible`, () => {
  const words = getWords()
  words.forEach((word, i) => {
    const wordNum = i + 1
    if(wordNum % 100 === 0) {
      console.log(`Word ${wordNum} of ${words.length}...
Current successful: ${results.success.length}
Current failed: ${results.fail.length}
`)
    }

    const isCorrect = testGuesserAgainstWord(word, false)
    if(isCorrect) {
      results.success.push(word)
    } else {
      results.fail.push(word)
    }
  })

  console.log(`Successful words: ${results.success.length}/${words.length}`)
  console.log(`Failed words: ${results.fail.length}/${words.length}`)

  console.log(`Successful words details: ${JSON.stringify(results.success, null, 2)}`)
  console.log(`Failed words details: ${JSON.stringify(results.fail, null, 2)}`)
})
