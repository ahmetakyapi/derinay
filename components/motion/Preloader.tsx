'use client'

import { useEffect, useRef, useState } from 'react'
import { INTRO_KEY, markIntroDone } from './intro'

/**
 * Açılış — "Galeri Penceresi" (oturumda BİR kez, yalnız landing).
 *
 * Sayaç YOK. Derinay'ın kendi motifleri sahneyi kurar:
 *   1. Kâğıt üstünde kemerli pencerenin çerçevesi ince bir çizgiyle çizilir.
 *   2. İçini çam gökyüzü aşağıdan doldurur; ufuk ve su çizgileri ortadan açılır.
 *   3. Altın güneş ufka doğru iner, orkide dalı kendi kendine çizilir.
 *   4. Altta "Derinay" harfleri yükselir, altın nokta konur.
 *   5. Pencere AÇILIR: kâğıtta kemer biçiminde bir delik büyür, resim çözülür
 *      ve pencereden sayfanın kendisi görünür; kahraman o sırada oynar.
 *
 * Kurulum (1–4) SAF CSS — ilk boyamadan başlar, hidrasyonu beklemez.
 * Çıkış (5) JS: kemer deliği `clip-path: path(evenodd, …)` ile her karede
 * yeniden yazılır (yalnız clip-path / transform / opacity; düzen değişmez).
 *
 * Görünürlük katmanları:
 *  - SSR perdeyi HER ZAMAN çizer → içerik bir kare bile perdesiz görünmez.
 *  - Layout'taki engelleyici script `html.intro-seen` koyar; CSS perdeyi ilk
 *    boyamadan gizler (aynı oturumda ikinci ziyaret / yenileme → perde yok).
 *  - Hareket azaltma: CSS gizler, burada da hemen biter.
 *  - JS hiç çalışmazsa CSS emniyeti (`intro-failsafe`) perdeyi 4.6 sn'de kaldırır.
 *  - Tıklama / tuş perdeyi beklemeden açar.
 */

const OPEN_MS = 700 // kemerin ekranı kaplayacak kadar büyümesi
const HOLD_MS = 60 // kurulum bittikten sonra kısa bir nefes
const LATE_MS = 4200 // hidrasyon bundan da geç kaldıysa sahneyi oynatma, kaldır

/** EASE_IN_OUT [0.76, 0, 0.24, 1] — perde eğrisi, JS karşılığı */
function easeInOut(t: number) {
  const x1 = 0.76, y1 = 0, x2 = 0.24, y2 = 1
  const bx = (u: number) => 3 * x1 * u * (1 - u) ** 2 + 3 * x2 * u ** 2 * (1 - u) + u ** 3
  const by = (u: number) => 3 * y1 * u * (1 - u) ** 2 + 3 * y2 * u ** 2 * (1 - u) + u ** 3
  let lo = 0, hi = 1, u = t
  for (let i = 0; i < 24; i++) {
    u = (lo + hi) / 2
    if (bx(u) < t) lo = u
    else hi = u
  }
  return by(u)
}

/** Kemer: üst köşe yarıçapı yatayda %50, dikeyde %40; alt köşeler hafif yuvarlak */
function archPath(cx: number, cy: number, w: number, h: number) {
  const x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy - h / 2, y1 = cy + h / 2
  const rx = w / 2, ry = h * 0.4, br = w * 0.09
  const f = (n: number) => n.toFixed(1)
  return (
    `M${f(x0)} ${f(y0 + ry)}A${f(rx)} ${f(ry)} 0 0 1 ${f(x1)} ${f(y0 + ry)}` +
    `L${f(x1)} ${f(y1 - br)}A${f(br)} ${f(br)} 0 0 1 ${f(x1 - br)} ${f(y1)}` +
    `L${f(x0 + br)} ${f(y1)}A${f(br)} ${f(br)} 0 0 1 ${f(x0)} ${f(y1 - br)}Z`
  )
}

/** Ekranın dört köşesini de içine alan en küçük büyütme katsayısı */
function coverScale(cx: number, cy: number, w: number, h: number, vw: number, vh: number) {
  const inside = (s: number) => {
    const W = w * s, H = h * s
    const top = cy - H / 2, bottom = cy + H / 2
    const rx = W / 2, ry = H * 0.4, ey = top + ry
    if (cx - W / 2 > 0 || cx + W / 2 < vw || bottom < vh) return false
    return [0, vw].every((x) =>
      [0, vh].every((y) => y >= ey || ((x - cx) / rx) ** 2 + ((y - ey) / ry) ** 2 <= 1),
    )
  }
  let s = 1.5
  while (!inside(s) && s < 80) s *= 1.06
  return s * 1.04
}

const WORD = 'Derinay'

