import asyncio
import os
import re
from dataclasses import dataclass
from typing import Any

from .sec_client import SecClient
from .repository import MetricsRepository

CANDIDATES = {
    "NVDA": 1045810, "PLTR": 1321655, "DUOL": 1562088, "CELH": 1341766,
    "TMDX": 1756262, "CRWD": 1535527, "SNOW": 1640147, "UBER": 1543151,
    "MSFT": 789019, "KO": 21344, "PG": 80424, "JNJ": 200406,
}
repository = MetricsRepository()

REVENUE_TAGS = ["RevenueFromContractWithCustomerExcludingAssessedTax", "Revenues", "SalesRevenueNet"]
CASH_TAGS = ["CashAndCashEquivalentsAtCarryingValue", "CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents"]
SHARE_TAGS = ["CommonStockSharesOutstanding", "EntityCommonStockSharesOutstanding"]
EPS_TAGS = ["EarningsPerShareDiluted", "EarningsPerShareBasicAndDiluted"]
DIVIDEND_TAGS = ["CommonStockDividendsPerShareDeclared", "CommonStockDividendsPerShareCashPaid"]

BUSINESS_SUMMARIES = {
    "NVDA": "AI 계산에 쓰이는 반도체와 관련 소프트웨어를 만드는 회사예요.",
    "PLTR": "정부와 기업이 많은 데이터를 모아 판단하도록 돕는 소프트웨어 회사예요.",
    "DUOL": "게임처럼 배우는 언어 학습 앱을 운영하는 회사예요.",
    "CELH": "Celsius 브랜드의 에너지 음료를 만드는 회사예요.",
    "TMDX": "이식할 장기를 보관하고 병원까지 옮기는 장비와 운송 서비스를 제공해요.",
    "CRWD": "기업의 컴퓨터와 서버를 해킹에서 지키는 보안 소프트웨어 회사예요.",
    "SNOW": "기업이 인터넷 공간에 데이터를 모으고 분석하도록 돕는 회사예요.",
    "UBER": "차량 호출과 음식·상품 배달을 연결하는 앱을 운영해요.",
}


@dataclass
class Metrics:
    ticker: str
    company: str
    cik: int
    revenue_growth: float | None
    cash: float | None
    dilution: float | None
    operating_income: float | None
    filing_url: str | None
    filing_label: str | None
    revenue_history: list[dict[str, Any]] | None = None
    shares_outstanding: float | None = None
    eps_ttm: float | None = None
    dividend_per_share: float | None = None
    dividend_years: int | None = None
    dividend_growth: float | None = None


def _taxonomy(facts: dict[str, Any]) -> dict[str, Any]:
    namespaces = facts.get("facts", {})
    return namespaces.get("us-gaap", {}) | namespaces.get("ifrs-full", {}) | namespaces.get("dei", {})


def _units(facts: dict[str, Any], tags: list[str], unit: str) -> list[dict[str, Any]]:
    taxonomy = _taxonomy(facts)
    for tag in tags:
        values = taxonomy.get(tag, {}).get("units", {}).get(unit, [])
        if values:
            return values
    return []


def _latest_instant(items: list[dict[str, Any]]) -> dict[str, Any] | None:
    valid = [x for x in items if x.get("form") in {"10-Q", "10-K", "20-F"} and x.get("end")]
    return max(valid, key=lambda x: (x["end"], x.get("filed", "")), default=None)


def _quarter_growth_details(items: list[dict[str, Any]]) -> tuple[float | None, dict[str, Any] | None]:
    framed: dict[str, dict[str, Any]] = {}
    for item in items:
        frame = item.get("frame", "")
        if item.get("form") == "10-Q" and re.fullmatch(r"CY\d{4}Q[1-4]", frame):
            if frame not in framed or item.get("filed", "") > framed[frame].get("filed", ""):
                framed[frame] = item
    if not framed:
        return None, None
    latest_frame = max(framed)
    year, quarter = int(latest_frame[2:6]), latest_frame[-2:]
    previous = f"CY{year - 1}{quarter}"
    if previous not in framed or not framed[previous].get("val"):
        return None, framed[latest_frame]
    return (framed[latest_frame]["val"] / framed[previous]["val"] - 1) * 100, framed[latest_frame]


