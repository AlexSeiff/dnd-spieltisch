import { useId } from "react";
export function WorldMap() {
  const id = useId().replace(/:/g, "");
  const mountains = Array.from({ length: 17 }, (_, i) => ({
    x: 330 + i * 24,
    y: 135 + Math.sin(i * 0.67) * 35,
  }));
  const trees = Array.from({ length: 48 }, (_, i) => ({
    x: 630 + (i % 8) * 22 + (Math.floor(i / 8) % 2) * 10,
    y: 292 + Math.floor(i / 8) * 25 + Math.sin(i) * 8,
  }));
  return (
    <svg
      className="atlas-art world-art"
      viewBox="0 0 1200 800"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={id + "sea"}
          width="64"
          height="44"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M4 22q10-8 20 0t20 0"
            stroke="#456e71"
            opacity=".25"
            fill="none"
          />
        </pattern>
      </defs>
      <rect width="1200" height="800" fill="#719994" />
      <rect width="1200" height="800" fill={"url(#" + id + "sea)"} />
      <path
        d="M65-40 915-30 932 84 887 138 944 193 893 246 940 305 898 360 912 414 847 455 831 518 756 531 711 584 669 601 617 657 578 648 533 710 473 685 446 711 374 661 354 621 298 638 253 593 198 583 178 532 129 516 151 471 98 430 112 377 72 339 93 286 52 245 82 191 49 141Z"
        fill="#d9d0a1"
        stroke="#426d66"
        strokeWidth="13"
        strokeLinejoin="round"
      />
      <path
        d="M65-40 915-30 932 84 887 138 944 193 893 246 940 305 898 360 912 414 847 455 831 518 756 531 711 584 669 601 617 657 578 648 533 710 473 685 446 711 374 661 354 621 298 638 253 593 198 583 178 532 129 516 151 471 98 430 112 377 72 339 93 286 52 245 82 191 49 141Z"
        fill="none"
        stroke="#f1e3b8"
        strokeWidth="3"
      />
      <path
        d="M214 254q130-105 309-42t235 7M146 422q94-55 172-26t160 78M650 452q100-20 159 34"
        fill="none"
        stroke="#b3b485"
        strokeWidth="34"
        opacity=".3"
      />
      <path
        d="M565 191q-37 98 46 137t33 123q-38 46-56 89t-110 96"
        fill="none"
        stroke="#6f9b96"
        strokeWidth="9"
      />
      <path
        d="M710 234q-61 16-87 91M392 300q54 48 220 75"
        fill="none"
        stroke="#6f9b96"
        strokeWidth="5"
      />
      <g fill="#b7b48b" stroke="#7c805a" strokeWidth="2">
        {mountains.map((p, i) => (
          <g key={i} transform={"translate(" + p.x + " " + p.y + ")"}>
            <path d="m-24 25 24-47 30 47-24-13-8 11-7-9Z" />
            <path d="m-8-5 8-17 12 18-11-4Z" fill="#e8e1bd" />
          </g>
        ))}
      </g>
      <g stroke="#6a7951" strokeWidth="1.7" fill="#879a65">
        {trees.map((p, i) => (
          <g key={i} transform={"translate(" + p.x + " " + p.y + ")"}>
            <path d="m0-16-10 17h5l-9 11h28L5 1h5Z" />
            <path d="M0 10v6" />
          </g>
        ))}
      </g>
      <g fill="none" stroke="#8d704b" strokeWidth="3" strokeDasharray="6 7">
        <path d="M348 568 470 522 588 456 660 376 744 264" />
        <path d="M588 456 610 573 550 646" />
      </g>
      <g fontFamily="Georgia,serif" fill="#66583d" textAnchor="middle">
        <text x="495" y="94" fontSize="24" letterSpacing="7">
          DER GLASGRAT
        </text>
        <text
          x="776"
          y="416"
          fontSize="18"
          letterSpacing="4"
          transform="rotate(-9 776 416)"
        >
          NESSELWALD
        </text>
        <text x="281" y="324" fontSize="30" letterSpacing="6">
          ASTERHAIN
        </text>
        <text
          x="1043"
          y="260"
          fontSize="22"
          letterSpacing="5"
          fill="#e4e9cd"
          transform="rotate(14 1043 260)"
        >
          DAS STILLE MEER
        </text>
        <text x="765" y="722" fontSize="16" letterSpacing="4" fill="#e2e5ca">
          DIE SPLITTERINSELN
        </text>
      </g>
      <g fill="#c9cca0" stroke="#456e65" strokeWidth="5">
        <path d="m755 622 28-21 22 12-3 26-34 11Z" />
        <path d="m829 662 31-14 23 25-17 29-30-5Z" />
        <path d="m710 701 21-14 20 12-9 24-26-4Z" />
        <path d="m926 599 25-24 26 18-13 31-31-4Z" />
      </g>
      <g transform="translate(1060 600)" fill="none" stroke="#e2e2bc">
        <circle r="65" strokeOpacity=".5" />
        <circle r="49" strokeOpacity=".25" />
        <path
          d="M0-63 11-11 0 63-11 11Zm-63 63 52-11 74 11-52 11Z"
          fill="#e0dfb0"
          fillOpacity=".4"
        />
        <path d="m-36-36 72 72m0-72-72 72" strokeOpacity=".6" />
        <text
          x="0"
          y="-80"
          textAnchor="middle"
          fill="#e4e5c5"
          stroke="none"
          fontFamily="Georgia"
          fontSize="18"
        >
          N
        </text>
      </g>
      <rect
        x="25"
        y="25"
        width="1150"
        height="750"
        rx="3"
        fill="none"
        stroke="#e7dfb5"
        strokeOpacity=".7"
        strokeWidth="2"
      />
      <path
        d="M44 67V44h24m1064 0h24v23M44 734v22h24m1064 0h24v-23"
        fill="none"
        stroke="#e7dfb5"
        strokeWidth="3"
      />
    </svg>
  );
}
export function CityMap() {
  const houses = Array.from({ length: 300 }, (_, i) => {
    const col = i % 20,
      row = Math.floor(i / 20);
    return {
      x: 180 + col * 39 + (row % 2) * 8,
      y: 124 + row * 38,
      w: 23 + ((i * 7) % 12),
      h: 16 + ((i * 3) % 14),
      angle: ((i * 13) % 15) - 7,
    };
  }).filter(
    (p) =>
      ((p.x - 555) / 410) ** 2 + ((p.y - 400) / 305) ** 2 < 0.92 &&
      Math.abs(p.x - 576) > 32 &&
      Math.abs(p.y - 405) > 29 &&
      !(p.x > 756 && p.y > 330) &&
      !(p.x > 500 && p.x < 655 && p.y < 270),
  );
  const colors = ["#a57b52", "#b98e60", "#be9b6c", "#95704f", "#c2a379"];
  return (
    <svg
      className="atlas-art city-art"
      viewBox="0 0 1200 800"
      aria-hidden="true"
    >
      <rect width="1200" height="800" fill="#c5c8a1" />
      <path
        d="M857-20q-100 129-36 239t14 219q-64 107 10 210t34 180h228q36-126-22-243t-6-221q54-125-21-224t-12-160Z"
        fill="#6d9c9b"
      />
      <g stroke="#567b75" fill="none" opacity=".5">
        <path d="M896 30q-74 110-10 220t-15 219q-56 111 16 233" />
        <path d="M975 23q-68 110-10 220t-12 219q-47 107 18 246" />
      </g>
      <path
        d="M172 408q-4-259 267-307 256-53 408 130l54 159-72 200q-172 162-422 106Q173 644 172 408Z"
        fill="#e7d7af"
        stroke="#7d795d"
        strokeWidth="19"
      />
      <path
        d="M172 408q-4-259 267-307 256-53 408 130l54 159-72 200q-172 162-422 106Q173 644 172 408Z"
        fill="none"
        stroke="#c3b38b"
        strokeWidth="10"
        strokeDasharray="25 4"
      />
      <g fill="#bcb78c" opacity=".7">
        <ellipse cx="392" cy="325" rx="115" ry="95" />
        <ellipse cx="405" cy="545" rx="135" ry="105" />
      </g>
      <g stroke="#92734d" strokeWidth="1.1">
        {houses.map((p, i) => (
          <g
            key={i}
            transform={
              "translate(" + p.x + " " + p.y + ") rotate(" + p.angle + ")"
            }
          >
            <rect width={p.w} height={p.h} rx="1" fill={colors[i % 5]} />
            <path
              d={"M0 " + p.h / 2 + "H" + p.w}
              stroke="#6f563c"
              opacity=".6"
            />
            <path d={"M" + p.w / 2 + " 0v" + p.h} opacity=".3" />
          </g>
        ))}
      </g>
      <g fill="none" stroke="#f1e3bf" strokeWidth="22" strokeLinejoin="round">
        <path d="M636 104 579 237 576 406 454 536 425 697" />
        <path d="M175 410 390 402 576 406 720 442 899 429" />
        <path d="M306 182 385 274 390 402 352 559 260 608" />
        <path d="M390 402 510 303 576 237 737 245" />
      </g>
      <rect
        x="523"
        y="363"
        width="107"
        height="90"
        rx="12"
        fill="#cbb88d"
        stroke="#b29b70"
        strokeWidth="2"
      />
      <circle
        cx="577"
        cy="407"
        r="18"
        fill="#86a09a"
        stroke="#907c57"
        strokeWidth="5"
      />
      <g fill="#d8cfb0" stroke="#827457" strokeWidth="4">
        <path d="M554 166h68v70h-68Z" />
        <path d="M540 180h96v28h-96Z" />
        <path d="m560 166 28-28 28 28Z" />
      </g>
      <g fill="#9b7956" stroke="#735b42" strokeWidth="2">
        <rect x="842" y="467" width="112" height="14" />
        <rect x="829" y="519" width="100" height="12" />
        <rect x="838" y="574" width="129" height="14" />
        <path d="M930 449v43m-22 11v42m36 13v45" fill="none" />
      </g>
      <path d="M779 431h215" stroke="#766d53" strokeWidth="40" />
      <path d="M779 431h215" stroke="#d1c19a" strokeWidth="28" />
      <g fill="#d8c69e" stroke="#7d795d" strokeWidth="4">
        {[
          [186, 344],
          [185, 477],
          [343, 128],
          [515, 96],
          [728, 137],
          [844, 274],
          [858, 555],
          [674, 680],
          [468, 701],
          [282, 644],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="17" />
        ))}
      </g>
      <path d="M633 95 653 49" stroke="#ddcda7" strokeWidth="35" />
      <path d="M630 97 648 58M640 99 658 60" stroke="#9b8c66" strokeWidth="2" />
      <g
        fontFamily="Georgia,serif"
        fill="#745b3e"
        textAnchor="middle"
        letterSpacing="4"
      >
        <text x="400" y="304" fontSize="19">
          ALTSTADT
        </text>
        <text x="435" y="619" fontSize="18">
          HANDWERKERVIERTEL
        </text>
        <text
          x="1000"
          y="566"
          fontSize="19"
          transform="rotate(90 1000 566)"
          fill="#d7e4cf"
        >
          GRAUWASSER
        </text>
        <text x="815" y="656" fontSize="15">
          FLUSSPIERE
        </text>
      </g>
      <g transform="translate(1040 143)" stroke="#6d7659" fill="none">
        <circle r="55" />
        <path d="M0-43v86m-43-43h86" />
        <path d="m0-43 9 30-9-7-9 7Z" fill="#6d7659" />
        <text
          y="-67"
          textAnchor="middle"
          fill="#6d7659"
          stroke="none"
          fontFamily="Georgia"
          fontSize="17"
        >
          N
        </text>
      </g>
      <rect
        x="25"
        y="25"
        width="1150"
        height="750"
        fill="none"
        stroke="#8e906c"
        strokeWidth="2"
      />
    </svg>
  );
}
export function DungeonMap() {
  const id = useId().replace(/:/g, "");
  const rooms = [
    { x: 140, y: 300, w: 280, h: 170 },
    { x: 470, y: 100, w: 280, h: 170 },
    { x: 740, y: 300, w: 280, h: 240 },
    { x: 820, y: 590, w: 240, h: 140 },
    { x: 100, y: 560, w: 230, h: 150 },
  ];
  return (
    <svg
      className="atlas-art dungeon-art"
      viewBox="0 0 1200 800"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={id + "floor"}
          width="60"
          height="60"
          patternUnits="userSpaceOnUse"
        >
          <rect width="60" height="60" fill="#50584b" />
          <path
            d="M0 0h60v60H0zM5 4l4 3m43 45 3 4"
            fill="none"
            stroke="#78806a"
            strokeOpacity=".4"
          />
        </pattern>
        <pattern
          id={id + "rock"}
          width="37"
          height="37"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(40)"
        >
          <path d="M0 0v37" stroke="#53614e" strokeWidth="1" opacity=".35" />
        </pattern>
      </defs>
      <rect width="1200" height="800" fill="#26342c" />
      <rect width="1200" height="800" fill={"url(#" + id + "rock)"} />
      <g fill="none" strokeLinejoin="miter">
        <path
          d="M215 630V385H610V185M610 385H880V660H940"
          stroke="#18241e"
          strokeWidth="103"
        />
        <path
          d="M215 630V385H610V185M610 385H880V660H940"
          stroke="#8f9174"
          strokeWidth="86"
        />
        <path
          d="M215 630V385H610V185M610 385H880V660H940"
          stroke="#50584b"
          strokeWidth="62"
        />
      </g>
      {rooms.map((r, i) => (
        <g key={i}>
          <rect
            x={r.x - 12}
            y={r.y - 12}
            width={r.w + 24}
            height={r.h + 24}
            fill="#1c2922"
            stroke="#18241e"
            strokeWidth="10"
          />
          <rect
            x={r.x}
            y={r.y}
            width={r.w}
            height={r.h}
            fill={"url(#" + id + "floor)"}
            stroke="#a0a084"
            strokeWidth="13"
          />
          <rect
            x={r.x + 8}
            y={r.y + 8}
            width={r.w - 16}
            height={r.h - 16}
            fill="none"
            stroke="#65705b"
            strokeWidth="2"
          />
        </g>
      ))}
      <g stroke="#18261c" strokeWidth="18">
        <path d="M420 385h50M610 270v50M690 385h50M880 540v50M215 470v90" />
      </g>
      <g stroke="#9c8156" strokeWidth="8">
        <path d="M420 375h47M598 270v47M695 375h45M869 541v45M205 474v84" />
      </g>
      <g fill="#717760" stroke="#a3a087" strokeWidth="3">
        {[
          [782, 344],
          [976, 344],
          [782, 493],
          [976, 493],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="17" />
            <circle cx={x} cy={y} r="10" fill="#5b6651" />
          </g>
        ))}
      </g>
      <g fill="#8f8e74" stroke="#2c3b2d" strokeWidth="3">
        {[
          [795, 366],
          [926, 366],
          [795, 436],
          [926, 436],
        ].map(([x, y], i) => (
          <g key={i}>
            <rect x={x} y={y} width="38" height="53" rx="8" />
            <path d={"M" + (x + 19) + " " + (y + 9) + "v34m-10-25h20"} />
          </g>
        ))}
      </g>
      <g stroke="#b9a56e" strokeWidth="4">
        <path d="M154 607h72m-67 14h62m-57 14h52m-47 14h42m-37 14h32" />
      </g>
      <g stroke="#b7a06a" strokeWidth="10">
        <path d="M492 123h65m-65 18h65m-65 18h65M667 127h61m-61 18h61m-61 18h61" />
      </g>
      <path
        d="M195 334h98v42h-98Z"
        fill="#8a7350"
        stroke="#342f22"
        strokeWidth="6"
      />
      <circle
        cx="939"
        cy="660"
        r="35"
        fill="none"
        stroke="#bca66c"
        strokeWidth="2"
        strokeDasharray="9 5"
      />
      <path
        d="m939 629 27 47h-54Z"
        fill="none"
        stroke="#bca66c"
        strokeWidth="2"
      />
      <g fill="#af9c69" opacity=".75">
        {[
          [167, 325],
          [393, 439],
          [499, 238],
          [719, 129],
          [755, 325],
          [1003, 508],
          [842, 610],
          [1039, 710],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="5" />
        ))}
      </g>
      <g fontFamily="Georgia,serif" fill="#acb39b" letterSpacing="5">
        <text x="90" y="92" fontSize="26">
          UNTER DER ALTEN WACHT
        </text>
        <text x="90" y="125" fontSize="12" letterSpacing="3">
          KRYPTA · EBENE I
        </text>
      </g>
      <rect
        x="25"
        y="25"
        width="1150"
        height="750"
        fill="none"
        stroke="#79866c"
        strokeWidth="2"
      />
    </svg>
  );
}
