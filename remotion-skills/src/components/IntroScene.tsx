import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

// Fake Excel-like spreadsheet
const FakeExcel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cursorBlink = Math.floor(frame / 15) % 2 === 0;

  // Fake data for spreadsheet
  const rows = [
    ["Q3 Revenue", "$142,500", "$158,200", "$165,800", "=SUM(B2:D2)"],
    ["Expenses", "$45,200", "$48,100", "$52,300", "=SUM(B3:D3)"],
    ["Net Profit", "$97,300", "$110,100", "$113,500", "=B2-B3"],
    ["Growth %", "12.5%", "13.2%", "3.1%", ""],
    ["Forecast", "$175,000", "$180,000", "$190,000", ""],
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#217346",
        fontFamily: "Calibri, sans-serif",
      }}
    >
      {/* Ribbon */}
      <div
        style={{
          height: 120,
          backgroundColor: "#217346",
          borderBottom: "1px solid #185c37",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 20,
            padding: "8px 20px",
            color: "white",
            fontSize: 14,
          }}
        >
          {["File", "Home", "Insert", "Page Layout", "Formulas", "Data"].map(
            (tab, i) => (
              <span
                key={tab}
                style={{
                  padding: "4px 12px",
                  backgroundColor: i === 1 ? "#185c37" : "transparent",
                  borderRadius: 2,
                }}
              >
                {tab}
              </span>
            )
          )}
        </div>
        <div
          style={{
            height: 80,
            backgroundColor: "#f3f3f3",
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            gap: 30,
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            {["Paste", "Cut", "Copy"].map((btn) => (
              <button
                key={btn}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #ccc",
                  background: "white",
                  fontSize: 12,
                }}
              >
                {btn}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select style={{ padding: 4 }}>
              <option>Calibri</option>
            </select>
            <select style={{ padding: 4, width: 50 }}>
              <option>11</option>
            </select>
            <button style={{ fontWeight: "bold", padding: "4px 8px" }}>B</button>
            <button style={{ fontStyle: "italic", padding: "4px 8px" }}>I</button>
          </div>
        </div>
      </div>

      {/* Formula Bar */}
      <div
        style={{
          height: 30,
          backgroundColor: "white",
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid #ccc",
          padding: "0 10px",
        }}
      >
        <div
          style={{
            width: 80,
            textAlign: "center",
            borderRight: "1px solid #ccc",
            paddingRight: 10,
          }}
        >
          E2
        </div>
        <div style={{ padding: "0 10px", color: "#666" }}>fx</div>
        <div>=SUM(B2:D2){cursorBlink ? "|" : ""}</div>
      </div>

      {/* Spreadsheet Grid */}
      <div style={{ backgroundColor: "white", flex: 1 }}>
        {/* Column Headers */}
        <div style={{ display: "flex", borderBottom: "1px solid #ccc" }}>
          <div
            style={{
              width: 40,
              height: 24,
              backgroundColor: "#f5f5f5",
              borderRight: "1px solid #ccc",
            }}
          />
          {["A", "B", "C", "D", "E", "F", "G", "H"].map((col) => (
            <div
              key={col}
              style={{
                width: 120,
                height: 24,
                backgroundColor: "#f5f5f5",
                borderRight: "1px solid #ccc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                color: "#333",
              }}
            >
              {col}
            </div>
          ))}
        </div>

        {/* Header Row */}
        <div style={{ display: "flex", borderBottom: "1px solid #ccc" }}>
          <div
            style={{
              width: 40,
              height: 28,
              backgroundColor: "#f5f5f5",
              borderRight: "1px solid #ccc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
            }}
          >
            1
          </div>
          {["Category", "July", "August", "September", "Total"].map((h, i) => (
            <div
              key={h}
              style={{
                width: 120,
                height: 28,
                borderRight: "1px solid #ccc",
                display: "flex",
                alignItems: "center",
                padding: "0 8px",
                fontSize: 13,
                fontWeight: "bold",
                backgroundColor: "#e8f5e9",
              }}
            >
              {h}
            </div>
          ))}
        </div>

        {/* Data Rows */}
        {rows.map((row, rowIdx) => (
          <div
            key={rowIdx}
            style={{ display: "flex", borderBottom: "1px solid #e0e0e0" }}
          >
            <div
              style={{
                width: 40,
                height: 26,
                backgroundColor: "#f5f5f5",
                borderRight: "1px solid #ccc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
              }}
            >
              {rowIdx + 2}
            </div>
            {row.map((cell, cellIdx) => (
              <div
                key={cellIdx}
                style={{
                  width: 120,
                  height: 26,
                  borderRight: "1px solid #e0e0e0",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 8px",
                  fontSize: 12,
                  backgroundColor:
                    cellIdx === 4 && rowIdx < 3 ? "#fff3cd" : "white",
                }}
              >
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const textOpacity = interpolate(frame, [fps * 2, fps * 3], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {/* Fake Excel Background */}
      <FakeExcel />

      {/* Overlay Text */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: textOpacity,
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(0,0,0,0.8)",
            padding: "20px 40px",
            borderRadius: 10,
            color: "white",
            fontSize: 32,
            fontFamily: "Arial, sans-serif",
          }}
        >
          평범한 업무 화면...
        </div>
      </div>
    </AbsoluteFill>
  );
};
