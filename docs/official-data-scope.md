# Stock Digger 공식 데이터 범위와 출시 권고

조사 기준일: 2026-08-28  
조사 원칙: SEC, Apple, NYSE, Nasdaq, Cboe가 직접 공개한 문서만 사용했다. 이 문서는 제품·기술 범위 판단용이며 법률 자문은 아니다.

## 결론

**라이선스 비용 없이 안전하게 출시할 수 있는 1차 범위는 `SEC 공시 기반 기업 체력 스크리너`다.** SEC의 공개 EDGAR 제출 자료는 무료로 접근·재사용할 수 있고, 회사 식별 정보와 공시 재무 수치를 앱에서 가공해 보여줄 수 있다. 반면 SEC는 주가 시세 API가 아니므로 현재가, 15분 지연가, 과거 OHLC, 총수익률, 배당조정 주가, 시가총액을 제공하지 않는다.

공식 거래소 문서에서 **미국 전체 종목의 지연·과거 가격을 상업용 모바일 앱에 무상 재배포할 수 있다는 개방형 라이선스는 확인하지 못했다.** 일부 Nasdaq 데이터는 지연 후 요금·보고 의무가 면제될 수 있지만, 그 문구는 이미 계약 관계에 있는 `Distributor`의 배포 정책이며 누구나 가져다 재배포해도 된다는 공개 라이선스가 아니다. NYSE와 Cboe는 외부 재배포에 계약, 승인 또는 요금이 필요할 수 있음을 명시한다.

따라서 App Store 1차 버전에서는 주가 낙폭, 차트, 수익률, PER, 배당수익률, 시가총액 조건을 실제 검색 조건처럼 노출하지 않는 것이 안전하다. 이 기능들은 모바일 표시·저장·파생지표·과거 데이터 재배포 권리를 명시적으로 허용하는 공급자 계약을 맺은 뒤 추가해야 한다.

## SEC로 가능한 제품 범위

