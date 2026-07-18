import { SprayCan, Droplets, Tag, PaintRoller, Paintbrush2 } from "lucide-react";

const DOODLES = [
  { Icon: SprayCan,    top: "6%",  left: "4%",  size: 64, rotate: -18, color: "text-limeflash" },
  { Icon: Tag,         top: "16%", left: "88%", size: 56, rotate: 14,  color: "text-hotpink" },
  { Icon: Droplets,    top: "38%", left: "8%",  size: 48, rotate: 8,   color: "text-hotpink" },
  { Icon: PaintRoller, top: "62%", left: "92%", size: 68, rotate: -10, color: "text-limeflash" },
  { Icon: Paintbrush2, top: "82%", left: "6%",  size: 52, rotate: 22,  color: "text-limeflash" },
  { Icon: SprayCan,    top: "90%", left: "78%", size: 60, rotate: 30,  color: "text-hotpink" },
  { Icon: Tag,         top: "50%", left: "50%", size: 44, rotate: -6,  color: "text-limeflash" },
] as const;

const GLYPHS = [
  { char: "★", top: "26%", left: "48%", size: 40, rotate: -12, color: "text-hotpink" },
  { char: "✕", top: "70%", left: "38%", size: 46, rotate: 10,  color: "text-limeflash" },
  { char: "!", top: "10%", left: "62%", size: 56, rotate: -8,  color: "text-hotpink" },
] as const;

export function GraffitiBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {DOODLES.map(({ Icon, top, left, size, rotate, color }, i) => (
        <Icon
          key={i}
          size={size}
          className={`absolute opacity-[0.06] ${color}`}
          style={{ top, left, transform: `rotate(${rotate}deg)` }}
        />
      ))}
      {GLYPHS.map(({ char, top, left, size, rotate, color }, i) => (
        <span
          key={i}
          className={`font-display absolute font-black opacity-[0.06] ${color}`}
          style={{ top, left, fontSize: size, transform: `rotate(${rotate}deg)` }}
        >
          {char}
        </span>
      ))}
    </div>
  );
}
