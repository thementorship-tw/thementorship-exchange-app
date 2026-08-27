import Image from "next/image";

/** Shared decorative ocean scene used by login and full-page empty states. */
export function OceanScene() {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10">
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
        priority
        sizes="(min-width: 1024px) 1px, (min-width: 768px) and (orientation: landscape) 1px, 100vw"
        className="object-cover object-left-bottom md:landscape:hidden lg:hidden"
      />

      <div className="login-boat absolute right-0 bottom-8 z-10 hidden aspect-[1003/614] w-[40vw] md:landscape:block lg:block">
        <Image
          src="/images/login/boat.png"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 42vw, (min-width: 768px) and (orientation: landscape) 42vw, 1px"
          className="object-contain object-right-bottom"
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
          sizes="(min-width: 1024px) 110vw, (min-width: 768px) and (orientation: landscape) 110vw, 1px"
          className="object-cover object-top"
        />
      </div>
      <div className="login-wave login-wave-front absolute bottom-[-15px] left-0 z-40 hidden h-[136px] w-[calc(100%+40px)] md:landscape:block lg:block">
        <Image
          src="/images/login/wave-1.png"
          alt=""
          fill
          sizes="(min-width: 1024px) 110vw, (min-width: 768px) and (orientation: landscape) 110vw, 1px"
          className="object-cover object-top"
        />
      </div>
    </div>
  );
}
