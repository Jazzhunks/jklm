import { memo } from "react";

function FloatingRings() {
  return (
    <div className="hero-rings">
      {[1, 2, 3].map((n) => (
        <div key={n} className={`ring ring-${n}`} />
      ))}
    </div>
  );
}

export default memo(FloatingRings);