// Frame 0 of the climber sprite (src/lib/climber/controller.ts). Copied so the hero never pulls in the Three.js chunk.
const ROWS = [
  '......KKKK......',
  '.....KHHHHK.....',
  '....KHHHHHHK....',
  '....KHFFFFHK.KKK',
  '....KHFKFKHK.KGK',
  '....KHFFFFHK.KKK',
  '.....KFFFFK...B.',
  '....KPPPPPPK..B.',
  '...KPPPPPPPPK.B.',
  '.KPPPPPPPPPPPKB.',
  '.KMKPPPPPPPPKMK.',
  '...KPKKKKKKPK...',
  '...KPPPPPPPPK...',
  '....KKKKKKKK....',
  '....KKK..KKK....',
  '...KKKK..KKKK...',
];

// walking frame: only the legs differ
const STRIDE = [...ROWS.slice(0, 14), '...KKK....KKK...', '..KKKK....KKKK..'];

const PALETTE: Record<string, string> = {
  K: '#141413',
  H: '#dd4318',
  P: '#e9e5db',
  M: '#dd4318',
  F: '#e9e5db',
  B: '#8a5a2b',
  G: '#9a978f',
};

function Frame({ rows }: { rows: string[] }) {
  return (
    <svg viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      {rows.flatMap((row, y) =>
        [...row].map((c, x) =>
          PALETTE[c] ? (
            <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={PALETTE[c]} />
          ) : null
        )
      )}
    </svg>
  );
}

/** The pixel mountaineer as two stacked SVG frames; CSS flips between them while he walks. */
export function Cameo() {
  return (
    <>
      <Frame rows={ROWS} />
      <Frame rows={STRIDE} />
    </>
  );
}
