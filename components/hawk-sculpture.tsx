import Image from "next/image";
import { TrajectoryGraphic } from "./trajectory-graphic";

export function HawkSculpture() {
  return (
    <div className="relative mx-auto h-[420px] w-full max-w-[560px] sm:h-[480px] lg:h-[520px]">
      <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_58%_55%,black_42%,transparent_72%)]">
        <Image
          src="/hawk-hero.jpg"
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 90vw, 560px"
          className="object-cover object-[72%_center]"
        />
      </div>
      <TrajectoryGraphic />
    </div>
  );
}
