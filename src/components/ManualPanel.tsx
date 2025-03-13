import React from "react";

const ManualPanel: React.FC = () => {
  return (
    <div>
      <iframe
        src="/book/index.html"
        style={{ width: "100%", height: "100vh", border: "none" }}
      />
    </div>
  );
};

export default ManualPanel;
