type Props = {
  className?: string;        // spacing, e.g. "my-14"
  inset?: boolean;           // keep within max content width
  thickness?: number;        // px (1, 2, 3…)
  color?: string;            // any CSS color
  dashed?: boolean;          // optional dashed style
};

export default function Divider({
  className = "my-12",
  inset = true,
  thickness = 1,
  color = "rgba(255,255,255,0.15)", // subtle white on dark bg
  dashed = false,
}: Props) {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={`${inset ? "mx-auto max-w-6xl px-6" : ""} ${className}`}
    >
      <div
        className={`${dashed ? "border-t border-dashed" : "border-t"}`}
        style={{
          borderTopWidth: thickness,
          borderColor: color,
        }}
      />
    </div>
  );
}
