import { createRoot } from "react-dom/client";

function Popup() {
  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 16 }}>Dockyard</h1>
      <p style={{ fontSize: 12, color: "#8f8f8f" }}>
        Strategy Intel payment companion — scaffold.
      </p>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Popup />);
