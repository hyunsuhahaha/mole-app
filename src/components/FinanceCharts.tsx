import { Fragment, useMemo, useRef, useState } from "react";
import { PanResponder, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Line, Path, Rect, Text as SvgText } from "react-native-svg";
import { colors } from "../theme/tokens";
import { chartIndexFromX, movingAverage } from "../utils/movingAverage";

type PricePoint = { date: string; open?: number; high?: number; low?: number; close: number; volume?: number };
type RevenuePoint = { period: string; value: number; display: string };
const ranges = [{ label: "1주", days: 5 }, { label: "1개월", days: 22 }, { label: "3개월", days: 66 }, { label: "1년", days: 260 }];
const chartHeight = 310;
const upColor = "#E5484D";
const downColor = "#3478D4";
const averages = [{ days: 5, color: "#E2A400" }, { days: 20, color: "#3478D4" }, { days: 60, color: "#3D9B67" }, { days: 120, color: "#8B8B8B" }];

export function PriceCandlestickChart({ history, currency }: { history: PricePoint[]; currency: string }) {
  const [days, setDays] = useState(66);
  const [width, setWidth] = useState(320);
  const [selected, setSelected] = useState<number | null>(null);
  const start = Math.max(0, history.length - days);
  const points = history.slice(start);
  const activeIndex = selected != null && Number.isInteger(selected) && selected >= 0 && selected < points.length ? selected : points.length - 1;
  const active = points[activeIndex];
  const first = points[0]?.close ?? 0;
  const change = first ? ((active?.close ?? first) / first - 1) * 100 : 0;
  const pad = { left: 7, right: 49, top: 14 };
  const priceBottom = 205;
  const volumeTop = 225;
  const volumeBottom = 278;
  const plotWidth = Math.max(1, width - pad.left - pad.right);
  const step = plotWidth / Math.max(1, points.length);
  const candleWidth = Math.max(1.2, Math.min(9, step * 0.68));
  const highs = points.map((point) => point.high ?? Math.max(point.open ?? point.close, point.close));
  const lows = points.map((point) => point.low ?? Math.min(point.open ?? point.close, point.close));
  const rawMin = Math.min(...lows);
  const rawMax = Math.max(...highs);
  const spread = Math.max(rawMax - rawMin, rawMax * 0.02, 0.01);
  const min = rawMin - spread * 0.05;
  const max = rawMax + spread * 0.05;
  const x = (index: number) => pad.left + step * index + step / 2;
  const y = (value: number) => pad.top + ((max - value) / (max - min)) * (priceBottom - pad.top);
  const maxVolume = Math.max(...points.map((point) => point.volume ?? 0), 1);
  const maLines = useMemo(() => averages.map((average) => ({
    ...average,
    values: movingAverage(history.map((point) => point.close), average.days).slice(start),
  })), [history, start]);

  const setFromX = (locationX: number) => {
    const next = chartIndexFromX(locationX, pad.left, plotWidth, points.length);
    if (next != null) setSelected(next);
  };
  const responder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => setFromX(event.nativeEvent.locationX),
    onPanResponderMove: (event) => setFromX(event.nativeEvent.locationX),
    onPanResponderRelease: () => setSelected(null),
    onPanResponderTerminate: () => setSelected(null),
  })).current;

  if (points.length < 2) return <Text style={s.noData}>캔들차트를 그리기에 가격 자료가 부족해요.</Text>;
  const open = active.open ?? active.close;
  const high = active.high ?? Math.max(open, active.close);
  const low = active.low ?? Math.min(open, active.close);
  return (
    <View>
      <View style={s.chartReadout}>
        <View><Text style={s.readoutDate}>{active.date}</Text><Text style={s.readoutValue}>{currency === "USD" ? "$" : ""}{active.close.toFixed(2)}</Text></View>
        <Text style={[s.readoutChange, change < 0 && s.down]}>{change >= 0 ? "+" : ""}{change.toFixed(2)}%</Text>
      </View>
      <Text style={s.ohlc}>시 {open.toFixed(2)}  고 {high.toFixed(2)}  저 {low.toFixed(2)}  종 {active.close.toFixed(2)}</Text>
      <View style={s.legend}>{averages.map((average) => <View key={average.days} style={s.legendItem}><View style={[s.legendLine, { backgroundColor: average.color }]} /><Text style={s.legendText}>MA{average.days}</Text></View>)}</View>
      <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)} style={s.priceSvgWrap} {...(Platform.OS === "web" ? {} : responder.panHandlers)}>
        <Svg width={width} height={chartHeight}>
          {[0, 1, 2, 3, 4].map((index) => {
            const lineY = pad.top + (index / 4) * (priceBottom - pad.top);
            const value = max - (index / 4) * (max - min);
            return <Fragment key={index}><Line x1={pad.left} x2={width - pad.right + 4} y1={lineY} y2={lineY} stroke={colors.line} strokeWidth="1" /><SvgText x={width - 3} y={lineY + 3} textAnchor="end" fontSize="9" fill={colors.muted}>{value.toFixed(2)}</SvgText></Fragment>;
          })}
          {points.map((point, index) => {
            const pointOpen = point.open ?? point.close;
            const pointHigh = point.high ?? Math.max(pointOpen, point.close);
            const pointLow = point.low ?? Math.min(pointOpen, point.close);
            const rising = point.close >= pointOpen;
            const color = rising ? upColor : downColor;
            const bodyTop = y(Math.max(pointOpen, point.close));
            const bodyHeight = Math.max(1, Math.abs(y(pointOpen) - y(point.close)));
            const volumeHeight = ((point.volume ?? 0) / maxVolume) * (volumeBottom - volumeTop);
            return <Fragment key={point.date}><Line x1={x(index)} x2={x(index)} y1={y(pointHigh)} y2={y(pointLow)} stroke={color} strokeWidth={Math.max(1, candleWidth * 0.18)} /><Rect x={x(index) - candleWidth / 2} y={bodyTop} width={candleWidth} height={bodyHeight} fill={color} /><Rect x={x(index) - candleWidth / 2} y={volumeBottom - volumeHeight} width={candleWidth} height={volumeHeight} fill={color} opacity="0.72" /></Fragment>;
          })}
          {maLines.map((average) => {
            const path = average.values.map((value, index) => value == null ? "" : `${average.values.slice(0, index).some((item) => item != null) ? "L" : "M"}${x(index).toFixed(1)},${y(value).toFixed(1)}`).filter(Boolean).join(" ");
            return path ? <Path key={average.days} d={path} fill="none" stroke={average.color} strokeWidth="1.25" opacity="0.9" /> : null;
          })}
          <Line x1={pad.left} x2={width - pad.right + 4} y1={volumeTop - 8} y2={volumeTop - 8} stroke={colors.line} />
          <SvgText x={pad.left} y="222" fontSize="8" fill={colors.muted}>거래량</SvgText>
          <SvgText x={pad.left} y="299" fontSize="9" fill={colors.muted}>{points[0].date.slice(5)}</SvgText>
          <SvgText x={width - pad.right} y="299" textAnchor="end" fontSize="9" fill={colors.muted}>{points[points.length - 1].date.slice(5)}</SvgText>
          {selected != null && <Line x1={x(selected)} x2={x(selected)} y1={pad.top} y2={volumeBottom} stroke={colors.ink} strokeWidth="1" strokeDasharray="4 3" />}
        </Svg>
        {Platform.OS === "web" && <Pressable accessibilityLabel="가격 차트에서 날짜 선택" onPress={(event) => setFromX(event.nativeEvent.locationX ?? (event.nativeEvent as unknown as { offsetX?: number }).offsetX ?? Number.NaN)} style={s.webPriceTarget} />}
      </View>
      <View style={s.rangeRow}>{ranges.map((range) => <Pressable key={range.days} accessibilityRole="button" onPress={() => { setDays(range.days); setSelected(null); }} style={[s.range, days === range.days && s.rangeActive]}><Text style={[s.rangeText, days === range.days && s.rangeTextActive]}>{range.label}</Text></Pressable>)}</View>
    </View>
  );
}