def _quarter_growth(items: list[dict[str, Any]]) -> float | None:
    return _quarter_growth_details(items)[0]


def _quarter_history(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    framed: dict[str, dict[str, Any]] = {}
    for item in items:
        frame = item.get("frame", "")
        if item.get("form") == "10-Q" and re.fullmatch(r"CY\d{4}Q[1-4]", frame) and item.get("val") is not None:
            if frame not in framed or item.get("filed", "") > framed[frame].get("filed", ""):
                framed[frame] = item
    return [
        {"period": frame.replace("CY", "").replace("Q", " Q"), "value": framed[frame]["val"]}
        for frame in sorted(framed)[-6:]
    ]


def _ttm(items: list[dict[str, Any]]) -> float | None:
    framed: dict[str, dict[str, Any]] = {}
    for item in items:
        frame = item.get("frame", "")
        if item.get("form") == "10-Q" and re.fullmatch(r"CY\d{4}Q[1-4]", frame) and item.get("val") is not None:
            if frame not in framed or item.get("filed", "") > framed[frame].get("filed", ""):
                framed[frame] = item
    values = [framed[key]["val"] for key in sorted(framed)[-4:]]
    return sum(values) if len(values) == 4 else None


def _annual_dividends(items: list[dict[str, Any]]) -> tuple[float | None, int, float | None]:
    annual: dict[str, float] = {}
    for item in items:
        frame = item.get("frame", "")
        if item.get("form") == "10-K" and re.fullmatch(r"CY\d{4}", frame) and item.get("val") is not None:
            annual[frame] = max(float(item["val"]), annual.get(frame, 0))
    positive = [(key, value) for key, value in sorted(annual.items()) if value > 0]
    if not positive:
        return None, 0, None
    consecutive = 1
    for index in range(len(positive) - 1, 0, -1):
        if int(positive[index][0][2:]) - int(positive[index - 1][0][2:]) != 1:
            break
        consecutive += 1
    latest = positive[-1][1]
    previous = positive[-2][1] if len(positive) > 1 else None
    growth = (latest / previous - 1) * 100 if previous else None
    return latest, consecutive, growth


def _dilution(items: list[dict[str, Any]]) -> float | None:
    valid = sorted([x for x in items if x.get("end") and x.get("val") and x.get("form") in {"10-Q", "10-K"}], key=lambda x: x["end"])
    if len(valid) < 2:
        return None
    latest = valid[-1]
    previous = min(valid[:-1], key=lambda x: abs((_date_num(latest["end"]) - _date_num(x["end"])) - 10000))
    return (latest["val"] / previous["val"] - 1) * 100


def _date_num(value: str) -> int:
    return int(value.replace("-", ""))


def _latest_duration(items: list[dict[str, Any]]) -> dict[str, Any] | None:
    valid = [x for x in items if x.get("form") == "10-Q" and x.get("frame") and x.get("val") is not None]
    return max(valid, key=lambda x: (x.get("end", ""), x.get("filed", "")), default=None)


async def analyze_company(client: SecClient, ticker: str, cik: int) -> Metrics:
    facts = await client.company_facts(cik)
    return metrics_from_facts(ticker, cik, facts)


def metrics_from_facts(ticker: str, cik: int, facts: dict[str, Any]) -> Metrics:
    revenue = _units(facts, REVENUE_TAGS, "USD")
    revenue_growth, revenue_fact = _quarter_growth_details(revenue)
    cash_fact = _latest_instant(_units(facts, CASH_TAGS, "USD"))
    shares = _units(facts, SHARE_TAGS, "shares")
    shares_fact = _latest_instant(shares)
    dividend_per_share, dividend_years, dividend_growth = _annual_dividends(_units(facts, DIVIDEND_TAGS, "USD/shares"))
    operating = _latest_duration(_units(facts, ["OperatingIncomeLoss"], "USD"))
    filing_url = filing_label = None
    source_fact = max(
        (item for item in (revenue_fact, cash_fact, operating, shares_fact) if item),
        key=lambda item: item.get("filed", ""),
        default=None,
    )
    if source_fact:
        accession = source_fact.get("accn")
        if accession:
            clean = accession.replace("-", "")
            filing_url = f"https://www.sec.gov/Archives/edgar/data/{cik}/{clean}/{accession}-index.html"
        filing_label = f"{source_fact.get('form', '공시')} · {source_fact.get('filed', source_fact.get('end', ''))}"
    return Metrics(
        ticker=ticker, company=facts.get("entityName", ticker), cik=cik,
        revenue_growth=revenue_growth, cash=cash_fact.get("val") if cash_fact else None,
        dilution=_dilution(shares), operating_income=operating.get("val") if operating else None,
        shares_outstanding=shares_fact.get("val") if shares_fact else None,
        eps_ttm=_ttm(_units(facts, EPS_TAGS, "USD/shares")),
        dividend_per_share=dividend_per_share, dividend_years=dividend_years,
        dividend_growth=dividend_growth, filing_url=filing_url, filing_label=filing_label,
        revenue_history=_quarter_history(revenue),
    )


def _money(value: float | None) -> str:
    if value is None: return "자료에 없음"
    if abs(value) >= 100_000_000: return f"약 {value / 100_000_000:,.1f}억 달러"
    return f"약 {value / 10_000:,.0f}만 달러"


def to_result(m: Metrics) -> dict[str, Any]:
    growth = m.revenue_growth or 0
    dilution = m.dilution or 0
    score = max(35, min(95, round(62 + growth * 0.55 - max(0, dilution) * 0.8 + (5 if (m.operating_income or 0) > 0 else 0))))
    risk_findings = []
    if dilution > 5: risk_findings.append(f"1년 동안 주식 수가 {dilution:.1f}% 늘었어요")
    if (m.operating_income or 0) < 0: risk_findings.append("최근 3개월은 영업 손실이에요")
    if not risk_findings: risk_findings.append("숫자에 나오지 않는 사업 위험도 확인해야 해요")
    evidence = []
    filing_parts = (m.filing_label or "10-Q · 날짜 미확인").split(" · ")
    source_type = {"10-Q":"3개월 보고서", "10-K":"1년 보고서", "20-F":"해외기업 1년 보고서"}.get(filing_parts[0], "회사 보고서")
    source_label = f"{source_type} · {filing_parts[1]}" if len(filing_parts) > 1 else source_type
    if m.revenue_growth is not None: evidence.append({"label":"1년 전보다 늘어난 매출","value":f"{m.revenue_growth:+.1f}%","explanation":f"최근 3개월 매출이 1년 전 같은 3개월보다 {abs(m.revenue_growth):.1f}% {'늘었어요' if m.revenue_growth >= 0 else '줄었어요'}.","tone":"good" if m.revenue_growth >= 10 else "watch","source":source_label,"sourceType":source_type,"url":m.filing_url})
    if m.operating_income is not None: evidence.append({"label":"본업으로 번 돈","value":_money(m.operating_income),"explanation":"제품과 서비스를 팔아 운영비를 내고도 돈이 남았어요." if m.operating_income > 0 else "제품과 서비스를 판 돈보다 운영비가 더 많이 들었어요.","tone":"good" if m.operating_income > 0 else "watch","source":source_label,"sourceType":source_type,"url":m.filing_url})
    if m.dilution is not None: evidence.append({"label":"1년 동안 주식 수 변화","value":f"{m.dilution:+.1f}%","explanation":"주식 수가 많이 늘면 기존 주주 한 명의 몫이 작아질 수 있어요.","tone":"good" if m.dilution <= 5 else "watch","source":source_label,"sourceType":source_type,"url":m.filing_url})
    if m.cash is not None: evidence.append({"label":"회사가 가진 현금","value":_money(m.cash),"explanation":"급한 지출이나 성장을 위해 쓸 수 있는 돈이에요. 빚을 뺀 금액은 아니에요.","tone":"neutral","source":source_label,"sourceType":source_type,"url":m.filing_url})
    if m.dividend_per_share is not None: evidence.append({"label":"최근 1년 주당 배당금","value":f"${m.dividend_per_share:.2f}","explanation":f"공시에서 최근 연간 배당 기록을 확인했어요. 이어진 기록은 약 {m.dividend_years or 0}년이에요.","tone":"good","source":source_label,"sourceType":source_type,"url":m.filing_url})
    business = BUSINESS_SUMMARIES.get(m.ticker, f"SEC에 공시를 제출한 {m.company}예요. 구체적인 제품과 고객은 공시 원문에서 확인하세요.")
    profit_phrase = "본업에서도 돈을 벌고 있어요" if (m.operating_income or 0) > 0 else "본업에서는 아직 손실이 나고 있어요"
    return {
        "ticker":m.ticker,"company":m.company,"score":max(0,score-len(risk_findings)*3),"preRiskScore":score,
        "business":business,
        "revenueHistory":[{"period":item["period"], "value":item["value"], "display":_money(item["value"])} for item in (m.revenue_history or [])],
        "reason":f"매출이 {growth:.1f}% 변했고 {profit_phrase}",
        "risk":risk_findings[0],"whyFound":f"최근 3개월 매출이 1년 전보다 {growth:.1f}% 늘었어요.",
        "strongestCase":f"회사가 가진 현금 {_money(m.cash)}를 실제 자료에서 확인했어요.",
        "penalty":f"주식 수 변화 {dilution:.1f}%와 회사가 돈을 벌고 있는지를 점수에 반영했어요.",
        "reversalEvent":"다음 매출이 둔화되거나 현금이 크게 줄거나 주식 수가 많이 늘면 다시 봐야 해요.",
        "evidence":evidence,
        "riskFindings":risk_findings,"dataSource":"SEC EDGAR","asOf":m.filing_label,
    }


def screen_metrics(available: list[Metrics], growth_min: float, dilution_max: float, profit_required: bool) -> tuple[list[Metrics], list[Metrics], list[Metrics]]:
    growth_pass = [x for x in available if x.revenue_growth is not None and x.revenue_growth >= growth_min]
    profit_pass = [x for x in growth_pass if not profit_required or (x.operating_income is not None and x.operating_income > 0)]
    dilution_pass = [x for x in profit_pass if x.dilution is None or x.dilution <= dilution_max]
    return growth_pass, profit_pass, dilution_pass


def closest_matches(
    available: list[Metrics], growth_min: float, dilution_max: float,
    profit_required: bool, dividend_years_min: int = 0,
) -> list[tuple[Metrics, list[str]]]:
    """Rank honest near-matches without presenting them as exact passes."""
    ranked: list[tuple[float, Metrics, list[str]]] = []
    for metric in available:
        missed: list[str] = []
        penalty = 0.0
        if metric.revenue_growth is None:
            missed.append("최근 매출을 1년 전과 비교할 자료가 없어요")
            penalty += 100
        elif metric.revenue_growth < growth_min:
            gap = growth_min - metric.revenue_growth
            missed.append(f"매출 증가가 기준보다 {gap:.1f}%p 낮아요")
            penalty += min(100, gap)
        if profit_required and (metric.operating_income is None or metric.operating_income <= 0):
            missed.append("최근 분기 본업에서 이익을 내지 못했어요")
            penalty += 40
        if metric.dilution is not None and metric.dilution > dilution_max:
            gap = metric.dilution - dilution_max
            missed.append(f"주식 수 증가가 기준보다 {gap:.1f}%p 높아요")
            penalty += min(60, gap)
        if dividend_years_min and (metric.dividend_years or 0) < dividend_years_min:
            gap = dividend_years_min - (metric.dividend_years or 0)
            missed.append(f"연속 배당 기록이 기준보다 {gap}년 짧아요")
            penalty += min(50, gap * 3)
        if missed:
            ranked.append((len(missed) * 1000 + penalty - to_result(metric)["score"], metric, missed))
    return [(metric, missed) for _, metric, missed in sorted(ranked, key=lambda item: item[0])[:5]]


async def run_dig(
    client: SecClient, growth_min: float = 10, dilution_max: float = 15,
    profit_required: bool = False, intent: str = "growth", risk_level: str = "balanced",
    market_client: Any | None = None, drawdown_min: float = 0,
    pe_max: float = 0, yield_min: float = 0, dividend_years_min: int = 0,
    cap_max: float = 0,
) -> dict[str, Any]:
    cached = repository.load_all()
    if cached:
        available = [Metrics(**row) for row in cached]
    else:
        if os.getenv("ALLOW_LIVE_SEC_FALLBACK", "true").lower() != "true":
            raise RuntimeError("No published SEC snapshot")
        metrics = await asyncio.gather(*(analyze_company(client,t,c) for t,c in CANDIDATES.items()), return_exceptions=True)
        available = [x for x in metrics if isinstance(x, Metrics)]
    if not available:
        first_error = next((x for x in metrics if isinstance(x, Exception)), None) if not cached else None
        raise RuntimeError(f"SEC EDGAR returned no usable company data: {first_error}")
    growth_pass, profit_pass, dilution_pass = screen_metrics(available, growth_min, dilution_max, profit_required)
    growth_label = "매출 비교 자료가 있나" if growth_min <= -100 else "매출이 잘 늘었나"
    growth_explanation = "최근 매출을 1년 전과 비교할 수 있는 회사를 남겼어요." if growth_min <= -100 else f"최근 매출이 1년 전보다 {growth_min:.0f}% 이상 늘지 않은 회사를 뺐어요."
    intent_pass = dilution_pass
    if intent == "dividend" and dividend_years_min:
        intent_pass = [x for x in intent_pass if (x.dividend_years or 0) >= dividend_years_min]

    price_needed = intent in {"fallen", "value", "dividend", "emerging"}
    priced: list[tuple[Metrics, dict[str, Any]]] = []
    if price_needed and market_client:
        # 무료 시세 한도를 한 검색이 소진하지 않도록 SEC 점수 상위 4개만 가격 검증해요.
        price_candidates = sorted(intent_pass, key=lambda x: to_result(x)["score"], reverse=True)[:4]
        snapshots = await asyncio.gather(*(market_client.snapshot(x.ticker) for x in price_candidates), return_exceptions=True)
        priced = [(metric, snapshot) for metric, snapshot in zip(price_candidates, snapshots) if isinstance(snapshot, dict)]

    selected: list[tuple[Metrics, dict[str, Any] | None]] = []
    price_near: list[tuple[Metrics, dict[str, Any], list[str]]] = []
    if priced:
        for metric, market in priced:
            history = market.get("history") or []
            high = max((point["close"] for point in history), default=market["price"])
            drawdown = max(0.0, (1 - market["price"] / high) * 100) if high else 0.0
            pe = market["price"] / metric.eps_ttm if metric.eps_ttm and metric.eps_ttm > 0 else None
            dividend_yield = (metric.dividend_per_share / market["price"] * 100) if metric.dividend_per_share and market["price"] else None
            market_cap = metric.shares_outstanding * market["price"] if metric.shares_outstanding else None
            market = {**market, "drawdown": drawdown, "pe": pe, "dividendYield": dividend_yield, "marketCap": market_cap}
            missed = []
            if intent == "fallen" and drawdown < drawdown_min: missed.append(f"고점 대비 하락폭이 기준보다 {drawdown_min - drawdown:.1f}%p 작아요")
            if intent == "value" and (pe is None or (pe_max and pe > pe_max)): missed.append("현재 가격이 고른 가격 기준을 넘거나 비교 자료가 없어요")
            if intent == "dividend" and (dividend_yield is None or dividend_yield < yield_min): missed.append("현재 가격 기준 배당률이 고른 기준보다 낮아요")
            if intent == "emerging" and cap_max and (market_cap is None or market_cap > cap_max): missed.append("회사 크기가 고른 범위를 넘거나 비교 자료가 없어요")
            if missed:
                price_near.append((metric, market, missed))
            else:
                selected.append((metric, market))
    elif not price_needed:
        selected = [(metric, None) for metric in intent_pass]

    ranked = []
    for metric, market in selected:
        result = to_result(metric)
        if risk_level == "stable":
            result["score"] += 7 if (metric.operating_income or 0) > 0 else -12
            result["score"] += 3 if (metric.dividend_years or 0) >= 3 else 0
        elif risk_level == "aggressive":
            result["score"] += min(10, max(0, (metric.revenue_growth or 0) / 5))
        if market:
            result["market"] = market
            if market["pe"] is not None:
                result["evidence"].append({"label":"회사가 버는 돈 대비 가격","value":f"약 {market['pe']:.1f}배","explanation":"현재 가격을 최근 네 분기 주당이익으로 나눈 값이에요. 낮다고 무조건 좋은 것은 아니에요.","tone":"neutral","source":f"{market_data.provider} 가격 + SEC 이익","sourceType":"가격·회사 보고서","url":None})
            if market["dividendYield"] is not None:
                result["evidence"].append({"label":"현재 가격 기준 배당률","value":f"{market['dividendYield']:.2f}%","explanation":"최근 연간 주당 배당금을 현재 가격으로 나눈 값이에요.","tone":"good","source":f"{market_data.provider} 가격 + SEC 배당","sourceType":"가격·회사 보고서","url":None})
        result["matchStatus"] = "exact"
        result["missedConditions"] = []
        ranked.append(result)
    ranked = sorted(ranked, key=lambda x:x["score"], reverse=True)
    exact_match_count = len(ranked)
    ranked = ranked[:5]
    if not ranked:
        if price_near:
            near = [(metric, market, missed) for metric, market, missed in sorted(price_near, key=lambda item: (len(item[2]), -to_result(item[0])["score"]))[:5]]
        elif price_needed and intent_pass:
            near = [
                (metric, None, ["선택한 가격 조건을 확인할 시세 자료가 없어요"])
                for metric in sorted(intent_pass, key=lambda item: to_result(item)["score"], reverse=True)[:5]
            ]
        else:
            near = [(metric, None, missed) for metric, missed in closest_matches(
                available, growth_min, dilution_max, profit_required,
                dividend_years_min if intent == "dividend" else 0,
            )]
        for metric, market, missed in near:
            result = to_result(metric)
            result["matchStatus"] = "closest"
            result["missedConditions"] = missed
            result["reason"] = " · ".join(missed[:2])
            if market:
                result["market"] = market
            ranked.append(result)
    stages = [
        {"count":len(available),"label":"회사 자료 확인","removed":0 if cached else len(CANDIDATES)-len(available),"explanation":"회사가 미국 정부에 낸 최신 자료를 불러왔어요.","rejected":[]},
        {"count":len(growth_pass),"label":growth_label,"removed":len(available)-len(growth_pass),"explanation":growth_explanation,"rejected":[{"ticker":x.ticker,"reason":f"매출 증가 {x.revenue_growth:.1f}%" if x.revenue_growth is not None else "비교할 최신 자료가 없어요"} for x in available if x not in growth_pass][:3]},
        {"count":len(profit_pass),"label":"지금 돈을 벌고 있나","removed":len(growth_pass)-len(profit_pass),"explanation":"최근 분기 영업 흑자인 회사만 남겼어요." if profit_required else "적자 회사도 후보에 포함했어요.","rejected":[{"ticker":x.ticker,"reason":"최근 분기 영업 손실" if x.operating_income is not None else "영업이익 자료가 없어요"} for x in growth_pass if x not in profit_pass][:3]},
        {"count":len(dilution_pass),"label":"주식 수를 너무 늘렸나","removed":len(profit_pass)-len(dilution_pass),"explanation":f"1년 동안 주식 수가 {dilution_max:.0f}% 넘게 늘어난 회사를 뺐어요.","rejected":[{"ticker":x.ticker,"reason":f"주식 수가 {x.dilution:.1f}% 늘었어요"} for x in profit_pass if x not in dilution_pass][:3]},
        {"count":exact_match_count,"label":"내 성향과 찾는 방향 반영","removed":max(0,len(dilution_pass)-exact_match_count),"explanation":f"{risk_level} 성향과 {intent} 방향의 숫자 조건을 적용했어요.","rejected":[]},
    ]
    snapshot = repository.status() if cached else {"syncedAt":None}
    unsupported = ["앞으로의 주요 일정"]
    if price_needed and not priced: unsupported.append("가격 연결이 없어 가격 관련 조건은 후보 확인 항목으로 표시")
    coverage_complete = not price_needed or len(priced) >= len(intent_pass)
    if not coverage_complete:
        coverage_note = f"가격 조건은 무료 시세 범위 때문에 후보 {len(intent_pass):,}개 중 {len(priced):,}개를 확인했어요."
        for result in ranked:
            result["coverageNote"] = coverage_note
    return {
        "results":ranked,"stages":stages,
        "source":f"미국 SEC 자료 + {market_data.provider} 가격" if priced else "미국 SEC 자료",
        "scope":f"미국 공시 기업 {len(available):,}개",
        "market":"US","universeCount":len(available),
        "priceCheckedCount":len(priced),"exactMatchCount":exact_match_count,
        "coverageComplete":coverage_complete,
        "resultMode":"exact" if exact_match_count else "closest",
        "dataAsOf":snapshot["syncedAt"],"unsupported":unsupported,
    }
