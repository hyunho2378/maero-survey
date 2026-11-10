# 응답 저장 서버 (Node, 의존성 없음)

설문 응답을 `data/responses.jsonl`에 한 줄씩 저장하는 작은 서버예요. Node 22 이상이면 설치 없이 돌아가요.

## 실행

```bash
ADMIN_TOKEN="16자 이상 긴 임의 문자열" \
ALLOWED_ORIGINS="http://localhost:5971" \
NEWSLETTER_ENABLED=true \
PORT=5970 node server/node/server.mjs
```

| 환경변수 | 뜻 | 기본값 |
|-|-|-|
| ADMIN_TOKEN | 목록 조회 토큰. 16자 미만이면 조회가 막혀요 | 없음 |
| ALLOWED_ORIGINS | CORS 허용 출처, 쉼표로 구분. 브라우저 요청은 여기에 있어야 통과해요 | 비어 있음 |
| NEWSLETTER_ENABLED | true일 때만 이메일을 받아요 | false |
| PORT, HOST | 포트와 바인딩 주소 | 5970, 127.0.0.1 |
| DATA_FILE | 저장 파일 위치 | data/responses.jsonl |
| RATE_LIMIT | IP당 분당 요청 수 | 30 |

## 프론트 연결

빌드할 때 `VITE_ENDPOINT`를 서버 주소로 지정해요.

```bash
VITE_ENDPOINT="http://localhost:5970/api/responses" npm run build
```

비워 두면 localStorage 모드, Apps Script 주소를 넣으면 기존 Apps Script 모드로 동작해요.

## API

- POST /api/responses : 응답 저장. 본문은 응답 JSON 하나, 또는 프론트 어댑터가 보내는 `{action:"submit", payload}` 형식. 같은 id를 다시 보내면 중복 저장 없이 기존 접수 시각을 돌려줘요.
- GET /api/responses?admin=토큰 : 목록 JSON
- GET /api/responses?admin=토큰&format=csv : CSV 내려받기
- GET /health : 상태 확인

## 제한과 검증

- 요청 크기 100KB 초과는 413
- IP당 분당 30건 초과는 429
- 허용 필드만 저장하고 나머지는 버려요. 이름과 전화번호 필드가 오면 거부해요
- 이메일은 형식과 동의 여부를 검사해요
- 90일이 지난 기록은 조회에서 빠져요

## 배포 시 주의

- ADMIN_TOKEN을 공개 저장소, 프론트 코드, VITE_ 변수에 넣지 마세요. 서버 환경변수로만 두세요.
- 관리자 화면에서 입력한 토큰은 요청 본문으로 전송돼요. 배포 서버는 반드시 HTTPS 뒤에 두세요.
- data 폴더는 .gitignore에 들어 있어요. 응답 파일을 커밋하지 마세요.
- Vercel은 파일 쓰기가 유지되지 않아 이 서버에 맞지 않아요. 쓰지 않아요. 디스크가 유지되는 일반 서버에서 실행하세요.
- 속도 제한은 서버 메모리 기준이고 프록시 뒤에서는 모든 요청이 같은 IP로 보일 수 있어요.