export function RevenueBarChart({ data }: { data: RevenuePoint[] }) {
  const [width, setWidth] = useState(320);
  const [selected, setSelected] = useState(Math.min(5, data.length - 1));
  const points = data.slice(-6);
  const pad = { left: 46, right: 8, top: 14 };
  const plotWidth = Math.max(1, width - pad.left - pad.right);
  const plotHeight = 170;
  const max = Math.max(...points.map((point) => point.value), 1) * 1.12;
  const step = plotWidth / Math.max(1, points.length);
  const barWidth = Math.min(42, step * 0.54);
  const active = points[Math.min(selected, points.length - 1)];
  const short = (value: number) => value >= 1_000_000_000 ? `$${(value / 1_000_000_000).toFixed(1)}B` : `$${Math.round(value / 1_000_000)}M`;
  return (
    <View>
      <View style={s.chartReadout}><View><Text style={s.readoutDate}>{active.period}</Text><Text style={s.readoutValue}>{active.display}</Text></View><Text style={s.revenueTag}>분기 매출</Text></View>
      <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)} style={s.revenueSvgWrap}>
        <Svg width={width} height={220}>
          {[0, 1, 2, 3].map((index) => {
            const lineY = pad.top + (index / 3) * plotHeight;
            const value = max - (index / 3) * max;
            return <Fragment key={index}><Line x1={pad.left} x2={width - pad.right} y1={lineY} y2={lineY} stroke={colors.line} strokeDasharray="3 5" /><SvgText x={pad.left - 7} y={lineY + 3} textAnchor="end" fontSize="9" fill={colors.muted}>{short(value)}</SvgText></Fragment>;
          })}
          {points.map((point, index) => {
            const height = (point.value / max) * plotHeight;
            const barX = pad.left + step * index + (step - barWidth) / 2;
            const activeBar = index === selected;
            return <Fragment key={point.period}><Rect x={barX} y={pad.top + plotHeight - height} width={barWidth} height={height} rx="5" fill={activeBar ? colors.green : colors.soilLight} onPress={Platform.OS === "web" ? undefined : () => setSelected(index)} /><SvgText x={barX + barWidth / 2} y="207" textAnchor="middle" fontSize="9" fontWeight={activeBar ? "700" : "400"} fill={activeBar ? colors.ink : colors.muted}>{point.period.replace("20", "")}</SvgText></Fragment>;
          })}
        </Svg>
        {Platform.OS === "web" && <View style={[s.webRevenueTargets, { left: pad.left, right: pad.right, top: pad.top, height: plotHeight }]}>{points.map((point, index) => <Pressable key={`${point.period}-target`} accessibilityLabel={`${point.period} 매출 보기`} onPress={() => setSelected(index)} style={s.webRevenueTarget} />)}</View>}
      </View>
      <Text style={s.dragHelp}>막대를 누르면 해당 분기의 정확한 매출을 볼 수 있어요.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  chartReadout: { minHeight: 59, flexDirection: "row", alignItems: "flex-end" },
  readoutDate: { fontSize: 10, fontWeight: "800", color: colors.muted },
  readoutValue: { marginTop: 3, fontSize: 24, fontWeight: "900", color: colors.ink, fontVariant: ["tabular-nums"] },
  readoutChange: { marginLeft: "auto", marginBottom: 4, fontSize: 14, fontWeight: "900", color: upColor, fontVariant: ["tabular-nums"] },
  down: { color: downColor },
  ohlc: { marginTop: 5, fontSize: 9, color: colors.muted, fontVariant: ["tabular-nums"] },
  legend: { marginTop: 9, flexDirection: "row", gap: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendLine: { width: 13, height: 2 },
  legendText: { fontSize: 8, fontWeight: "700", color: colors.muted },
  revenueTag: { marginLeft: "auto", marginBottom: 5, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 7, overflow: "hidden", backgroundColor: "#E4D6BD", fontSize: 9, fontWeight: "900", color: colors.green },
  priceSvgWrap: { width: "100%", minHeight: chartHeight, marginTop: 5 },
  revenueSvgWrap: { width: "100%", minHeight: 230 },
  webPriceTarget: { position: "absolute", left: 7, right: 49, top: 14, height: 264 },
  webRevenueTargets: { position: "absolute", flexDirection: "row" },
  webRevenueTarget: { flex: 1 },
  rangeRow: { marginTop: 3, padding: 4, borderRadius: 11, backgroundColor: "#E7DCC8", flexDirection: "row" },
  range: { flex: 1, minHeight: 31, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  rangeActive: { backgroundColor: colors.paper },
  rangeText: { fontSize: 10, fontWeight: "800", color: colors.muted },
  rangeTextActive: { color: colors.ink },
  noData: { paddingVertical: 24, fontSize: 11, color: colors.muted },
  dragHelp: { marginTop: -3, textAlign: "right", fontSize: 9, color: colors.muted },
});
