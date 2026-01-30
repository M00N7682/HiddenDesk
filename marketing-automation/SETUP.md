# HiddenDesk Marketing Automation - 셋업 가이드

## 1. 환경 설정

```bash
cd /Users/levit/HiddenDesk/marketing-automation

# 가상환경 생성 (권장)
python3 -m venv venv
source venv/bin/activate

# 패키지 설치
pip install -r requirements.txt

# 환경변수 파일 생성
cp .env.example .env
```

---

## 2. Reddit API 설정

### 2.1 Reddit 앱 생성

1. https://www.reddit.com/prefs/apps 접속
2. 하단 "create another app..." 클릭
3. 설정:
   - **name**: `HiddenDesk Marketing`
   - **type**: `script` 선택
   - **description**: 아무거나
   - **about url**: `https://hiddendesk.ddstudio.co.kr`
   - **redirect uri**: `http://localhost:8080`
4. "create app" 클릭
5. 생성된 앱에서:
   - **client_id**: 앱 이름 아래 있는 문자열
   - **client_secret**: "secret" 옆의 문자열

### 2.2 .env 설정

```env
REDDIT_CLIENT_ID=앱_이름_아래_문자열
REDDIT_CLIENT_SECRET=secret_옆_문자열
REDDIT_USERNAME=내_Reddit_아이디
REDDIT_PASSWORD=내_Reddit_비밀번호
REDDIT_USER_AGENT=HiddenDesk Marketing Bot v1.0 (by /u/내아이디)
```

### 2.3 주의사항

- 새 계정은 일부 서브레딧에서 포스팅 제한됨 (karma 필요)
- 같은 내용 여러 곳에 올리면 스팸 처리될 수 있음
- 서브레딧별 규칙 확인 필수

---

## 3. Discord 웹훅 설정

### 3.1 웹훅 생성

1. Discord 서버 접속
2. 원하는 채널에서 우클릭 → "채널 편집"
3. 좌측 메뉴에서 "연동" 클릭
4. "웹후크" 섹션에서 "웹후크 만들기" 클릭
5. 이름 설정 (예: HiddenDesk Bot)
6. "웹후크 URL 복사" 클릭

### 3.2 .env 설정

```env
DISCORD_WEBHOOK_WEBGAMES=https://discord.com/api/webhooks/xxx/yyy
DISCORD_WEBHOOK_INDIEGAMES=https://discord.com/api/webhooks/xxx/yyy
```

### 3.3 타겟 서버 추천

- 인디게임 관련 Discord 서버 찾아서 자기소개/홍보 채널에 웹훅 설정
- 본인 서버 만들어서 업데이트 채널 운영

---

## 4. Telegram 봇 설정

### 4.1 봇 생성

1. Telegram에서 `@BotFather` 검색
2. `/newbot` 명령어 전송
3. 봇 이름 입력 (예: `HiddenDesk News`)
4. 봇 username 입력 (예: `hiddendesk_bot`)
5. **토큰 복사** (형식: `123456789:ABCdef...`)

### 4.2 채널 생성 및 봇 추가

1. Telegram에서 새 채널 생성
2. 채널 유형: Public
3. 채널 username 설정 (예: `@hiddendesk_updates`)
4. 채널 설정 → 관리자 → 관리자 추가
5. 만든 봇을 관리자로 추가 (메시지 게시 권한 부여)

### 4.3 .env 설정

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHANNEL_ID=@hiddendesk_updates
```

---

## 5. 사용법

### 연결 상태 확인

```bash
python main.py status
```

### 테스트 (Dry Run)

```bash
# 모든 플랫폼 테스트
python main.py post --dry-run

# Reddit만 테스트
python main.py post --platform reddit --dry-run
```

### 실제 포스팅

```bash
# 모든 플랫폼에 포스팅
python main.py post --live

# 특정 플랫폼만
python main.py post --platform discord --live
python main.py post --platform telegram --live
python main.py post --platform reddit --live
```

### 서브레딧 규칙 확인

```bash
python main.py subreddits
```

---

## 6. 커스텀 포스트 작성

### config/settings.py 수정

`TEMPLATES` 딕셔너리에서 메시지 내용 수정:

```python
TEMPLATES = {
    "reddit_launch": {
        "title": "제목...",
        "body": "본문...",
    },
    # ...
}
```

### 새 게임 추가

`GAMES` 리스트에 추가:

```python
GAMES = [
    {
        "name": "New Game",
        "disguise": "Notepad",
        "url": "...",
        "description": "...",
        "tags": [...],
    },
    # ...
]
```

---

## 7. 워크플로우 예시

```
1. Claude가 새 게임/업데이트용 포스트 초안 작성
2. config/settings.py의 TEMPLATES 업데이트
3. python main.py post --dry-run 으로 확인
4. 내용 검토 후 python main.py post --live 실행
5. 한국 커뮤니티용은 별도 초안 받아서 수동 포스팅
```

---

## 8. 트러블슈팅

### Reddit "RATELIMIT" 에러
- 10분 이상 간격 두고 포스팅
- 새 계정은 제한 더 심함

### Discord "Invalid Webhook" 에러
- 웹훅 URL 다시 확인
- 웹훅이 삭제되었는지 확인

### Telegram "Chat not found" 에러
- 채널 ID 앞에 `@` 붙었는지 확인
- 봇이 채널 관리자인지 확인
