# TriArcade

TriArcade is a modern web arena for classic board games. The planned collection includes standard chess, three-player chess, Ludo, and Snakes & Ladders.

## Development

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run check
```

## Architecture

Game rules will live in framework-independent TypeScript engines. React components render game state and submit player actions, but never determine whether a move is legal.

The original static three-player chess prototype is preserved in Git under the `legacy-v1` tag.
