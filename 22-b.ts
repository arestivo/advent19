export{}

const reader = require('readline').createInterface(process.stdin)
const terminal = require( 'terminal-kit' ).terminal;

let commands : string[] = []  
reader.on('line', (line: string) => commands.push(line))

reader.on('close', () => { 
  const deck = {size: 101741582076661, pos: 2020}
  shuffle(deck, commands)
  console.log(deck)
})

const shuffle = (deck: {size : number, pos : number}, commands: string[]) => {
  for (let c = commands.length - 1; c >= 0; c--)
    apply_command(commands[c], deck)
  return deck
}

const apply_command = (command: string, deck: {size : number, pos : number}) => {
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
  console.log(deck)
}

const deal_with_increment = (deck: {size : number, pos : number}, increment: number) => {
  const cut_size_groups = Math.floor(deck.size / increment)

  const state = {pos_in_group : 0, card : 0, turns : 0}
  let last = {pos : 0, card : 0}

  while (state.card <= deck.pos) {
    last.pos = state.pos_in_group ; last.card = state.card
    state.card += cut_size_groups
    if (cut_size_groups * increment + state.pos_in_group > deck.size - 1)
      state.pos_in_group = (cut_size_groups * increment + state.pos_in_group) % deck.size
    else {
      state.pos_in_group = (cut_size_groups * increment + state.pos_in_group + increment) % deck.size
      state.card++
    }
    state.turns++
  }

  deck.pos = last.pos + increment * (deck.pos - last.card)
}

const cut_deck = (deck: {size : number, pos : number}, cut: number) => {
  if (cut < 0) cut = deck.size + cut

  deck.pos = (deck.pos + deck.size - cut) % deck.size
}

const deal_into_new_stack = (deck: {size : number, pos : number}) => {
  deck.pos = deck.size - deck.pos - 1
}

const deal_with_increment_slow = (deck: number[], increment: number) => {
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
