from app.engine import Metrics, closest_matches, screen_metrics, to_result


def metric(ticker: str, growth: float, dilution: float, profit: float) -> Metrics:
    return Metrics(ticker, ticker, 1, growth, 1_000_000, dilution, profit, None, None)


companies = [
    metric("GOOD", 20, 3, 10),
    metric("LOSS", 20, 3, -10),
    metric("DILUTED", 20, 40, 10),
]
_, profitable, passed = screen_metrics(companies, 15, 15, True)
assert [company.ticker for company in profitable] == ["GOOD", "DILUTED"]
assert [company.ticker for company in passed] == ["GOOD"]
sources = {
    key: {"form": "10-Q", "filed": "2026-01-01", "url": f"https://www.sec.gov/{key}"}
    for key in ("revenue", "cash", "operating_income", "dilution")
}
result = to_result(Metrics("PLTR", "Palantir", 1, 20, 1_000_000_000, 2, 100_000_000, "https://www.sec.gov/", "10-Q · 2026-01-01", evidence_sources=sources))
assert result["business"].startswith("정부와 기업")
assert result["evidence"][0]["explanation"].startswith("최근 3개월")
assert {item["label"] for item in result["evidence"]} == {"1년 전보다 달라진 매출", "본업으로 번 돈", "1년 동안 주식 수 변화", "회사가 가진 현금"}
assert result["evidence"][1]["value"] == "약 1.0억 달러"
assert result["evidence"][0]["source"] == "3개월 보고서 · 2026-01-01"
assert result["evidence"][0]["url"].endswith("/revenue")
falling = to_result(Metrics("DOWN", "Down", 1, -12, None, 0, None, None, None))
assert "12.0% 줄었어요" in falling["whyFound"]
assert "자료에 없음" not in falling["strongestCase"]
missing = to_result(Metrics("MISS", "Missing", 1, None, None, 0, None, None, None))
assert "비교할 매출 자료가 없고" in missing["reason"]
assert missing["evidence"] == [{"label": "1년 동안 주식 수 변화", "value": "+0.0%", "explanation": "주식 수가 많이 늘면 기존 주주 한 명의 몫이 작아질 수 있어요.", "tone": "good", "source": "SEC Company Facts · 지표별 제출일 확인 필요", "sourceType": "SEC 자료", "url": None}]
chart_result = to_result(Metrics("PLTR", "Palantir", 1, 20, 1, 2, 1, None, None, [{"period":"2025 Q1", "value":100_000_000}, {"period":"2026 Q1", "value":120_000_000}]))
assert chart_result["revenueHistory"][-1] == {"period":"2026 Q1", "value":120_000_000, "display":"약 1.2억 달러"}

# Exact matches can legitimately be empty, but the product must still return
# useful near matches and say exactly which condition each company missed.
strict = [metric("ALMOST", 24, 4, 10), metric("FAR", 2, 40, -10)]
near = closest_matches(strict, growth_min=25, dilution_max=5, profit_required=True)
assert near[0][0].ticker == "ALMOST"
assert near[0][1] == ["매출 증가가 기준보다 1.0%p 낮아요"]
print("engine filter check passed")
