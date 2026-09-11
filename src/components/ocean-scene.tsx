import Image from "next/image";

type BoatSide = "left" | "right";

/** 兩張設計稿的船身位置與大小不同：登入頁靠右且較大，首頁列表靠左並被左緣裁掉一截。 */
const boatSideClasses: Record<BoatSide, string> = {
  left: "-left-[7vw] bottom-24 w-[32vw]",
  right: "right-0 bottom-8 w-[40vw]",
};

const boatObjectClasses: Record<BoatSide, string> = {
  left: "object-left-bottom",
  right: "object-right-bottom",
};

export type OceanSceneProps = {
  /** 船身靠左或靠右；登入頁靠右，首頁列表靠左。 */
  boatSide?: BoatSide;
};

/** Shared decorative ocean scene used by login and full-page empty states. */
export function OceanScene({ boatSide = "right" }: OceanSceneProps = {}) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 -z-10"
    >
      <Image
        src="/images/login/background-lg.png"
        alt=""
        fill
        sizes="(min-width: 1024px) 100vw, (min-width: 768px) and (orientation: landscape) 100vw, 1px"
        className="hidden -translate-y-20 object-cover object-[left_90%] md:landscape:block lg:block"
      />
      <Image
        src="/images/login/background-sm.png"
        alt=""
        fill
        fetchPriority="high"
        sizes="(min-width: 1024px) 1px, (min-width: 768px) and (orientation: landscape) 1px, 100vw"
        className="object-cover object-left-bottom md:landscape:hidden lg:hidden"
      />

      <div
        className={`login-boat absolute z-10 hidden aspect-[1003/614] md:landscape:block lg:block ${boatSideClasses[boatSide]}`}
      >
        <Image
          src="/images/login/boat.png"
          alt=""
          fill
          fetchPriority="high"
          sizes="(min-width: 1024px) 42vw, (min-width: 768px) and (orientation: landscape) 42vw, 1px"
          className={`object-contain ${boatObjectClasses[boatSide]}`}
        />
      </div>

      <div className="login-wave login-wave-back absolute bottom-[5px] left-0 z-20 hidden h-[136px] w-[calc(100%+60px)] md:landscape:block lg:block">
        <Image
          src="/images/login/wave-3.png"
          alt=""
          fill
          loading="eager"
          sizes="(min-width: 1024px) 110vw, (min-width: 768px) and (orientation: landscape) 110vw, 1px"
          className="object-cover object-top"
        />
      </div>
      <div className="login-wave login-wave-middle absolute bottom-[-5px] left-0 z-30 hidden h-[136px] w-[calc(100%+60px)] md:landscape:block lg:block">
        <Image
          src="/images/login/wave-2.png"
          alt=""
          fill
          loading="eager"
          sizes="(min-width: 1024px) 110vw, (min-width: 768px) and (orientation: landscape) 110vw, 1px"
          className="object-cover object-top"
        />
      </div>
      <div className="login-wave login-wave-front absolute bottom-[-15px] left-0 z-40 hidden h-[136px] w-[calc(100%+40px)] md:landscape:block lg:block">
        <Image
          src="/images/login/wave-1.png"
          alt=""
          fill
          loading="eager"
          sizes="(min-width: 1024px) 110vw, (min-width: 768px) and (orientation: landscape) 110vw, 1px"
          className="object-cover object-top"
        />
      </div>
    </div>
  );
}
