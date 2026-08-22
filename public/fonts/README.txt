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