SEC의 `data.sec.gov` API는 인증이나 API 키 없이 사용할 수 있으며, 현재 제공 범위는 제출 이력과 10-Q, 10-K, 8-K, 20-F, 40-F, 6-K 등에 포함된 XBRL 재무제표 데이터다. Submissions 응답에는 회사명, 과거 회사명, 거래소와 티커도 들어간다. XBRL API는 비커스텀 표준 taxonomy를 사용하고 전체 제출 주체에 적용되는 facts를 집계한다. 따라서 표준화되지 않은 회사별 확장 태그나 특정 사업부 facts는 빠질 수 있다. [SEC EDGAR API 문서](https://www.sec.gov/search-filings/edgar-application-programming-interfaces)

| 앱 데이터 | SEC만으로 가능 | 제품에서의 안전한 표현 |
|---|---:|---|
| 회사명, CIK, 티커, 상장 거래소, SIC | 가능 | `SEC 제출 주체 정보` |
| 매출, 영업이익, 순이익, 영업현금흐름, 현금, 부채 | 가능하나 태그·기간 검증 필요 | `최근 제출 공시 기준`과 회계기간 표시 |
| FCF | 파생 가능 | `영업현금흐름 - 자본적지출`처럼 계산식 표시 |
| 흑자 지속, 매출 성장, 현금 대비 부채 | 파생 가능 | 사용한 기간, 단위, 누락 규칙 표시 |
| 발행·유통주식 수와 희석 변화 | 공시 범위에서 가능 | 주식 종류와 기준일을 함께 표시 |
| 배당 선언액·주당 배당 | 회사가 표준 태그로 공시한 범위에서만 가능 | `공시에서 확인된 배당`; 완전한 배당 이벤트 피드로 부르지 않기 |
| 현재가·15분 지연가 | 불가능 | 가격 공급자 계약 전 미제공 |
| 과거 OHLC·주가 낙폭·차트 | 불가능 | 가격 공급자 계약 전 미제공 |
| 배당·분할 조정 주가와 총수익률 | 불가능 | 가격·기업행동 데이터 계약 전 미제공 |
| 시가총액 | 직접 제공하지 않음 | 라이선스된 가격과 적절한 주식 수가 있을 때만 계산 |
| PER·P/FCF·배당수익률 | 직접 제공하지 않음 | 라이선스된 가격을 연결한 뒤 계산 |

Company Facts는 표준 facts의 비교 가능성을 높이지만 회사의 모든 공시 숫자를 보장하는 데이터셋은 아니다. 또한 달력 분기 프레임은 회사별 결산일과 기간 길이가 달라질 수 있으므로 SEC도 기간 정렬에 주의하라고 설명한다. [SEC EDGAR API 문서](https://www.sec.gov/search-filings/edgar-application-programming-interfaces)

SEC는 정부 제작 콘텐츠와 EDGAR 공개 filing 콘텐츠를 무료로 접근·재사용할 수 있다고 밝히고, sec.gov 정보는 별도 허락 없이 복사·재배포할 수 있다고 설명한다. 출처 표기는 권장된다. 다만 SEC 인장·로고·아트워크를 쓰면 안 되고, `SEC`와 `EDGAR` 관련 등록상표를 제휴·승인으로 오인하게 사용해서도 안 된다. [SEC Webmaster FAQ](https://www.sec.gov/about/webmaster-frequently-asked-questions), [SEC Website Dissemination](https://www.sec.gov/about/privacy-information#dissemination)

이 범위는 **데이터 라이선스 비용이 없는 것**이지 서버, 저장소, 모니터링, App Store 개발자 계정 비용까지 0원이라는 뜻은 아니다.

## 권장 수집 구조

### 1. 야간 벌크 적재

SEC는 대량 수집에 벌크 ZIP이 가장 효율적이라고 직접 안내한다.

- Company Facts 전체: `https://www.sec.gov/Archives/edgar/daily-index/xbrl/companyfacts.zip`
- 모든 filer의 공개 제출 이력: `https://www.sec.gov/Archives/edgar/daily-index/bulkdata/submissions.zip`

두 ZIP은 매일 밤 재컴파일되며 공식 문서상 약 오전 3시(미 동부시간)에 다시 게시된다. 개별 JSON API는 제출 공개와 함께 갱신되며 통상 Submissions는 1초 미만, XBRL은 1분 미만 지연이지만 피크 시간에는 더 늦을 수 있다. [SEC EDGAR API 문서](https://www.sec.gov/search-filings/edgar-application-programming-interfaces)

실무 권고는 다음과 같다.

1. 백엔드 작업이 매일 벌크 ZIP을 한 번 받아 원본 스냅샷을 보존한다.
2. CIK를 기본 키로 회사, 티커 이력, facts, filing accession을 정규화한다.
3. 값마다 `filed`, `fy`, `fp`, `form`, `start`, `end`, `accn`, `frame`, 단위를 보존한다.
4. 중복 facts는 무조건 최신 값으로 덮지 말고 수정 공시와 동일 기간 재공시를 식별한다.
5. 앱 응답에는 값의 회계기간, 제출일, 출처 filing 링크, 데이터 갱신 시각을 포함한다.
6. 최신 제출이 꼭 필요한 회사만 개별 API로 증분 갱신한다.

`data.sec.gov`는 CORS를 지원하지 않는다. 웹·모바일 클라이언트가 SEC를 직접 호출하는 구조가 아니라, 백엔드가 수집·캐시하고 앱은 자체 API를 호출하는 구조가 필요하다. [SEC EDGAR API 문서](https://www.sec.gov/search-filings/edgar-application-programming-interfaces)

### 2. Fair Access 준수

SEC의 현재 지침은 모든 머신을 합산해 사용자당 초당 10요청 이하이며, 필요한 것만 효율적으로 내려받으라고 요구한다. 과도한 요청 IP는 차단될 수 있고 식별되지 않은 자동화 도구도 제한 대상이다. [SEC Developer Resources](https://www.sec.gov/about/developer-resources)

자동 요청에는 선언된 User-Agent가 필요하다. SEC의 예시는 다음 형식이다. [SEC Accessing EDGAR Data](https://www.sec.gov/search-filings/edgar-search-assistance/accessing-edgar-data)

```http
User-Agent: Stock Digger CompanyName contact@example.com
Accept-Encoding: gzip, deflate
```

운영에서는 10 req/s를 목표 처리량으로 꽉 채우지 말고 더 낮은 전역 제한을 둔다. 응답 캐시, 요청 중복 제거, 지수 백오프, 403·429 차단 감지, 마지막 정상 스냅샷 유지가 필요하다. 앱 사용자가 검색할 때마다 SEC에 fan-out 요청을 보내면 안 된다.

## 무료 공식 가격 데이터에 대한 판정

### NYSE

NYSE는 uncontrolled datafeed를 받아 사용하거나 재배포하려는 신규 고객에게 Vendor Agreement와 내부·외부 재배포 Exhibit A 제출을 요구한다. 외부 재배포에는 해당 시 재배포 요금이 부과된다고도 설명한다. 따라서 NYSE 웹사이트에서 보이는 지연 시세를 크롤링해 앱에 다시 싣는 것은 안전한 무상 라이선스 경로가 아니다. [NYSE Connectivity Documents](https://www.nyse.com/connectivity/documents), [NYSE Market Data Pricing FAQ](https://www.nyse.com/contact/nyse-market-data/pricing)

### Nasdaq

Nasdaq 정책은 Nasdaq Basic과 Nasdaq Last Sale 등에 15분 지연 구간을 두고, 지연 후 특정 정보가 요금 또는 월별 보고 대상이 아닐 수 있다고 설명한다. 그러나 같은 문단은 `Distributor`, `Recipient`, Nasdaq Global Data Agreement와 Distributor의 계약상 면책 의무를 전제로 한다. 즉 **일부 지연·종가 배포의 부담 완화**이지, 임의의 앱 개발자에게 원천 데이터와 무제한 재배포권을 무상 제공한다는 뜻이 아니다. 실제 사용 전 Nasdaq Market Data와 서면 확인이 필요하다. [Nasdaq US Equities and Options Data Policies, pp. 8–9](https://www.nasdaqtrader.com/content/AdministrationSupport/Policy/USEquitiesandOptionsDataPolicies.pdf)

### Cboe

Cboe 미국 시장 데이터 정책은 15분 후 데이터를 delayed data로 정의하지만, historical data를 비계열사에 재배포하려면 Data Agreement, Data Order Form/System Description, 사전 승인이 필요하고 추가 요금이나 제3자 라이선스가 필요할 수 있다고 명시한다. 차트·그래프 형태도 재배포 범위에 포함될 수 있다. [Cboe Market Data Policies, §§5–7](https://res-certification.cboe.com/resources/membership/Market_Data_Policies.pdf)

### 최종 판정

공식 문서만 기준으로 하면 다음 네 가지를 미국 전체 상장 종목에 대해 동시에 해결하는 무상·개방형 공식 소스는 확인되지 않았다.

- 현재 또는 지연 주가 재배포
- 과거 가격과 차트 재배포
- 완전한 배당·분할 기업행동 시계열
- 가격을 결합한 시가총액과 밸류에이션

무료 API 키를 발급하는 제3자 서비스가 있더라도 그것이 상업 앱의 표시·캐시·파생지표·재배포 권리를 뜻하지는 않는다. 공급자 계약에서 각 권리를 별도로 확인해야 한다.

## App Store에 안전한 출시안

### 1차 출시: 공시 기반 교육·리서치 도구

- 앱 설명을 `주식 추천`보다 `SEC 공시를 쉬운 질문으로 탐색하는 기업 리서치 도구`로 한정한다.
- 주문, 브로커 연결, 사용자 자산 연동, 자동 매매, 개인별 매수·매도 지시는 넣지 않는다.
- 결과를 `사야 할 종목`이나 `예상 수익률 순위`가 아니라 `선택한 공시 조건에 맞는 조사 후보`로 표현한다.
- 모든 점수의 구성 요소, 누락 처리, 계산식과 기준일을 공개한다.
- `데이터는 실시간이 아니며 최신 10-Q/10-K 제출 기준`임을 결과 가까이에 표시한다.
- 결과마다 원문 SEC filing을 열 수 있게 하고, SEC와 제휴·승인 관계라는 인상을 주지 않는다.
- 가격 데이터가 없으면 낙폭·모멘텀·시가총액·밸류에이션 조건을 `참고 대기 조건`으로 검색에 섞지 말고 기능 자체를 숨기거나 명확히 비활성화한다.

Apple은 금융 거래·투자·자금관리 앱은 해당 서비스를 수행하는 금융기관이 제출하고 필요한 허가를 갖춰야 한다고 규정한다. 공시 교육 도구가 이 조항의 적용 대상이 아니라고 단정할 수 없으므로, App Review Notes에 `거래·계좌연동·개인화 투자자문 없음`, 데이터 출처, 계산 방법과 지연 범위를 구체적으로 설명하는 것이 좋다. 가능하면 개인 계정보다 실제 운영 법인 명의로 제출하고, 출시 지역의 증권·투자자문 규제는 별도 법률 검토를 받는다. [Apple App Review Guidelines 3.2.1(viii)](https://developer.apple.com/app-store/review/guidelines/#business)

Apple은 모든 앱에 App Store Connect와 앱 내부에서 접근 가능한 개인정보처리방침 링크를 요구한다. 수집 정보, 수집·사용 방식, 제3자 공유, 보존·삭제, 동의 철회 방법을 명시해야 한다. 데이터를 수집하지 않더라도 정책 URL과 앱 내 링크는 필요하다. [Apple App Review Guidelines 5.1.1(i)](https://developer.apple.com/app-store/review/guidelines/#privacy)

면책 문구는 필요한 제품 설명이지만 정확하지 않은 데이터, 무허가 시세 재배포 또는 투자자문 규제를 해결해 주지는 않는다.

### 2차 출시: 계약 후 가격 기능

가격 공급자와 계약할 때 최소한 다음 권리가 계약서에 명시돼야 한다.

- iOS·Android·웹의 외부 사용자 표시
- 실시간인지, 15분 지연인지, 종가인지에 대한 허용 범위
- 과거 OHLC 저장과 차트 재배포
- 분할·배당 조정 시계열과 기업행동 데이터
- 시가총액, PER, 낙폭, 변동성, 점수 등 derived data 생성·표시
- 서버 캐시 기간, 원본 보관 기간, 사용자·기기 보고 의무
- 앱 화면 캡처·마케팅 이미지에 데이터가 노출되는 경우의 권리
- 출처 표기와 지연 고지 문구
- 무료/유료 앱, 구독, 광고 모델별 허용 범위

이 권리가 확인되기 전에는 웹사이트 크롤링, 비공식 무료 API, 사용자 개인용 API 키를 전체 사용자에게 중계하는 방식으로 우회하지 않는다.

## 출시 의사결정

| 선택 | 라이선스 위험 | 초보 투자자에게 주는 가치 | 권고 |
|---|---:|---:|---|
| SEC 공시만으로 기업 체력 탐색 | 낮음 | 재무 기초 학습과 후보 축소에 충분 | **지금 출시 가능한 범위** |
| 무허가 무료 API로 가격·차트 추가 | 높음 | 겉보기 기능은 늘지만 중단·심사 위험 큼 | 출시 금지 |
| 거래소/벤더 계약 후 가격 기능 추가 | 관리 가능 | 낙폭·밸류·수익률 질문까지 완성 | 2차 단계 |
| 거래·계좌 연동까지 확장 | 규제·심사 위험 매우 높음 | 실행 편의 증가 | 별도 법인·허가·법률 검토 후 |

가장 현실적인 제품 약속은 다음 한 문장이다.

> Stock Digger는 실시간 주가 추천 앱이 아니라, 최신 SEC 공시에서 초보자가 이해할 수 있는 재무 조건으로 조사할 회사를 좁혀 주는 도구다.
