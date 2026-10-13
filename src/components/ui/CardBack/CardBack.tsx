import { n, star4 } from '../_shared/shapes';
import styles from './CardBack.module.css';

export interface CardBackProps {
  className?: string;
}

const CX = 142;
const CY = 255;

/** One curled corner flourish; (sx, sy) point it into the card. */
function corner(x: number, y: number, sx: number, sy: number) {
  return (
    `M${x} ${y + sy * 30}Q${x} ${y} ${x + sx * 30} ${y}` +
    `M${x + sx * 8} ${y + sy * 8}m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0`
  );
}

/**
 * The back of every card: midnight with gold line art, drawn as one inline SVG. It is
 * mirror-symmetric top to bottom, so a reversed card never shows from the back.
 */
export function CardBack({ className }: CardBackProps) {
  return (
    <svg
      className={[styles.cardback, className].filter(Boolean).join(' ')}
      viewBox="0 0 284 511"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <g fill="none" stroke="currentColor" strokeWidth={1.4}>
        <rect x={14} y={14} width={256} height={483} rx={8} />
        <rect
          x={22}
          y={22}
          width={240}
          height={467}
          rx={5}
          strokeOpacity={0.55}
          strokeWidth={0.8}
        />
        <path d={corner(32, 32, 1, 1)} />
        <path d={corner(252, 32, -1, 1)} />
        <path d={corner(32, 479, 1, -1)} />
        <path d={corner(252, 479, -1, -1)} />
        <circle cx={CX} cy={CY} r={70} strokeOpacity={0.5} strokeWidth={0.8} />
        <circle cx={CX} cy={CY} r={26} />
        <g strokeLinecap="round">
          {Array.from({ length: 16 }, (_, i) => {
            const a = (i * Math.PI) / 8;
            const r2 = i % 2 ? 44 : 52;
            return (
              <line
                key={i}
                x1={n(CX + Math.cos(a) * 34)}
                y1={n(CY + Math.sin(a) * 34)}
                x2={n(CX + Math.cos(a) * r2)}
                y2={n(CY + Math.sin(a) * r2)}
              />
            );
          })}
        </g>
        <path d="M142 120v40M142 350v40" strokeOpacity={0.6} strokeWidth={0.8} />
      </g>
      <g fill="currentColor">
        <path d="M150 236a20 20 0 1 0 0 38a24 24 0 1 1 0 -38z" fillOpacity={0.95} />
        <path d={star4(142, 100, 16)} />
        <path d={star4(142, 411, 16)} />
        <path d={star4(96, 140, 5)} />
        <path d={star4(188, 140, 5)} />
        <path d={star4(96, 371, 5)} />
        <path d={star4(188, 371, 5)} />
        <circle cx={70} cy={255} r={2} />
        <circle cx={214} cy={255} r={2} />
        <circle cx={116} cy={182} r={1.4} />
        <circle cx={168} cy={182} r={1.4} />
        <circle cx={116} cy={329} r={1.4} />
        <circle cx={168} cy={329} r={1.4} />
      </g>
    </svg>
  );
}
