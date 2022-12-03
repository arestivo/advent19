export{}

const reader = require('readline').createInterface(process.stdin)

let input : string  
reader.on('line', (line: string) => input = line)

reader.on('close', () => { 
  const offset = parseInt(input.substr(0,7))
  input = input.repeat(10000)

  const digits = input.split('')
  for (let p = 0; p < 100; p++){
    let last = digits[digits.length - 1]
    for (let i = digits.length - 2; i >= offset; i--) {
      digits[i] = last_digit((parseInt(digits[i]) + parseInt(last)).toString())
      last = digits[i]
    }
  }
  console.log(digits.slice(offset, offset + 8).join(''))
})

const last_digit = (number : string) => number.substr(-1)