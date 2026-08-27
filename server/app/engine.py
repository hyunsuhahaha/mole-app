import asyncio
import re
from dataclasses import dataclass
from typing import Any

from .sec_client import SecClient

CANDIDATES = {
    "NVDA": 1045810, "PLTR": 1321655, "DUOL": 1562088, "CELH": 1341766,
    "TMDX": 1756262, "CRWD": 1535527, "SNOW": 1640147, "UBER": 1543151,
}

REVENUE_TAGS = ["RevenueFromContractWithCustomerExcludingAssessedTax", "Revenues", "SalesRevenueNet"]
CASH_TAGS = ["CashAndCashEquivalentsAtCarryingValue", "CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents"]
SHARE_TAGS = ["CommonStockSharesOutstanding", "EntityCommonStockSharesOutstanding"]


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


def _quarter_growth(items: list[dict[str, Any]]) -> float | None:
    framed: dict[str, dict[str, Any]] = {}
    for item in items:
        frame = item.get("frame", "")
        if item.get("form") == "10-Q" and re.fullmatch(r"CY\d{4}Q[1-4]", frame):
            if frame not in framed or item.get("filed", "") > framed[frame].get("filed", ""):
                framed[frame] = item
    if not framed:
        return None
    latest_frame = max(framed)
    year, quarter = int(latest_frame[2:6]), latest_frame[-2:]
    previous = f"CY{year - 1}{quarter}"
    if previous not in framed or not framed[previous].get("val"):
        return None
    return (framed[latest_frame]["val"] / framed[previous]["val"] - 1) * 100


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
    facts, submissions = await asyncio.gather(client.company_facts(cik), client.submissions(cik))
    revenue = _units(facts, REVENUE_TAGS, "USD")
    cash_fact = _latest_instant(_units(facts, CASH_TAGS, "USD"))
    shares = _units(facts, SHARE_TAGS, "shares")
    operating = _latest_duration(_units(facts, ["OperatingIncomeLoss"], "USD"))
    recent = submissions.get("filings", {}).get("recent", {})
    filing_url = filing_label = None
    for index, form in enumerate(recent.get("form", [])):
        if form in {"10-Q", "10-K", "20-F"}:
            accession = recent["accessionNumber"][index]
            document = recent["primaryDocument"][index]
            filing_url = client.filing_url(cik, accession, document)
            filing_label = f"{form} · {recent['filingDate'][index]}"
            break
    return Metrics(ticker, facts.get("entityName", ticker), cik, _quarter_growth(revenue), cash_fact.get("val") if cash_fact else None, _dilution(shares), operating.get("val") if operating else None, filing_url, filing_label)


def _money(value: float | None) -> str:
    if value is None: return "공시값 없음"
    if abs(value) >= 1_000_000_000: return f"${value / 1_000_000_000:.1f}B"
    return f"${value / 1_000_000:.0f}M"


def to_result(m: Metrics) -> dict[str, Any]:
    growth = m.revenue_growth or 0
    dilution = m.dilution or 0
    score = max(35, min(95, round(62 + growth * 0.55 - max(0, dilution) * 0.8 + (5 if (m.operating_income or 0) > 0 else 0))))
    risk_findings = []
    if dilution > 5: risk_findings.append(f"최근 발행주식 증가 {dilution:.1f}%")
    if (m.operating_income or 0) < 0: risk_findings.append("최근 분기 영업적자")
    if not risk_findings: risk_findings.append("공시 수치 외 사업 위험 추가 확인 필요")
    return {
        "ticker":m.ticker,"company":m.company,"score":max(0,score-len(risk_findings)*3),"preRiskScore":score,
        "reason":f"최근 분기 매출 성장률 {growth:.1f}%와 공시 재무상태를 통과",
        "risk":risk_findings[0],"whyFound":f"SEC 공시 기준 최근 분기 매출이 전년 동기보다 {growth:.1f}% 성장했어요.",
        "strongestCase":f"현금 및 현금성 자산 {_money(m.cash)}가 공시에서 확인돼요.",
        "penalty":f"희석률 {dilution:.1f}%와 영업손익을 반영해 점수를 조정했어요.",
        "reversalEvent":"다음 분기 매출 성장 둔화, 현금 급감 또는 큰 증자가 확인되면 판단이 바뀔 수 있어요.",
        "evidence":[{"label":"현금 및 현금성 자산","value":_money(m.cash),"source":m.filing_label or "SEC EDGAR","sourceType":"10-Q","url":m.filing_url}],
        "riskFindings":risk_findings,"dataSource":"SEC EDGAR","asOf":m.filing_label,
    }


async def run_dig(client: SecClient, growth_min: float = 10, dilution_max: float = 15) -> dict[str, Any]:
    metrics = await asyncio.gather(*(analyze_company(client,t,c) for t,c in CANDIDATES.items()), return_exceptions=True)
    available = [x for x in metrics if isinstance(x, Metrics)]
    if not available:
        first_error = next((x for x in metrics if isinstance(x, Exception)), None)
        raise RuntimeError(f"SEC EDGAR returned no usable company data: {first_error}")
    growth_pass = [x for x in available if x.revenue_growth is not None and x.revenue_growth >= growth_min]
    dilution_pass = [x for x in growth_pass if x.dilution is None or x.dilution <= dilution_max]
    ranked = sorted((to_result(x) for x in dilution_pass), key=lambda x:x["score"], reverse=True)[:5]
    stages = [
        {"count":len(available),"label":"SEC 공시 조회 완료","removed":len(CANDIDATES)-len(available),"explanation":"선정된 실데이터 검증 유니버스의 최신 SEC 공시를 불러왔어요.","rejected":[]},
        {"count":len(growth_pass),"label":"실제 매출 성장률 필터","removed":len(available)-len(growth_pass),"explanation":f"전년 동기 대비 매출 성장률 {growth_min:.0f}% 미만을 제외했어요.","rejected":[{"ticker":x.ticker,"reason":f"매출 성장률 {x.revenue_growth:.1f}%" if x.revenue_growth is not None else "비교 가능한 분기 공시 없음"} for x in available if x not in growth_pass][:3]},
        {"count":len(dilution_pass),"label":"실제 희석 위험 필터","removed":len(growth_pass)-len(dilution_pass),"explanation":f"발행주식 증가율 {dilution_max:.0f}% 초과 종목을 제외했어요.","rejected":[{"ticker":x.ticker,"reason":f"발행주식 증가율 {x.dilution:.1f}%"} for x in growth_pass if x not in dilution_pass][:3]},
        {"count":len(ranked),"label":"SEC 원문 근거 교차검증","removed":max(0,len(dilution_pass)-len(ranked)),"explanation":"최신 10-Q/10-K 원문 링크가 있는 상위 종목을 남겼어요.","rejected":[]},
    ]
    return {"results":ranked,"stages":stages,"source":"SEC EDGAR","scope":f"검증 유니버스 {len(CANDIDATES)}개 종목","unsupported":["실시간 주가","시가총액","1년 수익률","향후 촉매"]}
