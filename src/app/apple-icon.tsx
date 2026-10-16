import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon: the Canopy sprout, full-bleed (iOS rounds the corners). */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#3d6b3a" }}>
        <svg width="180" height="180" viewBox="0 0 40 40">
          <path d="M20 7.5c-5.4 6.2-9.6 9.8-9.6 15a9.6 9.6 0 0 0 19.2 0C29.6 17.3 25.4 13.7 20 7.5Z" fill="#7fb069" />
          <path d="M20 31.5V20.5m0 4.5 4-3.5m-4 1-3-2.5" stroke="#f8f4ea" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="30" cy="10" r="3" fill="#f2a541" />
        </svg>
      </div>
    ),
    size,
  );
}
