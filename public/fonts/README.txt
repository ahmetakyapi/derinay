lira.woff2
==========

Tek glifli (U+20BA — Türk lirası işareti ₺) alt küme.
Kaynak: IBM Plex Mono Medium.

NEDEN VAR
---------
Uygulamanın gövde/başlık ailesi Schibsted Grotesk, U+20BA'yı ÇİFT ÇİZGİLİ £
olarak çiziyor — Türk lirası işareti değil. Bu dosya globals.css'te
`unicode-range: U+20BA` ile tanımlanır ve font yığınının BAŞINA konur; böylece
₺ karakteri, yazıldığı öge hangi ailede olursa olsun doğru glifi alır.
Diğer tüm karakterler etkilenmez (unicode-range yalnız bu kod noktasını kapsar).

Yeniden üretmek için: IBM Plex Mono Medium'u fonttools ile U+20BA'ya alt küme al.

LİSANS
------
IBM Plex is licensed under the SIL Open Font License, Version 1.1.
Copyright © 2017 IBM Corp. with Reserved Font Name "Plex".
https://github.com/IBM/plex/blob/master/LICENSE.txt


fraunces-dinlendir.woff2
========================

Fraunces (soft italic) — YALNIZ "Dinlendir" kelimesinin harfleri (D d e i l n r),
wght 400 ve SOFT 100'e sabitlenmiş durağan örnek (~2 KB). Landing manşetindeki tek
serif vurgu için; paketin 78 KB'lık latin dosyası her ziyarette iniyordu.

Yeniden üretmek için (fonttools + brotli):
  kaynak: node_modules/@fontsource-variable/fraunces/files/fraunces-latin-soft-italic.woff2
  1. varLib.instancer: {'wght': 400, 'SOFT': 100}
  2. subset: text='Dinlendir', flavor woff2, layout_features='*'
Vurgu kelimesi değişirse yeni harflerle yeniden üret ve globals.css'teki
unicode-range'i güncelle.

LİSANS: Fraunces — SIL Open Font License 1.1, Copyright 2018 The Fraunces Project Authors.
