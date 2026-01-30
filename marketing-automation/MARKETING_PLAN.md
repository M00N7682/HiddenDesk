# HiddenDesk 홍보 전략

## 타겟 분석

### 핵심 타겟
| 타겟 | 특징 | 접근 채널 |
|------|------|----------|
| **직장인** | 업무 중 몰래 쉬고 싶음 | 블라인드, 에펨코리아, Reddit |
| **개발자/IT** | VS Code, Terminal 익숙 | HackerNews, Reddit, Twitter |
| **웹게임 덕후** | 브라우저 게임 좋아함 | r/WebGames, Discord |

### HiddenDesk USP (차별점)
- "업무용 앱으로 완벽 위장"
- "ESC 한 번으로 진짜 업무화면 전환"
- "설치 없이 브라우저에서 바로"

---

## 채널별 전략

### 🟢 Tier 1: 자동화 가능 + 높은 효과

#### 1. Reddit
**타겟 서브레딧:**
| 서브레딧 | 구독자 | 적합도 | 포스팅 유형 |
|----------|--------|--------|------------|
| r/WebGames | 470K | ⭐⭐⭐⭐⭐ | 게임 소개 |
| r/IndieGaming | 390K | ⭐⭐⭐⭐⭐ | 개발 스토리 |
| r/playmygame | 70K | ⭐⭐⭐⭐⭐ | 피드백 요청 |
| r/gamedev | 1.4M | ⭐⭐⭐⭐ | 기술/개발 얘기 |
| r/programming | 6M | ⭐⭐⭐ | "VS Code 게임 만듦" |
| r/antiwork | 2.7M | ⭐⭐⭐⭐⭐ | "회사에서 몰래..." |

**콘텐츠 전략:**
```
✅ "I made games disguised as work apps"
✅ "What work app should I disguise a game as next?"
✅ 개발 과정 behind-the-scenes
✅ GIF/영상 필수 (Excel에서 게임하는 모습)

❌ 직접적인 광고 톤
❌ 같은 내용 여러 서브레딧 동시 포스팅
```

**자동화:** PRAW로 가능, 10분 간격 포스팅

---

