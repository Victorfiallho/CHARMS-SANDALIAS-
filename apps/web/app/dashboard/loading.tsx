export default function Loading() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div className="page-header">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ height: 13, width: 140, background: "#EDE5E2", borderRadius: 3 }} />
          <div style={{ height: 10, width: 100, background: "#F5F2EF", borderRadius: 3 }} />
        </div>
      </div>
      <div style={{ flex: 1, background: "#F5F2EF" }} />
    </div>
  );
}
