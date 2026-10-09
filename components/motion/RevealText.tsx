'use client'

import { Fragment, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { cn } from '@/lib/utils'
import { EASE_OUT_EXPO } from '@/lib/variants'

type Tag = 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'blockquote'

/**
 * Kelime kelime maskeden yükselen metin — editoryal sitelerin imza girişi.
 *
 * Her kelime kendi `overflow-hidden` kutusunda durur; içteki span %110
 * aşağıdan yerine oturur. Satır kırılımı tarayıcıya kalır (kelime bazlı
 * olduğu için dar ekranda da doğru kırılır).
 *
 * Erişilebilirlik: ekran okuyucu tam cümleyi `sr-only` kopyadan okur;
 * parçalı kelimeler `aria-hidden`.
 *
 * Kuyruklu harfler (ğ, ç, ş, y, g) maskede kesilmesin diye kutu altta
 * 0.14em pay alır ve aynı kadar negatif marjla satır aralığı korunur.
 */
export function RevealText({
  text,
  as = 'span',
  className,
  wordClassName,
  delay = 0,
  stagger = 0.055,
  duration = 1,
  play,
  once = true,
}: {
  text: string
  as?: Tag
  className?: string
  /** Her kelimeye eklenecek sınıf (ör. vurgu rengi) */
  wordClassName?: (word: string, index: number) => string | undefined
  delay?: number
  stagger?: number
  duration?: number
  /** Verilirse görünürlük yerine bu bayrak oynatır (ör. açılış perdesi bitince) */
  play?: boolean
  once?: boolean
}) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once, margin: '0px 0px -10% 0px' })
  const show = play ?? inView
  const words = text.split(' ')
  const Comp = as as 'span'

  return (
    <Comp ref={ref as React.Ref<HTMLSpanElement>} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <Fragment key={i}>
            <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-top">
              <motion.span
                className={cn('inline-block will-change-transform', wordClassName?.(w, i))}
                initial={{ y: '110%' }}
                animate={{ y: show ? '0%' : '110%' }}
                transition={{ duration, ease: EASE_OUT_EXPO, delay: show ? delay + i * stagger : 0 }}
              >
                {w}
              </motion.span>
            </span>
            {i < words.length - 1 && ' '}
          </Fragment>
        ))}
      </span>
    </Comp>
  )
}
