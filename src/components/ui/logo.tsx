import Image from "next/image";

export function Logo({ size = 36, showWordmark = true }: { size?: number; showWordmark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <Image
        src="/images/logo.png"
        alt="GreenLane"
        width={size}
        height={size}
        className="rounded-xl"
        priority
      />
      {showWordmark ? (
        <div className="leading-tight">
          <p className="text-[15px] font-extrabold tracking-tight text-[#116B45]">GreenLane</p>
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#249CF4]">
            Urban Air Quality &amp; Clean Routes
          </p>
        </div>
      ) : null}
    </div>
  );
}
