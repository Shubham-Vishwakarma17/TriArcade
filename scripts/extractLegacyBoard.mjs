/* global process */

let html = ''
for await (const chunk of process.stdin) html += chunk

const squarePattern =
  /<polygon\s+points="([^"]+)"\s+fill="([^"]+)"[\s\S]*?<\/polygon>\s*<text[\s\S]*?>([\s\S]*?)<\/text>(?:\s*<image[\s\S]*?href="\/assets\/pieces\/([^"]+)\.svg"[\s\S]*?<\/image>)?/g
const squares = []

for (const match of html.matchAll(squarePattern)) {
  const id = match[3].replace(/<!--[\s\S]*?-->/g, '').replace(/\s/g, '')
  const points = match[1]
    .split(' ')
    .map((point) => point.split(',').map((value) => Number(Number(value).toFixed(4))))
  const pieceParts = match[4]?.split('_')
  squares.push({
    id,
    points,
    shade: match[2].toLowerCase() === '#eeeed2' ? 'light' : 'dark',
    initialPiece: pieceParts ? { player: pieceParts[0], type: pieceParts[1] } : undefined,
  })
}

if (squares.length !== 96) throw new Error(`Expected 96 squares, found ${squares.length}`)

const output =
  `// Generated from the legacy-v1 SVG by scripts/extractLegacyBoard.mjs.\n` +
  `import type { BoardSquare } from './types'\n\n` +
  `export const boardSquares: BoardSquare[] = ${JSON.stringify(squares, null, 2)}\n`

process.stdout.write(output)
