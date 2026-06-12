import React, { useMemo } from "react";
import * as d3 from "d3";

interface RadarChartProps {
  metrics: {
    aggression: number;
    strategy: number;
    teamwork: number;
  };
}

export default function RadarChart({ metrics }: RadarChartProps) {
  // Define 4 dimensions: Aggressive, Supportive, Strategic, Tactical
  // Tactical is derived as an elegant mix of aggression and strategy
  const tacticalValue = useMemo(() => {
    return Math.round((metrics.strategy * 0.6 + metrics.aggression * 0.4));
  }, [metrics.strategy, metrics.aggression]);

  const data = useMemo(() => [
    { key: "STRATEGIC", value: metrics.strategy, color: "text-cyan-400" },
    { key: "AGGRESSIVE", value: metrics.aggression, color: "text-rose-400" },
    { key: "SUPPORTIVE", value: metrics.teamwork, color: "text-purple-400" },
    { key: "TACTICAL", value: tacticalValue, color: "text-emerald-400" },
  ], [metrics, tacticalValue]);

  // Dimension config
  const width = 320;
  const height = 260;
  const radius = 70;
  const centerX = width / 2;
  const centerY = height / 2;

  // Scale from 0 to 100
  const rScale = useMemo(() => {
    return d3.scaleLinear().domain([0, 100]).range([0, radius]);
  }, [radius]);

  // Total dimensions: 4
  const numAxes = data.length;
  const angleSlice = (Math.PI * 2) / numAxes;

  // Calculate coordinates for the axes and the data path
  const lines = useMemo(() => {
    return data.map((d, i) => {
      // Rotate by -PI/2 so the first node points straight up
      const angle = i * angleSlice - Math.PI / 2;
      const x1 = centerX;
      const y1 = centerY;
      const x2 = centerX + radius * Math.cos(angle);
      const y2 = centerY + radius * Math.sin(angle);
      
      // Data point coordinate
      const rVal = rScale(d.value);
      const dx = centerX + rVal * Math.cos(angle);
      const dy = centerY + rVal * Math.sin(angle);

      // Label coordinate (offset slightly outside the radius)
      // Side labels get a tighter offset, vertical ones have slightly more room
      const isHorizontal = i % 2 !== 0;
      const labelDistance = radius + (isHorizontal ? 10 : 20);
      const lx = centerX + labelDistance * Math.cos(angle);
      const ly = centerY + labelDistance * Math.sin(angle);

      return {
        ...d,
        angle,
        x1, y1, x2, y2,
        dx, dy,
        lx, ly
      };
    });
  }, [data, angleSlice, radius, centerX, centerY, rScale]);

  // Generate the polygon points for the background grid rings
  const gridCircles = [20, 40, 60, 80, 100];
  const gridPolygons = useMemo(() => {
    return gridCircles.map((val) => {
      const r = rScale(val);
      const points = data.map((_, i) => {
        const angle = i * angleSlice - Math.PI / 2;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        return `${x},${y}`;
      });
      return {
        points: points.join(" "),
        value: val,
      };
    });
  }, [data, angleSlice, centerX, centerY, rScale]);

  // Generate the main playstyle polygon points
  const pointsString = useMemo(() => {
    return lines.map((l) => `${l.dx},${l.dy}`).join(" ");
  }, [lines]);

  return (
    <div id="radar-chart-container" className="flex flex-col items-center justify-center bg-[#0a0b10]/40 border border-white/5 p-4 rounded-3xl relative overflow-hidden group select-none">
      {/* Visual cyber mesh background */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-cyan-500/5 to-transparent pointer-events-none" />
      
      <svg id="radar-d3-svg" width={width} height={height} className="overflow-visible">
        {/* Gradients for filling the polygon */}
        <defs>
          <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(6, 182, 212, 0.45)" />
            <stop offset="70%" stopColor="rgba(168, 85, 247, 0.25)" />
            <stop offset="100%" stopColor="rgba(10, 11, 16, 0)" />
          </radialGradient>
        </defs>

        {/* Concentric grid lines (Polygons representing 20%, 40%, 60%, 80%, 100%) */}
        <g id="radar-grid-rings">
          {gridPolygons.map((grid, idx) => (
            <polygon
              key={`grid-${idx}`}
              points={grid.points}
              fill="none"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="1.2"
              strokeDasharray={idx === 4 ? "0" : "3,3"}
            />
          ))}
          {/* Circular grid backdrop markers */}
          {gridCircles.map((val) => {
            const yOffset = centerY - rScale(val);
            return (
              <text
                key={`grid-txt-${val}`}
                x={centerX + 5}
                y={yOffset + 4}
                fill="rgba(255, 255, 255, 0.4)"
                className="font-mono text-[9px] font-bold"
              >
                {val}
              </text>
            );
          })}
        </g>

        {/* Axis line spikes */}
        <g id="radar-axes-spikes">
          {lines.map((line, idx) => (
            <line
              key={`line-${idx}`}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="1.2"
            />
          ))}
        </g>

        {/* Playstyle Polygons */}
        <g id="radar-areas">
          {/* Inner glass area */}
          <polygon
            points={pointsString}
            fill="url(#radar-glow)"
            stroke="#22d3ee"
            strokeWidth="3"
            strokeLinejoin="round"
            className="transition-all duration-700 ease-out hover:fill-cyan-500/40"
          />
        </g>

        {/* Data points nodes */}
        <g id="radar-nodes">
          {lines.map((node, idx) => {
            let dotColor = "fill-cyan-300 shadow-[0_0_12px_#22d3ee]";
            if (node.key === "AGGRESSIVE") dotColor = "fill-rose-450 shadow-[0_0_12px_#f43f5e]";
            if (node.key === "SUPPORTIVE") dotColor = "fill-purple-300 shadow-[0_0_12px_#c084fc]";
            if (node.key === "TACTICAL") dotColor = "fill-emerald-300 shadow-[0_0_12px_#34d399]";

            return (
              <g key={`node-${idx}`}>
                <circle
                  cx={node.dx}
                  cy={node.dy}
                  r="5.5"
                  className={`${dotColor} cursor-pointer transition transform hover:scale-155`}
                />
                <circle
                  cx={node.dx}
                  cy={node.dy}
                  r="11"
                  fill="none"
                  stroke={node.key === "AGGRESSIVE" ? "rgba(244, 63, 94, 0.45)" : node.key === "SUPPORTIVE" ? "rgba(168, 85, 247, 0.45)" : node.key === "TACTICAL" ? "rgba(16, 185, 129, 0.45)" : "rgba(6, 182, 212, 0.45)"}
                  strokeWidth="1.5"
                  className="animate-pulse"
                />
              </g>
            );
          })}
        </g>

        {/* Outer text labels */}
        <g id="radar-labels" className="font-sans font-bold text-[10px] tracking-wider select-none">
          {lines.map((line, idx) => {
            // Adjust labels anchor alignments dynamically based on angles
            let textAnchor = "middle";
            let dyAdjust = 4;
            
            if (Math.cos(line.angle) > 0.1) {
              textAnchor = "start";
            } else if (Math.cos(line.angle) < -0.1) {
              textAnchor = "end";
            }
            
            if (Math.sin(line.angle) > 0.8) {
              dyAdjust = 14;
            } else if (Math.sin(line.angle) < -0.8) {
              dyAdjust = -6;
            }

            return (
              <text
                key={`lbl-${idx}`}
                x={line.lx}
                y={line.ly + dyAdjust}
                textAnchor={textAnchor}
                fill="#ffffff"
                className="transition-all duration-300 font-extrabold tracking-widest fill-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]"
              >
                {line.key} ({line.value}%)
              </text>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
