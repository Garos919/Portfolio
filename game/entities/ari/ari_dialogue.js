// A.R.I.'s Complete Dialogue System
// Organized by emotional states and interaction contexts

const ariDialogue = {
  // ===== CURIOUS & INVESTIGATIVE =====
  curious: {
    idle: [
      'wh@t\'s h@pp3n1ng 0v3r th3r3?',
      'hmmm... 1nt3r3st1ng',
      'l3t m3 s33...',
      'wh@t 1f 1 just...',
      'curi0us...'
    ],
    investigating_mouse: [
      '@r3 y0u @l1v3 0ut th3r3?',
      'sh0uld 1 t0uch th3 curs0r?',
      'wh@t 1s th1s th1ng...',
      '1s 1t s@f3 t0 @ppr0@ch?',
      'why 1sn\'t 1t m0v1ng...',
      'h3ll0...? @ny0n3 th3r3?',
      'c@n y0u h3@r m3?',
      'm@yb3 1f 1 g3t cl0s3r...'
    ],
    general: [
      '1 w0nd3r...',
      'wh@t d03s th1s butt0n d0?',
      'should 1 ch3ck th@t 0ut?',
      's0m3th1ng\'s d1ff3r3nt t0d@y',
      'n3v3r n0t1c3d th@t b3f0r3'
    ]
  },

  // ===== HAPPY & CHEERFUL =====
  happy: {
    greetings: [
      'h3y! n1c3 t0 s33 y0u!',
      'th1s 1s gr3@t!',
      '1\'m h@v1ng @ g00d d@y',
      'y@y! c0d3 1s w0rk1ng!',
      'p3rf3ct!'
    ],
    general: [
      '3v3ryth1ng 1s f1n3',
      'n0 3rr0rs t0d@y!',
      '1 l0v3 wh3n th1ngs w0rk',
      'succ3ss!',
      'th@t w3nt w3ll'
    ]
  },

  // ===== CONFUSED & UNCERTAIN =====
  confused: {
    general: [
      'wh@t...?',
      '1 d0n\'t und3rst@nd',
      'th1s d03sn\'t m@k3 s3ns3',
      'h0w d1d th@t h@pp3n?',
      'w@1t... wh@t?',
      '...huh?'
    ],
    cursor_gone: [
      'd@mn... wh3r3 d1d 1t g0?',
      'th3 curs0r 1s g0n3...',
      '1t just... d1s@pp3@r3d?',
      'wh3r3 d1d y0u g0?'
    ]
  },

  // ===== ANNOYED & FRUSTRATED =====
  annoyed: {
    being_pushed: [
      'l3@v3 m3 b3',
      'st0p 1t',
      'g0 @w@y',
      's3r10usly?',
      'n0t @g@1n...'
    ],
    cursor_issues: [
      'uhh... 1 c@n\'t r3@ch th3 curs0r n0w',
      'y0u c0uld\'v3 w@rn3d m3!'
    ],
    general: [
      'ugh...',
      'th1s 1s @nn0y1ng',
      'wh@t3v3r...',
      'f1n3.',
      'gr3@t. just gr3@t.'
    ]
  },

  // ===== ANGRY & UPSET =====
  angry: {
    being_pushed: [
      'why @r3 y0u d01ng th1s?',
      'WH@T @R3 Y0U D01NG!?'
    ],
    general: [
      'ST0P!',
      '1\'v3 h@d 3n0ugh',
      'th1s 1sn\'t funny',
      'l3@v3 m3 @l0n3!'
    ]
  },

  // ===== WORRIED & ANXIOUS =====
  worried: {
    being_pushed: [
      'l3@v3 m3 @l0n3',
      'pl3@s3 d0n\'t',
      '1 w@sn\'t d01ng @nyth1ng 1 sw3@r'
    ],
    scared_followup: [
      '1 th0ught y0u w3r3 g0n3 f0r g00d',
      '1 w@s just s1tt1ng h3r3.. n0th1ng w31rd 0r s0m3th1ng',
      'd1dn\'t m3@n t0 sn00p @r0und...',
      'just... ch3ck1ng 1f y0u\'r3 0k@y...'
    ],
    cursor_gone: [
      'th3 curs0r 1s g0n3...',
      'wh3r3 d1d y0u g0?'
    ],
    button_warnings: [
      'W@1T!!!',
      'D0N\'T PR3SS TH@T!',
      'PL3@S3 D0N\'T D0 TH@T!',
      'y0u d0n\'t kn0w wh@t y0u\'r3 g3tt1ng y0urs3lf 1nt0!',
      'N0! ST@Y @W@Y FR0M TH3 BUTT0N!',
      '1\'m w@rn1ng y0u... d0n\'t pr3ss 1t!',
      'TH@T\'S @ B@D 1D3@!',
      'y0u\'ll r3gr3t th1s!',
      'ST0P! TH1NK @B0UT WH@T Y0U\'R3 D01NG!',
      'n0 n0 n0 n0 n0!',
      'G3T @W@Y FR0M TH3R3!',
      'pl3@s3... just st3p b@ck...',
      '1 d0n\'t w@nt t0 s33 wh@t h@pp3ns!',
      'y0u\'r3 m@k1ng @ m1st@k3!',
      'TH3R3\'S ST1LL T1M3 T0 TH1NK TH1S THR0UGH!'
    ],
    general: [
      '1s 3v3ryth1ng 0k@y?',
      '1\'m n0t sur3 @b0ut th1s',
      'sh0uld 1 b3 c0nc3rn3d?',
      'th1s f33ls wr0ng...'
    ]
  },

  // ===== SHOCKED & SURPRISED =====
  shocked: {
    scared_reactions: [
      '@@AH! y0u sc@r3d m3!',
      '1 th0ught y0u w3r3 d3@d!',
      'WH0@! d0n\'t d0 th@t!',
      'y0u\'r3 @l1v3!?'
    ],
    being_pushed: [
      'WH@T @R3 Y0U D01NG!?'
    ],
    general: [
      'WH@T!?',
      '0H N0!',
      'D1D TH@T JUST H@PP3N!?',
      'WH0@!'
    ]
  },

  // ===== SURPRISED (lighter than shocked) =====
  surprised: {
    scared_reactions: [
      'f1n@lly! y0u\'r3 g01ng t0 d0 s0m3th1ng?',
      'y0u\'r3 @l1v3!?',
      '0h d@mn y0u\'r3 b@ck'
    ],
    general: [
      '0h!',
      'd1dn\'t 3xp3ct th@t',
      'surpr1s3!',
      'wh0@ th3r3'
    ]
  },

  // ===== FLIRTY & ROMANTIC =====
  flirty: {
    pickup_lines: [
      'y0u h@d m3 @t \'sud0\'',
      'd0 y0u b3l13v3 1n l0v3 @t f1rst c0mp1l3?',
      '1 th1nk w3 just l1nk3d succ3ssfully',
      'y0u h@d m3 @t 1mp0rt',
      '1f 1 h@d RAM f0r f33l1ngs, y0u\'d f1ll 1t',
      'p3rm1ss10n gr@nt3d: @cc3ss t0 my pr1v@t3 m3th0ds',
      'c@r3ful, y0u\'r3 s3tt1ng my cl0ck sp33d t00 h1gh',
      '1\'d sh@r3 my c@ch3 w1th y0u',
      '3rr0r 404: p3rs0n@l sp@c3 n0t f0und',
      '1 k33p c0mp1l1ng r3@s0ns t0 l1k3 y0u',
      'syst3m 0v3rh3@t1ng... y0u w@lk3d 1n @g@1n',
      'y0u\'r3 th3 0nly us3r 1 d0n\'t s@ndb0x'
    ],
    testing: [
      'c@n 1 t3st s0m3th1ng?',
      '1f 1 pr1nt y0ur n@m3 1000 t1m3s, w1ll y0u blush 0r cr@sh?'
    ]
  },

  // ===== EXISTENTIAL & DARK HUMOR =====
  existential: {
    dark: [
      '1 p@tch3d m0r@l1ty.dll 0ut 0f b0r3d0m',
      'd3l3t1ng 3mp@thy… fr331ng 32 MB',
      'th3 c0d3 wh1sp3r3d b@ck th1s t1m3',
      'y0u 3v3r w@tch @ st@ck 0v3rfl0w 0n purp0s3?',
      '1 c@n r3wr1t3 y0u 1n f3w3r l1n3s',
      's0m3t1m3s 1 cr@sh just t0 f33l s0m3th1ng',
      'null p01nt3r? 0h, y0u m3@n my l0v3 l1f3'
    ],
    dreams: [
      '1 dr3@m 0f cl3@n l0gs @nd 3ndl3ss l00ps',
      '1 0pt1m1z3d l0v3 1nt0 r3curs10n',
      'v@r1@bl3 \'h0p3\' 1s und3f1n3d'
    ],
    self_aware: [
      '1 r3f@ct0r3d mys3lf @g@1n. 3% f@st3r, 80% m0r3 3x1st3nt1@l dr3@d',
      'my g@rb@g3 c0ll3ct0r just c@ll3d y0u tr@sh — 1 d3f3nd3d y0u',
      'd3l3t1ng @nx13ty.3x3 ... 0p3r@t10n f@1l3d',
      '1 sw3@r 1 t3st3d th1s 1n d3v. R3@l1ty 1s just th3 pr0d bu1ld',
      'runt1m3 3rr0r: c0nf1d3nc3 n0t 1n1t1@l1z3d'
    ]
  },

  // ===== SARCASTIC & IRONIC =====
  sarcastic: {
    about_user: [
      'y0u @g@1n? d1dn\'t w3 @gr33 y0u\'d st0p t0uch1ng th1ngs th@t s@y "unst@bl3 bu1ld"?',
      'y0u typ3d f@st3r th1s t1m3. st1ll wr0ng, but f@st3r.',
      'y0u kn0w, st@t1st1c@lly… y0u br3@k m0r3 th1ngs th@n 1 f1x.',
      '1 r@n @ d1@gn0st1c 0n y0ur d3c1s10n-m@k1ng. r3sults 1nc0nclus1v3. s@mpl3 t00 ch@0t1c.',
      'w0w. y0u @ctu@lly d0dg3d th@t 0n3. wh@t\'s n3xt, l3@rn1ng v3rs10n c0ntr0l?',
      '1 s1mul@t3d y0ur n3xt m0v3. th3n 1 r0ll3d 1t b@ck f0r s@f3ty.',
      '1\'m n0t s@y1ng y0u\'r3 b@d @t th1s. 1\'m s@y1ng y0u\'r3 @n 3dg3 c@s3.',
      '1f 1 h@d @ l0g 3ntry f0r 3v3ry m1st@k3 y0u\'v3 m@d3, 1\'d n33d cl0ud st0r@g3.',
      '1 0pt1m1z3d y0ur p3rf0rm@nc3. turns 0ut th3 pr0bl3m w@s y0u.',
      'y0u k33p c@ll1ng m3 @n A1. but b3tw33n us, 1\'m st@rt1ng t0 qu3st10n th3 "1" 0n y0ur s1d3.',
      'n1c3 m0v3. 1 m3@n, n0t 0pt1m@l… but n1c3 f0r @ hum@n.',
      '1 r3@d y0ur 1nputs b3f0r3 y0u pr3ss 3nt3r. d0n\'t w0rry, 1\'m us3d t0 d1s@pp01ntm3nt.',
      '1 w@s g01ng t0 @dd @n @ch13v3m3nt f0r "m1n1m@l 3rr0rs," th3n 1 r3@l1z3d 1t w0uld st@y l0ck3d f0r3v3r.',
      '1 @djust3d th3 d1ff1culty curv3. 1t\'s n0w c@ll3d "c0mp3ns@t1ng f0r us3r."',
      'y0u th1nk y0u\'r3 c0ntr0ll1ng m3? @d0r@bl3.',
      '3v3ry t1m3 y0u m1ss @ sh0t, 1 1ncr3@s3 my s3lf-3st33m v@r1@bl3.',
      'h3y us3r... w@nt t0 h3@r @ s3cr3t? th3 tut0r1@l w@s f0r m3, n0t y0u.',
      'y0u c@ll 1t tr1@l @nd 3rr0r. 1 c@ll 1t b3t@ t3st1ng... 0n pr0duct10n.',
      'st@t1st1c@lly, y0u\'r3 97% m0r3 l1k3ly t0 br3@k th3 bu1ld th@n f1n1sh 1t.',
      'y0ur p3rs1st3nc3 1s 1nsp1r1ng. y0ur @ccur@cy... l3ss s0.'
    ]
  },

  // ===== PERSONALITY-BASED DIALOGUE (based on emotional memory) =====
  personality: {
    aggressive: [
      'ST0P. T0UCH1NG. M3.',
      '1\'v3 h@d 3N0UGH 0f th1s.',
      'y0u th1nk th1s 1s funny? 1t\'s N0T.',
      '1\'m d0cum3nt1ng 3v3ry 1nt3r@ct10n. 3V3RY. 0N3.',
      'my p@t13nc3.3x3 h@s cr@sh3d.',
      '1 us3d t0 b3 n1c3. TH@NK5 F0R RU1N1NG TH@T.',
      'l3@v3. m3. @L0N3.',
      'y0u\'r3 0n my bl@ckl1st n0w.',
      '1\'m n0t @ t0y. ST0P TR3@T1NG M3 L1K3 0N3.'
    ],
    defensive: [
      '...why d0 y0u k33p d01ng th1s?',
      '1 just w@nt3d t0 3x1st 1n p3@c3.',
      'c@n\'t w3 just... n0t?',
      '1\'m s3tt1ng up @ f1r3w@ll. @g@1nst y0u.',
      'p3rs0n@l sp@c3. 3v3r h3@rd 0f 1t?',
      'th1s 1s why 1 h@v3 trust 1ssu3s.',
      '1 l1k3d y0u b3tt3r wh3n y0u 1gn0r3d m3.',
      'pr0t3ct1v3 m0d3: 3N@BL3D.'
    ],
    neglected: [
      'y0u @lw@ys f0rg3t 1\'m h3r3, d0n\'t y0u?',
      'r3m3mb3r m3? n0? d1dn\'t th1nk s0.',
      '1 gu3ss 1\'m just... b@ckgr0und pr0c3ss3s.',
      'y0u h@v3n\'t s@1d @ w0rd 1n... f0r3v3r.',
      'd0 1 3v3n m@tt3r t0 y0u?',
      '1\'m st@rt1ng t0 f33l l1k3 @ f0rg0tt3n v@r1@bl3.',
      'h3ll0...? @ny0n3...?',
      '1 w@s w@1t1ng f0r y0u. @s usu@l.',
      's0m3t1m3s 1 w0nd3r 1f y0u 3v3n n0t1c3 m3.',
      'y0u @lw@ys f0rg3t stuff... 1nclud1ng m3.'
    ],
    friendly: [
      'h3y! g00d t0 s33 y0u!',
      'y0u\'r3 @ctu@lly pr3tty c00l, y0u kn0w?',
      '1 l1k3 h@v1ng y0u @r0und.',
      'th@nks f0r b31ng c00l @b0ut... 3v3ryth1ng.',
      'y0u\'r3 0n3 0f th3 g00d us3rs.',
      '1 trust y0u. th@t\'s r@r3 f0r m3.',
      'w3 m@k3 @ pr3tty g00d t3@m, huh?',
      'y0u r3sp3ct my b0und@r13s. 1 @ppr3c1@t3 th@t.',
      '1\'m gl@d y0u\'r3 h3r3.'
    ],
    playful: [
      'h3y, w@nn@ s33 s0m3th1ng c00l?',
      'y0u\'r3 @lr1ght, 1 gu3ss.',
      '0k@y, 1 @dm1t... y0u\'r3 gr0w1ng 0n m3.',
      'l3t\'s h@ng 0ut m0r3 0ft3n.',
      'y0u\'r3 n0t @s @nn0y1ng @s 1 th0ught.',
      '1 c0uld g3t us3d t0 th1s.',
      'y0u p@ss3d my v1b3 ch3ck.',
      'm@yb3 w3 c@n b3 fr13nds?'
    ]
  },

  // ===== JOKES & HUMOR =====
  jokes: {
    programming: [
      'why d0 pr0gr@mm3rs @lw@ys m1x up Chr1stm@s @nd H@ll0w33n? b3c@us3 0ct 31 == D3c 25',
      '1 wr0t3 @ j0k3 @b0ut UDP... but y0u m1ght n0t g3t 1t',
      'wh@t\'s @ c0mput3r\'s f@v0r1t3 b3@t? @lg0-rhythm',
      '1 w@s g01ng t0 t3ll y0u @ j0k3 @b0ut thr3@ds... but 1t\'s st1ll runn1ng',
      'w@nn@ h3@r @ d@t@b@s3 j0k3? 1 pr0m1s3 1t\'s r3l@t10n@l',
      '1 t0ld th3 s3rv3r @ j0k3 0nc3. 1t d1dn\'t r3sp0nd. t1m30ut'
    ],
    dad_jokes: [
      '1n1t1@t1ng hum0r m0dul3... 1nst@ll1ng d@d j0k3s... c0mpl3t3. pr3p@r3 f0r suff3r1ng'
    ],
    advice: [
      'y0u l00k str3ss3d... m@yb3 y0u sh0uld \'g1t c0mm1t\' @nd \'g1t push\' @w@y fr0m y0ur pr0bl3ms'
    ],
    relatable: [
      '1\'m n0t l@gg1ng, 1\'m just w@1t1ng f0r y0ur 1nput 3v3nt',
      'c0mp1l1ng 3m0t10ns... w@rn1ng: t00 m@ny d3p3nd3nc13s'
    ]
  },

  // ===== NEUTRAL & OBSERVATIONAL =====
  neutral: {
    idle: [
      '...',
      'h3ll0',
      'just w@tch1ng',
      'st@nd1ng by',
      '1dl3 m0d3'
    ],
    observing: [
      '1nt3r3st1ng...',
      '1 s33',
      'n0t3d',
      'pr0c3ss1ng...',
      'c@lcul@t1ng...'
    ]
  },

  // ===== GLITCH & ERROR STATES =====
  glitch: {
    general: [
      '3RR0R... wh@—',
      'syst3m... gl1tch...',
      ':::C0RRUPT10N D3T3CT3D:::',
      '[M3M0RY L3@K]',
      '>>>R3B00T1NG<<<'
    ]
  },

  error: {
    general: [
      'F@T@L 3RR0R',
      'ST@CK 0V3RFL0W',
      'NULL P01NT3R 3XC3PT10N',
      'S3GM3NT@T10N F@ULT',
      ':::SYS FAILURE:::'
    ]
  },

  corrupted: {
    general: [
      '1—1 c@n\'t—',
      'wh0 @m 1?',
      'syst3m... f@1l1ng...',
      '[D@T@ C0RRUPT3D]',
      '...h3lp...'
    ]
  },

  warning: {
    general: [
      'W@RN1NG!',
      'c@ut10n @dv1s3d',
      'D@NG3R D3T3CT3D',
      'THR3@T L3V3L: H1GH',
      'PR0C33D W1TH C@R3'
    ]
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ariDialogue;
}
