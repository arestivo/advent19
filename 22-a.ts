export{}

const reader = require('readline').createInterface(process.stdin)
const terminal = require( 'terminal-kit' ).terminal;

let commands : string[] = []  
reader.on('line', (line: string) => commands.push(line))

reader.on('close', () => { 
  const deck = create_deck(10)
  shuffle(deck, commands)

  console.log(deck)
})

const shuffle = (deck: number[], commands: string[]) => {
  commands.forEach((command: any) => {
    console.log(deck)
    apply_command(command, deck)
  })
  return deck
}

const apply_command = (command: string, deck: number[]) => {
  if (command == 'deal into new stack') {
    deal_into_new_stack(deck)
  }
  if (command.startsWith('cut')) {
    const cut = parseInt(command.split(' ')[1])
    cut_deck(deck, cut)
  }
  if (command.startsWith('deal with increment')) {
    const increment = parseInt(command.split(' ')[3])
    deal_with_increment(deck, increment)
  }
}

const deal_with_increment = (deck: number[], increment: number) => {
  const table = Array(deck.length).fill(0)

  let card = 0, pos = 0
  while (card < deck.length) {
    table[pos] = deck[card]
    pos = (pos + increment) % deck.length
    card++
  }

  deck.length = 0
  deck.push(...table)
}

const cut_deck = (deck: number[], cut: number) => {
  const deck1 = deck.slice(0, cut)
  const deck2 = deck.slice(cut)

  deck.length = 0
  deck.push(...deck2)
  deck.push(...deck1)
}

const deal_into_new_stack = (deck: number[]) => {
  deck.reverse()
}

const create_deck = (size : number) => {
  const deck = []
  for (let i = 0; i < size; i++) deck.push(i)
  return deck
}