#### 2. Discord
**타겟 서버:**
| 서버 | 멤버 | 홍보 채널 |
|------|------|----------|
| [Game Dev Network](https://discord.com/invite/gdn) | 64K | #showcase |
| [Indie Games Community](https://discord.me/indiegamescommunity) | 30K+ | #game-dev-promo |
| Brackeys Community | 92K | #showcase |
| Bestindiegames | - | #upcoming-indie-games |

**콘텐츠:**
- 임베드 + GIF 조합
- 주기적 업데이트 알림

**자동화:** 웹훅으로 즉시 가능

---

#### 3. Telegram
**전략:**
- HiddenDesk 공식 채널 생성 (@hiddendesk_kr)
- 새 게임/업데이트 알림
- 한국 직장인 타겟 밈 콘텐츠

**자동화:** Bot API로 가능

---

### 🟡 Tier 2: 수동 but 높은 임팩트

#### 4. Hacker News (Show HN)
**왜 좋은가:**
- 개발자 타겟 정확히 맞음
- "VS Code로 위장한 게임" = HN 취향 저격
- 상위 노출 시 10,000+ 방문자

**포스팅 전략:**
```
제목: Show HN: I made browser games disguised as VS Code, Excel, and Terminal

- 기술적인 내용 포함 (Remotion, React 등)
- GitHub 링크 있으면 더 좋음
- "I made..." 톤 유지
- 월요일 아침(PST) 포스팅
```

**할 일:**
- [ ] HN 계정 만들기 (또는 기존 계정 활성화)
- [ ] 2주 정도 커뮤니티 참여
- [ ] Show HN 포스팅

---

#### 5. Product Hunt
**왜 좋은가:**
- 런칭 이벤트로 큰 트래픽
- "Product of the Day" 가능성
- 주말 런칭 시 경쟁 적음 (평균 366 upvote로 1위 가능)

**준비물:**
- [ ] 썸네일 이미지 (1270x760)
- [ ] 짧은 데모 영상 (30초)
- [ ] 태그라인: "Play games at work without getting caught"
- [ ] Coming Soon 페이지 먼저 등록

**타이밍:** 토요일 00:01 PST 런칭 추천

---

#### 6. Twitter/X
**왜 좋은가:**
- GIF 바이럴 가능성
- #indiedev #gamedev 커뮤니티 활발
- 개발자 네트워크 효과

**콘텐츠 전략:**
```
✅ 짧은 GIF (Excel에서 게임하는 모습)
✅ 개발 과정 스레드
✅ "회사에서 이거 하다 걸리면..." 밈
✅ #screenshotsaturday 참여

해시태그: #indiedev #gamedev #webgame #indiegame
```

**할 일:**
- [ ] HiddenDesk 공식 계정 생성
- [ ] 프로필/배너 설정
- [ ] 첫 스레드 작성

---

### 🔴 Tier 3: 수동 (한국 커뮤니티)

#### 7. 블라인드
**왜 좋은가:**
- 정확한 타겟 (직장인)
- "회사에서 몰래" 컨셉 완벽 fit
- 바이럴 시 폭발적 확산

**리스크:**
- 광고 티 나면 역효과
- 회사 이메일 인증 필요

**콘텐츠 톤:**
```
"ㅋㅋㅋ 이거 실화냐 회사에서 엑셀로 위장한 게임 발견함"
"솔직히 이거 만든 사람 천재 아님?"
```

---

#### 8. 에펨코리아
**왜 좋은가:**
- 유머/게임 콘텐츠 활발
- 포텐 터지면 대형 바이럴

**콘텐츠 톤:**
```
"직장인 게임 만들어봤는데 평가 좀 ㅋㅋ"
"ESC 누르면 진짜 엑셀로 바뀜ㅋㅋㅋㅋ"
```

---

#### 9. 디시인사이드
**타겟 갤러리:**
- 웹게임 갤러리
- 인디게임 갤러리
- 프로그래밍 갤러리

**톤:** 더 캐주얼하게

---

#### 10. 클리앙 (모두의공원)
**특징:**
- IT/개발자 많음
- 자작 콘텐츠 호응 좋음

---

## 우선순위 액션 플랜

### Phase 1: 즉시 (자동화 세팅)
| 순서 | 플랫폼 | 할 일 | 난이도 |
|------|--------|-------|--------|
| 1 | Discord | 웹훅 설정, 첫 포스팅 | ⭐ |
| 2 | Telegram | 봇 생성, 채널 개설 | ⭐ |
| 3 | Reddit | 앱 등록, PRAW 연결 | ⭐⭐ |

### Phase 2: 1주일 내
| 순서 | 플랫폼 | 할 일 | 난이도 |
|------|--------|-------|--------|
| 4 | Twitter | 계정 생성, 첫 GIF 포스팅 | ⭐⭐ |
| 5 | Product Hunt | Coming Soon 등록 | ⭐⭐ |
| 6 | HN | 계정 활성화, 커뮤니티 참여 시작 | ⭐⭐ |

### Phase 3: 2-3주 후 (런칭 이벤트)
| 순서 | 플랫폼 | 할 일 |
|------|--------|-------|
| 7 | Product Hunt | 공식 런칭 |
| 8 | Hacker News | Show HN 포스팅 |
| 9 | Reddit | r/IndieGaming 등 대형 포스팅 |

### Phase 4: 지속 (한국 커뮤니티)
| 플랫폼 | 주기 | 콘텐츠 |
|--------|------|--------|
| 블라인드 | 1회 | 바이럴용 글 |
| 에펨코리아 | 1회 | 유머 톤 |
| 디시인사이드 | 1회 | 갤러리별 맞춤 |

---

## 콘텐츠 에셋 필요 목록

### 필수
- [ ] 30초 데모 영상 (이미 Remotion으로 있음)
- [ ] GIF 3-5개 (각 게임별 플레이 장면)
- [ ] 썸네일 이미지 (1270x760 for PH)
- [ ] 스크린샷 세트

### 있으면 좋음
- [ ] Behind-the-scenes 개발 스토리
- [ ] "ESC 전환" 비포/애프터 GIF
- [ ] 밈용 이미지

---

## 메시지 템플릿

### 영어 (Reddit, HN, PH, Discord)
```
🎮 HiddenDesk - Browser games disguised as work apps

Ever wanted to play games at work without getting caught?

I built 7 browser games that look exactly like:
• Excel spreadsheets
• VS Code editor
• Terminal console
• Git client
• And more...

The secret: Press ESC anytime to instantly switch to a real-looking work screen!

🔗 Play now: hiddendesk.ddstudio.co.kr
```

### 한국어 (블라인드, 에펨, 디시)
```
ㅋㅋㅋ 회사에서 엑셀로 위장한 게임 발견함

이거 진짜 엑셀처럼 생겼는데 알고보니 슈팅게임임
ESC 누르면 진짜 업무화면으로 바뀜ㅋㅋㅋㅋ

VS Code, 터미널 버전도 있음
개발자 만든거 같은데 센스 미쳤다

hiddendesk.ddstudio.co.kr
```

---

## 참고 자료

- [Reddit 인디게임 마케팅 가이드](https://www.cloutboost.com/blog/how-to-market-a-video-game-on-reddit-the-complete-2025-guide-for-game-developers)
- [Product Hunt 런칭 가이드](https://openhunts.com/blog/product-hunt-launch-guide-2025)
- [Show HN 가이드라인](https://news.ycombinator.com/showhn.html)
- [인디게임 Discord 서버 목록](https://gamedevelopermarketing.com/indie-game-dev-discords/)
- [Twitter 게임 마케팅](https://howtomarketagame.com/2021/02/08/how-to-use-twitter-to-market-your-game/)
