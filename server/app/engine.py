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
    if value is None: return "자료에 없음"
    if abs(value) >= 1_000_000_000: return f"${value / 1_000_000_000:.1f}B"
    return f"${value / 1_000_000:.0f}M"


def to_result(m: Metrics) -> dict[str, Any]:
    growth = m.revenue_growth or 0
    dilution = m.dilution or 0
    score = max(35, min(95, round(62 + growth * 0.55 - max(0, dilution) * 0.8 + (5 if (m.operating_income or 0) > 0 else 0))))
    risk_findings = []
    if dilution > 5: risk_findings.append(f"1년 동안 주식 수가 {dilution:.1f}% 늘었어요")
    if (m.operating_income or 0) < 0: risk_findings.append("최근 3개월은 영업 손실이에요")
    if not risk_findings: risk_findings.append("숫자에 나오지 않는 사업 위험도 확인해야 해요")
    return {
        "ticker":m.ticker,"company":m.company,"score":max(0,score-len(risk_findings)*3),"preRiskScore":score,
        "reason":f"최근 매출이 {growth:.1f}% 늘었고 회사 자료도 확인했어요",
        "risk":risk_findings[0],"whyFound":f"최근 3개월 매출이 1년 전보다 {growth:.1f}% 늘었어요.",
        "strongestCase":f"회사가 가진 현금 {_money(m.cash)}를 실제 자료에서 확인했어요.",
        "penalty":f"주식 수 변화 {dilution:.1f}%와 회사가 돈을 벌고 있는지를 점수에 반영했어요.",
        "reversalEvent":"다음 매출이 둔화되거나 현금이 크게 줄거나 주식 수가 많이 늘면 다시 봐야 해요.",
        "evidence":[{"label":"회사가 가진 현금","value":_money(m.cash),"source":m.filing_label or "SEC EDGAR","sourceType":"10-Q","url":m.filing_url}],
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
        {"count":len(available),"label":"회사 자료 확인","removed":len(CANDIDATES)-len(available),"explanation":"회사가 미국 정부에 낸 최신 자료를 불러왔어요.","rejected":[]},
        {"count":len(growth_pass),"label":"매출이 잘 늘었나","removed":len(available)-len(growth_pass),"explanation":f"최근 매출이 1년 전보다 {growth_min:.0f}% 이상 늘지 않은 회사를 뺐어요.","rejected":[{"ticker":x.ticker,"reason":f"매출 증가 {x.revenue_growth:.1f}%" if x.revenue_growth is not None else "비교할 최신 자료가 없어요"} for x in available if x not in growth_pass][:3]},
        {"count":len(dilution_pass),"label":"주식 수를 너무 늘렸나","removed":len(growth_pass)-len(dilution_pass),"explanation":f"1년 동안 주식 수가 {dilution_max:.0f}% 넘게 늘어난 회사를 뺐어요.","rejected":[{"ticker":x.ticker,"reason":f"주식 수가 {x.dilution:.1f}% 늘었어요"} for x in growth_pass if x not in dilution_pass][:3]},
        {"count":len(ranked),"label":"회사 자료로 다시 확인","removed":max(0,len(dilution_pass)-len(ranked)),"explanation":"숫자의 출처를 확인할 수 있는 회사만 남겼어요.","rejected":[]},
    ]
    return {"results":ranked,"stages":stages,"source":"미국 SEC 자료","scope":f"먼저 확인하는 회사 {len(CANDIDATES)}개","unsupported":["실시간 주가","회사 크기","1년 주가 변화","앞으로의 주요 일정"]}