export function Preloader() {
  const [gone, setGone] = useState(false)
  const paper = useRef<HTMLDivElement>(null)
  const art = useRef<HTMLDivElement>(null)
  const arch = useRef<HTMLDivElement>(null)
  const word = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLSpanElement>(null)
  const rim = useRef<SVGPathElement>(null)

  useEffect(() => {
    const html = document.documentElement
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (html.classList.contains('intro-seen') || reduced) {
      setGone(true)
      markIntroDone()
      return
    }

    let raf = 0
    let hold: ReturnType<typeof setTimeout> | undefined
    let introTimer: ReturnType<typeof setTimeout> | undefined
    let opening = false
    let cancelled = false

    const finish = () => {
      html.style.overflow = ''
      html.classList.add('intro-seen')
      try {
        sessionStorage.setItem(INTRO_KEY, '1')
      } catch {}
      markIntroDone()
      setGone(true)
    }

    // Hidrasyon çok geciktiyse CSS emniyeti zaten devrede — sahneyi atla
    if (performance.now() > LATE_MS) {
      finish()
      return
    }

    html.style.overflow = 'hidden'

    const open = () => {
      if (opening || cancelled) return
      opening = true
      const p = paper.current, a = art.current, wd = word.current, box = arch.current
      if (!p || !a || !wd || !box) return finish()

      const r = box.getBoundingClientRect()
      const vw = window.innerWidth, vh = window.innerHeight
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2
      const sMax = coverScale(cx, cy, r.width, r.height, vw, vh)
      const outer = `M0 0H${vw}V${vh}H0Z`
      const canHole =
        typeof CSS !== 'undefined' && CSS.supports('clip-path', 'path(evenodd, "M0 0H1V1H0Z")')

      // Resim katmanı kemerle birlikte büyür: kenarı deliğin kenarıyla örtüşür.
      // transform-origin katmanın KENDİ kutusuna göredir.
      const ar = a.getBoundingClientRect()
      a.style.transformOrigin = `${cx - ar.left}px ${cy - ar.top}px`
      a.style.willChange = 'transform, opacity'
      introTimer = setTimeout(markIntroDone, 110)

      const t0 = performance.now()
      const frame = (now: number) => {
        if (cancelled) return
        const t = Math.min((now - t0) / OPEN_MS, 1)
        const e = easeInOut(t)
        const s = 1 + (sMax - 1) * e
        const hole = archPath(cx, cy, r.width * s, r.height * s)
        // Deliğin kenarında altın bir saç teli: açılan pencere çerçeve gibi okunur
        rim.current?.setAttribute('d', hole)
        rim.current?.setAttribute('opacity', String(1 - e))
        if (canHole) {
          p.style.clipPath = `path(evenodd, "${outer}${hole}")`
        } else {
          p.style.opacity = String(1 - e)
        }
        a.style.transform = `scale(${s})`
        // Resim ilk %40'ta çözülür — pencereden önce gökyüzü, sonra sayfa görünür
        a.style.opacity = String(Math.max(0, 1 - t / 0.4))
        wd.style.opacity = String(Math.max(0, 1 - t / 0.28))
        wd.style.transform = `translate3d(0, ${-14 * Math.min(t / 0.28, 1)}px, 0)`
        if (t < 1) raf = requestAnimationFrame(frame)
        else finish()
      }
      raf = requestAnimationFrame(frame)
    }

    // Kurulumun son hareketi (altın nokta) bitince aç. Hidrasyon geç geldiyse
    // animasyon çoktan bitmiştir → `finished` hemen çözülür.
    const last = dot.current?.getAnimations?.()[0]
    if (last) {
      last.finished.then(
        () => (hold = setTimeout(open, HOLD_MS)),
        () => open(),
      )
    } else {
      hold = setTimeout(open, 1400)
    }

    // Beklemek istemeyen ziyaretçi: tıklama ya da tuş perdeyi hemen açar
    const skip = () => open()
    window.addEventListener('pointerdown', skip, { once: true })
    window.addEventListener('keydown', skip, { once: true })

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      clearTimeout(hold)
      clearTimeout(introTimer)
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('keydown', skip)
      html.style.overflow = ''
    }
  }, [])

  if (gone) return null

  return (
    <div className="preloader fixed inset-0 z-[400]" aria-hidden>
      {/* Kâğıt — çıkışta kemer biçiminde delinir */}
      <div ref={paper} className="absolute inset-0 bg-[var(--bg)]" />
      <svg className="pointer-events-none absolute inset-0 h-full w-full" fill="none">
        <path ref={rim} stroke="rgba(var(--gold),0.6)" strokeWidth="1.25" />
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-[6vh]">
        {/* Resim katmanı: hâle + çerçeve + pencere */}
        <div ref={art} className="relative">
          <div className="intro-halo absolute -inset-[45%] bg-[radial-gradient(closest-side,rgba(var(--gold),0.2),transparent)]" />

          <div className="relative aspect-[4/5] w-[clamp(9.5rem,25vmin,13.5rem)]">
            {/* Çerçeve — pencerenin biraz dışında, saç teli kalınlığında çizilir */}
            <svg
              viewBox="0 0 100 125"
              preserveAspectRatio="none"
              className="absolute -inset-[7px] h-[calc(100%+14px)] w-[calc(100%+14px)] overflow-visible"
              fill="none"
            >
              <path
                className="intro-frame"
                pathLength={1}
                d="M0 50A50 50 0 0 1 100 50L100 116A9 9 0 0 1 91 125L9 125A9 9 0 0 1 0 116Z"
                stroke="rgba(var(--line),0.4)"
                strokeWidth="0.55"
              />
            </svg>

            {/* Pencere — çam gökyüzü aşağıdan dolar */}
            <div
              ref={arch}
              className="intro-sky dark absolute inset-0 overflow-hidden bg-gradient-to-b from-indigo-700 via-indigo-900 to-indigo-950 shadow-2xl shadow-indigo-950/25 [border-radius:50%_50%_9%_9%/40%_40%_7.2%_7.2%]"
            >
              <div className="absolute inset-x-0 bottom-[30%] h-1/2 bg-[radial-gradient(60%_60%_at_50%_100%,rgba(var(--gold),0.35),transparent)]" />

              {/* Güneş — ufka iner */}
              <div className="intro-sun absolute left-[29%] top-[44%] h-[34%] w-[42%] rounded-full bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 shadow-[0_0_60px_rgba(var(--gold),0.55)]" />

              {/* Su — güneşin alt yarısını örter; yansıma çizgileri ortadan açılır */}
              <div className="absolute inset-x-0 bottom-0 top-[66%] bg-gradient-to-b from-indigo-950/90 to-indigo-950">
                {[0, 1, 2, 3, 4].map((n) => (
                  <span
                    key={n}
                    className="intro-line absolute h-[1.5px] rounded-full bg-amber-300/50"
                    style={{
                      top: `${14 + n * 17}%`,
                      width: `${46 - n * 7}%`,
                      left: `${27 + n * 3.5}%`,
                      animationDelay: `${520 + n * 60}ms`,
                    }}
                  />
                ))}
              </div>
              <span className="intro-line absolute inset-x-0 top-[66%] h-px bg-amber-200/60 [animation-delay:440ms]" />

              {/* Orkide — kendi kendine çizilir */}
              <svg
                viewBox="0 0 140 180"
                fill="none"
                className="absolute bottom-[5%] left-[3%] h-[70%] w-[50%]"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path className="intro-draw [animation-delay:380ms]" pathLength={1} d="M70 176 C66 140 78 116 72 86 C68 64 80 40 92 18" stroke="rgba(var(--pine-soft),0.85)" strokeWidth="2.4" />
                <path className="intro-draw [animation-delay:480ms]" pathLength={1} d="M71 132 C54 130 44 120 41 106 C56 109 67 118 71 132 Z" stroke="rgba(var(--pine-soft),0.7)" strokeWidth="2" />
                <path className="intro-draw [animation-delay:540ms]" pathLength={1} d="M73 100 C88 95 95 84 95 71 C82 77 74 87 73 100 Z" stroke="rgba(var(--pine-soft),0.65)" strokeWidth="2" />
                {[0, 72, 144, 216, 288].map((deg, i) => (
                  <ellipse
                    key={deg}
                    className="intro-draw"
                    style={{ animationDelay: `${620 + i * 40}ms` }}
                    pathLength={1}
                    cx="93"
                    cy="10.6"
                    rx="3.6"
                    ry="7.4"
                    transform={`rotate(${deg} 93 18)`}
                    stroke="rgba(var(--gold),0.95)"
                    strokeWidth="1.8"
                  />
                ))}
                {[0, 72, 144, 216, 288].map((deg, i) => (
                  <ellipse
                    key={`m${deg}`}
                    className="intro-draw"
                    style={{ animationDelay: `${700 + i * 40}ms` }}
                    pathLength={1}
                    cx="58"
                    cy="58.4"
                    rx="2.7"
                    ry="5.6"
                    transform={`rotate(${deg} 58 64)`}
                    stroke="rgba(var(--clay),0.8)"
                    strokeWidth="1.6"
                  />
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* Marka sözcüğü */}
        <div ref={word} className="mt-9 flex items-baseline sm:mt-10">
          <p className="flex overflow-hidden pb-[0.12em] font-display text-[2.1rem] font-bold leading-none tracking-[-0.05em] text-slate-900 dark:text-white sm:text-[2.5rem]">
            {WORD.split('').map((ch, i) => (
              <span key={i} className="intro-letter inline-block" style={{ animationDelay: `${480 + i * 40}ms` }}>
                {ch}
              </span>
            ))}
          </p>
          <span ref={dot} className="intro-dot ml-[0.12em] h-[0.5rem] w-[0.5rem] rounded-full bg-amber-500 sm:h-[0.58rem] sm:w-[0.58rem]" />
        </div>
      </div>
    </div>
  )
}
