# 토스증권급 주식 플랫폼 데이터·연동 조사

조사일: 2026-08-28

## 결론

개인 개발용 API 키만으로 만들 수 있는 범위는 개인 계좌 기반 시세·주문 실험 또는 조회·분석 앱이다. 여러 사용자를 대상으로 시세를 재배포하고 계좌 연결·주문을 제공하는 공개 증권 서비스에는 증권사 제휴, 거래소/벤더 시세 이용계약, 보안·개인정보 체계와 금융업 규제 검토가 별도로 필요하다.

## 개발 단계의 현실적인 조합

- 국내·해외 시세, 호가, 모의주문, 계좌: 한국투자증권 KIS Open API
- 미국 회사 공시와 재무 원문: SEC EDGAR
- 한국 회사 공시: 금융감독원 DART Open API
- 검색용 장기 가격과 차트: KIS 또는 사용권을 확인한 상용 시세 벤더
- 앱 자체 역할: 종목 검색, 초보자용 설명, 근거 비교, 관심종목, 알림

KIS 공식 문서는 REST와 WebSocket, 실전·모의 도메인, 국내외 시세, 실시간 체결·호가, 주문·계좌 API를 제공한다고 명시한다. 인증에는 appkey/appsecret과 접근 토큰 또는 WebSocket 접속키를 사용하며 비밀키는 클라이언트 앱에 포함하면 안 된다.

## 공개 앱에서 달라지는 점

KRX는 개인의 단순 참고가 아닌 재배포 프로그램, 수익사업 등에 시세를 이용하려면 별도 계약이 필요하다고 안내한다. 따라서 개인 증권계좌의 Open API 키를 앱 서버에 넣어 모든 사용자에게 시세를 재배포하는 설계는 상용 출시 기본안으로 삼으면 안 된다.

실제 주문 기능은 조회 앱과 별개다. 개인 KIS 키는 그 개인의 계좌용 개발 수단이며, 다수 사용자의 계좌를 연결하는 서비스는 증권사 제휴법인용 인증·위임 흐름과 법률 검토가 필요하다. 앱스토어 출시 전에는 투자 권유 표현, 개인화 추천, 주문 중개 범위를 국내 금융 전문 변호사/컴플라이언스 담당자에게 검토받아야 한다.

## 추천 개발 순서

1. 시세 조회·차트·종목 상세·관심종목을 완성한다.
2. SEC/DART 기반 재무와 가격을 결합하되 출처와 기준시각을 표시한다.
3. KIS 모의투자로 주문 UX를 개발하고 실계좌 주문은 숨긴다.
4. 공개 베타 전 증권사 제휴와 시세 재배포 권리를 확정한다.
5. 계약이 확정된 뒤 사용자 계좌 연결과 실주문을 연다.

## 공식 출처

- [KIS Developers API 문서](https://apiportal.koreainvestment.com/apiservice)
- [한국투자증권 공식 Open Trading API 예제](https://github.com/koreainvestment/open-trading-api)
- [KRX 시세 데이터 수신·재배포 안내](https://openapi.krx.co.kr/contents/OPP/DATA/OPPDATA003.jsp)
- [Twelve Data API 키 발급 공식 Quickstart](https://twelvedata.com/docs/introduction/quickstart)
- [SEC EDGAR API](https://www.sec.gov/search-filings/edgar-application-programming-interfaces)
- [DART Open API](https://opendart.fss.or.kr/)
