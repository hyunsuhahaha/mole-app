import {
  buildScreeningProfile,
  getQuestions,
  inferIntent,
  intents,
  questionsByIntent,
} from "../src/data/screenerConversation.ts";
import { calculateRiskProfile, riskQuestions } from "../src/data/riskProfile.ts";

function equal(actual, expected) {
  if (actual !== expected) {
    throw new Error(`expected ${expected}, received ${actual}`);
  }
}

equal(inferIntent("엄청 떨어졌는데 회사는 멀쩡한 거"), "fallen");
equal(inferIntent("배당 오래 주는 회사"), "dividend");
equal(intents.length, 6);
equal(intents.every((intent) => intent.supported), true);
equal(riskQuestions.length, 5);
equal(calculateRiskProfile({ moneyTiming: "soon", lossReaction: "buy", priority: "growth", companyStage: "allow", experience: "often" }).level, "stable");
equal(calculateRiskProfile({ moneyTiming: "long", lossReaction: "buy", priority: "growth", companyStage: "allow", experience: "often" }).level, "aggressive");
equal(questionsByIntent.growth[0].text, "성장이 얼마나 오래 이어져야 하나요?");
equal(questionsByIntent.dividend[0].text, "배당을 얼마나 오래 줬어야 하나요?");
equal(getQuestions("growth", {}).some((question) => question.key === "runway"), false);
equal(getQuestions("growth", { profitability: "loss_ok" }).some((question) => question.key === "runway"), true);

const built = buildScreeningProfile("성장주", "growth", {
  growth: "growth_25",
  profitability: "profit_only",
  dilution: "dilution_30",
});
equal(built.filters.growth, "25% 이상");
equal(built.filters.dilution, "조금은 허용");
equal(built.filters.lossAllowed, "제외");
equal(built.profile.must.length, 3);
equal(built.profile.intentId, "growth");

const unknowns = buildScreeningProfile("모르겠음", "quality", {
  growth: "unknown",
  profitability: "unknown",
  dilution: "unknown",
});
equal(unknowns.filters.growth, "상관없음");
equal(unknowns.filters.dilution, "상관없음");
equal(unknowns.profile.must.length, 0);
console.log("screener conversation check passed");
