# Stock Digger 1.0 출시 체크리스트

## 코드로 완료된 범위

- 실제 반영 조건과 참고·미지원 조건을 UI에서 분리
- 가격 라이선스가 필요한 네 가지 탐색 방향 비활성화
- SEC 벌크 자료를 SQLite 스냅샷으로 원자적 게시하는 동기화 명령
- 검색 요청은 스냅샷을 읽고, 운영 환경에서는 실시간 SEC fan-out 비활성화 가능
- 입력 범위 제한, 파라미터 바인딩, 제한된 CORS, 안전한 503 오류 메시지
- 계산식·누락 범위·원문 출처·투자 비권유 안내
- 앱 내 개인정보 안내와 iOS/Android 버전 식별자

## 배포 환경 필수값

```text
SEC_USER_AGENT=Stock Digger <운영 주체명> <공개 문의 이메일>
ALLOWED_ORIGINS=https://<실제 웹 도메인>
ALLOW_LIVE_SEC_FALLBACK=false
STOCK_DIGGER_DB=<영구 볼륨의 stock_digger.db 경로>
EXPO_PUBLIC_API_URL=https://<실제 API 도메인>
TWELVE_DATA_API_KEY=<외부 표시 권한이 있는 사업자용 API 키>
```

매일 SEC 재컴파일 이후 `npm run sync:sec`를 실행한다. 새 자료를 끝까지 해석한 후 한 트랜잭션으로 게시하므로 실패하면 이전 정상 스냅샷을 유지한다. API 앞단에는 TLS, 요청 속도 제한, 상태 확인과 오류 알림을 둔다.

## 소유자가 확정해야 하는 제출 차단 항목

- Apple Developer 계정과 실제 판매자/운영 법적 주체
- 공개 지원 이메일, 지원 URL, 개인정보처리방침 URL
- 운영 로그의 정확한 보관 기간과 삭제·문의 절차
- API·동기화 작업을 실행할 호스팅과 장애 알림 수신자
- 출시 국가의 투자정보 서비스 관련 법률 검토 및 App Review Notes
- 실제 기기 VoiceOver/Dynamic Type/네트워크 중단 QA

위 항목은 코드가 대신 사실을 만들 수 없으므로 확정 전에는 “App Store 제출 완료”로 표시하지 않는다.

## 가격 기능 잠금 해제 조건

모바일 외부 표시, 과거 가격 저장, 차트 재배포, 배당·분할 조정, 파생 지표 계산 권리가 계약에 명시된 공급자만 연결한다. 무료 웹페이지 크롤링이나 개인용 API 키 중계로 우회하지 않는다.

현재 가격 어댑터는 Twelve Data REST API를 사용한다. 공개 출시 전 계정에 미국 주식의 외부 사용자 표시와 최근 가격 기록 표시 권한이 포함되는지 공급자에게 서면 확인하고, 화면의 `Data provided by Twelve Data` 출처 표기를 유지한다.
