export function TrajectoryGraphic() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <circle cx="54" cy="50" r="38" fill="none" stroke="#C8FF4D" strokeOpacity="0.55" strokeWidth="0.35" />
        <line x1="54" y1="6" x2="54" y2="94" stroke="#C8FF4D" strokeOpacity="0.4" strokeWidth="0.28" />
        <g stroke="#C8FF4D" strokeOpacity="0.7" strokeWidth="0.35">
          <line x1="54" y1="12" x2="55.6" y2="12" />
          <line x1="54" y1="88" x2="55.6" y2="88" />
        </g>
      </svg>
      <div className="hawk-orbit absolute top-[12%] right-[8%] bottom-[12%] left-[16%]">
        <span className="absolute top-0 left-1/2 h-[5px] w-[5px] -translate-x-1/2 rounded-full bg-lime shadow-[0_0_8px_rgba(200,255,77,0.8)]" />
      </div>
      <p className="absolute top-[14%] right-[2%] text-right text-[9px] leading-[1.35] tracking-[0.16em] text-[rgba(241,240,234,0.55)]">
        MORE
        <br />
        LIQUIDITY.
        <br />
        MORE
        <br />
        OPPORTUNITY.
      </p>
    </div>
  );
}
