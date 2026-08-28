# Stock Digger: beginner screener and App Store readiness

Last checked: 2026-08-28. This is a product and App Review checklist based on first-party regulator and Apple sources, not legal advice. App Review guidance changes, so recheck the linked Apple page before submission.

## Bottom line

Stock Digger is useful to a beginner only when it helps them **form a sensible question, understand why each company matched, see the limits of the data, and continue their own research**. A ranked ticker list with a generic disclaimer is not enough.

Do not submit until all P0 items below pass:

1. Results are labelled as `match to your conditions`, not `best`, `safe`, `promising`, or `will rebound`.
2. Every result exposes the condition, actual value, formula/period, source, filing or quote date, refresh time, and missing-data state.
3. No unsupported condition silently affects a score. Estimated, stale, unavailable, and not-applicable values are visibly distinct.
4. Social posts are presented as attributed claims or sentiment, never as verified fundamentals or a default buy signal.
5. The product states what its algorithm does and does not consider, and lets the user revise the inputs.
6. Privacy, content rights, submission entity/licensing, and account deletion have been resolved before App Review.

## What a beginner-ready screening flow needs

### 1. Ask about the investor before asking for tickers

At minimum, establish goal, time horizon, loss tolerance, and whether the user is looking for growth, income, financial resilience, or a possible recovery. The SEC explains that risk tolerance and time horizon affect suitable investment choices, and that every investment carries risk. It also identifies asset allocation and diversification as core ways to manage risk. ([Investor.gov: Introduction to Investing](https://www.investor.gov/introduction-investing))

Product requirements:

- Ask one decision per screen in plain Korean, with `잘 모르겠어요` and back/edit options.
- Branch later questions from earlier answers. A dividend path should ask about income consistency and payout sustainability; a rebound path should ask why price fell and whether operating performance is intact.
- Do not infer a user's risk tolerance solely from selected stock characteristics.
- Before results, show a short editable summary: `반드시 만족`, `되도록 만족`, and `이번 검색에서 보지 못한 것`.

### 2. Explain matching, not recommendations

The SEC's robo-adviser guidance says electronic services should describe the algorithmic functions, assumptions, limitations, risks, and operational aspects in a way clients are likely to read and understand. It also highlights the information used to formulate results, investing approach, fees, and available human interaction. This guidance legally targets advisers, but it is the right safety baseline for an algorithmic screener. ([SEC Robo-Advisers Guidance](https://www.sec.gov/investment/im-guidance-2017-02.pdf), [SEC summary](https://www.sec.gov/newsroom/press-releases/2017-52))

Each result should therefore show:

- `Why it matched`: e.g. `3-year revenue CAGR 18.2% >= requested 10%`.
- `What could break the thesis`: falling margins, dilution, debt, customer concentration, cyclical exposure, or missing facts.
- `What was not checked`: price valuation, Korean filings, insider activity, real-time news, or any disconnected dataset.
- `How rank was calculated`: normalized components, weights, tie-breaking, exclusions, and the universe searched.
- A direct route to the original filing or licensed source.

Use `조건 일치도 82/100` only if the score is reproducible. Never convert missing data to zero or a neutral value without telling the user.

### 3. Make source, period, and freshness unavoidable

SEC `data.sec.gov` APIs expose company submissions and XBRL facts without an API key, update as filings are disseminated, and warn that company fiscal calendars and frame alignment vary. Therefore, a value without its reporting period and filing context can be misleading. ([SEC EDGAR API documentation](https://www.sec.gov/search-filings/edgar-application-programming-interfaces))

For every financial fact, retain and display:

- issuer and ticker mapping;
- form type, accession/link, filed date, fiscal period and period end;
- units and whether the value is annual, quarterly, trailing, or calculated;
- calculation formula and restatement/amendment handling;
- retrieval time and the app's refresh policy.

Quality gates should cover split-adjustment, amended filings, duplicate XBRL facts, different fiscal year ends, negative denominators, newly public companies, delisted symbols, foreign issuers, and API failure. A stale cache may be shown with a timestamp; it must not be silently presented as live.

### 4. Teach risk around the result

FINRA advises evaluating earnings, valuation, debt, industry and company risks, and how a stock fits an overall strategy and diversification. It warns that online or social analysis may omit the publisher's financial interest. ([FINRA: Evaluating Stocks](https://www.finra.org/investors/investing/investment-products/stocks/evaluating-stocks))

The result experience should include:

- a short definition and interpretation for every metric;
- both favorable and unfavorable evidence at the same visual level;
- a diversification reminder that a single-company screen is not a portfolio plan;
- a research checklist rather than a buy button: latest filing, earnings call, risks, competitors, valuation, and fees at the user's broker;
- no urgency, scarcity, guaranteed-return, or risk-free language. FINRA identifies those as common fraud warning signs. ([FINRA: Avoid Fraud](https://www.finra.org/investors/protect-your-money/avoid-fraud))

If the app ranks investors or strategies by performance, disclose benchmark, exact period, dividends, fees, currency, public-disclosure lag, position-weighting method, closed positions, and survivorship treatment. Put `past performance does not necessarily predict future results` next to the ranking, not only in settings. ([Investor.gov: Past Performance](https://www.investor.gov/introduction-investing/investing-basics/glossary/mutual-funds-past-performance))

### 5. Treat X and other social content as unverified evidence

FINRA's official research says social content can be inaccurate, biased, misleading, conflicted, manipulated, or incomplete. Sentiment tools also struggle with sarcasm, idioms, context, language, and input quality. ([FINRA: Social Media-Investment Risks](https://www.finra.org/rules-guidance/key-topics/fintech/report/social-media-influenced-investing/benefits-risks))

Required handling:

- Show author, original link, publication time, retrieval time, and whether the text is quoted or summarized.
- Label it `공개 발언`, `의견`, or `소셜 신호`, never `사실` unless independently verified.
- Keep sentiment outside the fundamental score by default. If users opt in, show its weight and known failure modes.
- Provide conflict and authenticity warnings; do not imply that a famous name still owns or endorses a security without current evidence.
- Prefer official APIs, authorized embeds, or links. Apple requires permission under the third-party service's terms when an app accesses, displays, or monetizes its content, and may request proof. ([Apple App Review Guideline 5.2.2](https://developer.apple.com/app-store/review/guidelines/))
- If users can post or interact with live content, add filtering, reporting, blocking, timely moderation, and contact information as required for user-generated content. ([Apple App Review Guideline 1.2](https://developer.apple.com/app-store/review/guidelines/))

## Apple App Review requirements most relevant here

### P0: submission entity and regulatory scope

Apple says apps used for financial trading, investing, or money management should be submitted by the financial institution providing the service and hold the necessary local licences and permissions. It also says highly regulated financial services or apps requiring sensitive information should be submitted by the legal entity providing the service, not an individual. ([Guidelines 3.2.1(viii) and 5.1.1(ix)](https://developer.apple.com/app-store/review/guidelines/))

Before submission, obtain a jurisdiction-specific legal classification and document it in Review Notes. If accurate, state that Stock Digger is an information and research screener and does not execute trades, hold funds, manage portfolios, or provide individualized investment advice. That statement must match the actual app. Adding brokerage connection, order placement, portfolio-specific recommendations, or automatic rebalancing changes the risk and requires a fresh review.

### P0: accuracy and non-misleading presentation

Apple prohibits false information and notes that an `entertainment purposes` disclaimer does not cure it. App metadata, screenshots, descriptions, privacy information, price claims, and advertised features must accurately reflect the current product; unverifiable product claims are not allowed. ([Guidelines 1.1.6 and 2.3](https://developer.apple.com/app-store/review/guidelines/))

Consequences for Stock Digger:

- Do not market `AI finds winning stocks`, `safe stocks`, `future winners`, or guaranteed accuracy.
- Do not show a decorative result for a condition the backend cannot evaluate.
- A disclaimer supports clear scope; it does not replace accurate calculations, current sources, or honest limitations.
- Keep this concise notice next to results: `조건에 맞는 회사를 좁혀 보는 정보 도구이며 투자 권유가 아닙니다. 모든 투자에는 원금 손실 위험이 있으며 데이터는 지연되거나 오류가 있을 수 있습니다.`

### P0: reliability during review

Apple expects a final, tested build, complete metadata and URLs, full review access or a demo mode, and live backend services during review. Apps with little lasting utility or that are essentially repackaged websites or link collections may be rejected. ([App Review Guidelines, Before You Submit and 4.2](https://developer.apple.com/app-store/review/guidelines/))

Release gate: test on physical supported devices, slow/offline networks, expired caches, empty results, partial-source failure, back navigation, Dynamic Type, VoiceOver labels, and repeated searches. Provide App Review with a stable demo path and explain the screener, data sources, social-content rights, and non-obvious ranking logic.

### P0: privacy, login, and deletion

Every app needs an easily accessible privacy policy link both in the app and in App Store Connect. It must identify collection, purposes, sharing and third-party protections, retention/deletion, consent withdrawal, and deletion requests. App privacy details must also cover data collected by integrated third-party SDKs. ([Guideline 5.1.1](https://developer.apple.com/app-store/review/guidelines/), [Apple App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/))

- Keep screening usable without login unless significant account-based functionality genuinely requires it.
- Do not ask the user for an email solely to query SEC data; the server operator should supply the SEC-compliant request identity.
- Inventory analytics, crash, authentication, advertising, and data-provider SDK behavior before completing the privacy label.
- If account creation exists, users must be able to initiate deletion of the whole account and associated non-retained personal data inside the app. Deactivation alone is insufficient. Make it easy to find, explain timing and retained legal records, and revoke Sign in with Apple tokens when applicable. ([Apple: Offering Account Deletion](https://developer.apple.com/support/offering-account-deletion-in-your-app/))

### P1: login and monetization

If a third-party or social login is used for the primary account, Apple generally requires an equivalent privacy-preserving login option meeting Guideline 4.8. ([App Review Guideline 4.8](https://developer.apple.com/app-store/review/guidelines/))

Paid digital screening features, extra searches, premium data, or subscriptions consumed in the app generally require In-App Purchase. Auto-renewable subscriptions must provide ongoing value and clearly explain what the user gets before purchase. ([App Review Guidelines 3.1.1-3.1.2](https://developer.apple.com/app-store/review/guidelines/))

## Practical acceptance test

A beginner should be able to pick any result and correctly answer all of these without leaving the result screen:

1. What did I ask for?
2. Why did this company match, using actual numbers?
3. Which requirements did it fail or only partly meet?
4. How old is each number and where did it come from?
5. What important risks or datasets were not considered?
6. Is this a recommendation? No; it is a ranked match within a disclosed universe and methodology.
7. What should I verify before deciding?
8. How can I edit my answers and see a different result?

If the app cannot support those answers consistently for empty, partial, stale, and normal datasets, it is not yet ready to claim that it sufficiently helps beginner investors or to be submitted as a polished financial screening product.
