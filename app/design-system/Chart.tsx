import { dataviz } from "@/app/lib/design-system";

type Point = { x: number; y: number };
type Series = { name: string; data: Point[]; colorIndex: number };

export function LineChart({
  width = 640,
  height = 320,
  padding = { top: 24, right: 32, bottom: 48, left: 56 },
  xDomain,
  yDomain,
  xLabel,
  yLabel,
  xUnit,
  yUnit,
  xTicks,
  yTicks,
  series,
}: {
  width?: number;
  height?: number;
  padding?: { top: number; right: number; bottom: number; left: number };
  xDomain: [number, number];
  yDomain: [number, number];
  xLabel: string;
  yLabel: string;
  xUnit: string;
  yUnit: string;
  xTicks: number[];
  yTicks: number[];
  series: Series[];
}) {
  const inner = {
    w: width - padding.left - padding.right,
    h: height - padding.top - padding.bottom,
  };
  const xScale = (x: number) =>
    padding.left + ((x - xDomain[0]) / (xDomain[1] - xDomain[0])) * inner.w;
  const yScale = (y: number) =>
    padding.top + inner.h - ((y - yDomain[0]) / (yDomain[1] - yDomain[0])) * inner.h;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      role="img"
      aria-label={`${yLabel} vs ${xLabel}`}
    >
      {/* dashed grid lines (horizontal) */}
      {yTicks.map((t) => (
        <line
          key={`gy-${t}`}
          x1={padding.left}
          x2={padding.left + inner.w}
          y1={yScale(t)}
          y2={yScale(t)}
          stroke={dataviz.grid.stroke}
          strokeWidth={dataviz.grid.width}
          strokeDasharray={dataviz.grid.dash}
        />
      ))}
      {/* solid axes */}
      <line
        x1={padding.left}
        y1={padding.top}
        x2={padding.left}
        y2={padding.top + inner.h}
        stroke={dataviz.axis.stroke}
        strokeWidth={dataviz.axis.width}
      />
      <line
        x1={padding.left}
        y1={padding.top + inner.h}
        x2={padding.left + inner.w}
        y2={padding.top + inner.h}
        stroke={dataviz.axis.stroke}
        strokeWidth={dataviz.axis.width}
      />

      {/* y ticks */}
      {yTicks.map((t) => (
        <text
          key={`yt-${t}`}
          x={padding.left - 10}
          y={yScale(t)}
          textAnchor="end"
          dominantBaseline="central"
          className="font-ui"
          style={{ fontSize: 11, fill: "var(--ink-muted)" }}
        >
          {t}
        </text>
      ))}
      {/* x ticks */}
      {xTicks.map((t) => (
        <text
          key={`xt-${t}`}
          x={xScale(t)}
          y={padding.top + inner.h + 20}
          textAnchor="middle"
          className="font-ui"
          style={{ fontSize: 11, fill: "var(--ink-muted)" }}
        >
          {t}
        </text>
      ))}

      {/* axis labels + unit chips */}
      <g transform={`translate(${padding.left + inner.w / 2}, ${height - 8})`}>
        <text
          textAnchor="middle"
          className="font-display"
          style={{ fontSize: 14, fill: "var(--ink)" }}
        >
          <tspan>{xLabel} </tspan>
          <tspan className="font-ui" style={{ fontSize: 10, fill: "var(--ink-muted)" }}>
            [{xUnit}]
          </tspan>
        </text>
      </g>
      <g transform={`translate(16, ${padding.top + inner.h / 2}) rotate(-90)`}>
        <text
          textAnchor="middle"
          className="font-display"
          style={{ fontSize: 14, fill: "var(--ink)" }}
        >
          <tspan>{yLabel} </tspan>
          <tspan className="font-ui" style={{ fontSize: 10, fill: "var(--ink-muted)" }}>
            [{yUnit}]
          </tspan>
        </text>
      </g>

      {/* series */}
      {series.map((s) => {
        const colour = dataviz.series[s.colorIndex % dataviz.series.length];
        const d =
          s.data
            .map((p, i) => (i === 0 ? "M" : "L") + xScale(p.x) + "," + yScale(p.y))
            .join(" ");
        return (
          <g key={s.name}>
            <path
              d={d}
              fill="none"
              stroke={colour.stroke}
              strokeWidth={dataviz.line.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {s.data.map((p, i) => (
              <circle
                key={i}
                cx={xScale(p.x)}
                cy={yScale(p.y)}
                r={dataviz.dot.radius}
                fill={colour.dot}
                stroke={dataviz.dot.strokeColor}
                strokeWidth={dataviz.dot.strokeWidth}
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

export function ChartLegend({ series }: { series: Series[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {series.map((s) => {
        const colour = dataviz.series[s.colorIndex % dataviz.series.length];
        return (
          <span
            key={s.name}
            className="chip"
            style={{ borderColor: colour.stroke, color: "var(--ink)" }}
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: colour.stroke }}
              aria-hidden
            />
            {s.name}
          </span>
        );
      })}
    </div>
  );
}

// Simple bar chart for the showcase row.
export function BarChart({
  width = 320,
  height = 180,
  padding = { top: 16, right: 8, bottom: 32, left: 32 },
  bars,
  yDomain,
}: {
  width?: number;
  height?: number;
  padding?: { top: number; right: number; bottom: number; left: number };
  bars: { label: string; value: number; colorIndex: number }[];
  yDomain: [number, number];
}) {
  const inner = {
    w: width - padding.left - padding.right,
    h: height - padding.top - padding.bottom,
  };
  const bw = inner.w / bars.length - 8;
  const yScale = (y: number) =>
    padding.top + inner.h - ((y - yDomain[0]) / (yDomain[1] - yDomain[0])) * inner.h;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      {[yDomain[1], (yDomain[0] + yDomain[1]) / 2, yDomain[0]].map((t) => (
        <line
          key={t}
          x1={padding.left}
          x2={padding.left + inner.w}
          y1={yScale(t)}
          y2={yScale(t)}
          stroke={dataviz.grid.stroke}
          strokeDasharray={dataviz.grid.dash}
        />
      ))}
      <line
        x1={padding.left}
        x2={padding.left + inner.w}
        y1={padding.top + inner.h}
        y2={padding.top + inner.h}
        stroke={dataviz.axis.stroke}
      />
      {bars.map((b, i) => {
        const colour = dataviz.series[b.colorIndex % dataviz.series.length];
        const x = padding.left + i * (inner.w / bars.length) + 4;
        const y = yScale(b.value);
        const h = padding.top + inner.h - y;
        return (
          <g key={b.label}>
            <rect x={x} y={y} width={bw} height={h} fill={colour.stroke} rx={2} />
            <text
              x={x + bw / 2}
              y={padding.top + inner.h + 16}
              textAnchor="middle"
              className="font-ui"
              style={{ fontSize: 10, fill: "var(--ink-muted)" }}
            >
              {b.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// Radar for the 8-pillar resort score.
export function RadarChart({
  size = 320,
  axes,
  values,
  colorIndex = 0,
  max = 5,
}: {
  size?: number;
  axes: string[];
  values: number[];
  colorIndex?: number;
  max?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 32;
  const n = axes.length;
  const colour = dataviz.series[colorIndex % dataviz.series.length];

  const point = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    const d = (v / max) * r;
    return [cx + Math.cos(a) * d, cy + Math.sin(a) * d] as const;
  };

  const rings = [1, 2, 3, 4, 5].map((v) => (v / max) * r);
  const poly = values
    .map((v, i) => point(i, v).join(","))
    .join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full">
      {rings.map((rr, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={rr}
          fill="none"
          stroke={dataviz.grid.stroke}
          strokeDasharray={dataviz.grid.dash}
        />
      ))}
      {axes.map((_, i) => {
        const [x, y] = point(i, max);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke={dataviz.grid.stroke}
            strokeDasharray={dataviz.grid.dash}
          />
        );
      })}
      <polygon
        points={poly}
        fill={colour.stroke}
        fillOpacity={0.2}
        stroke={colour.stroke}
        strokeWidth={dataviz.line.strokeWidth}
      />
      {values.map((v, i) => {
        const [x, y] = point(i, v);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={dataviz.dot.radius}
            fill={colour.dot}
            stroke={dataviz.dot.strokeColor}
            strokeWidth={dataviz.dot.strokeWidth}
          />
        );
      })}
      {axes.map((label, i) => {
        const [x, y] = point(i, max + 0.6);
        return (
          <text
            key={label}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            className="font-ui"
            style={{ fontSize: 10, fill: "var(--ink-muted)" }}
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
