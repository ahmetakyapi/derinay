import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

/* Next 16'da `next lint` yok; ESLint doğrudan çalışır ("lint": "eslint ."). */
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    /* eslint-config-next 16, react-hooks 7'nin React Compiler kurallarını
       getiriyor; projede derleyici KAPALI. Yakaladıkları desenler bilinçli:
       state SSR ile aynı değerle başlar, mount'tan SONRA efektte senkronlanır
       (useMounted, gizlilik modu, taslak geri yükleme, açılış perdesi —
       CLAUDE.md §10 "State'i DOM'dan başlatma"). Bunları yeniden yazmak
       platform geçişinin dışında bir davranış değişikliği; derleyici
       açılırsa ayrı iş olarak ele alınır. */
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'drizzle/**', 'next-env.d.ts']),
])
