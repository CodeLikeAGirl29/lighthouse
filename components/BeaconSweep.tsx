"use client";

/**
 * Ambient background: a lighthouse beam sweeping slowly, off-canvas top-left.
 * Pass `active` while the app is actually scanning a listing — the same
 * element speeds up and brightens, so the beam itself is the loading state.
 */
export default function BeaconSweep({ active = false }: { active?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`beacon-sweep${active ? " beacon-sweep--active" : ""}`}
    />
  );
}
