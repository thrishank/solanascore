import { RawAccount } from "@solana/spl-token";
import { lst_tokens, popular_program_id, stable_coins } from "./data";
import { calculateProgramScore, ProgramIdDetailedCount } from "./program";
import { StreakAnalysis } from "./time";

export default function onchainScore(
  txCount: number,
  stats: StreakAnalysis,
  programIdCountMap: ProgramIdDetailedCount[],
  tokens: RawAccount[],
  domains: boolean,
) {
  let score = 0;
  score += days_score(stats, txCount); // 50
  score += programs_score(programIdCountMap); // 20
  score += token_score(tokens); //  20
  if (domains) score += 10; // 10
  return score;
}

function programs_score(program_data: ProgramIdDetailedCount[]): number {
  const programScore: { [key in keyof typeof popular_program_id]: number } = {
    jupiter: 0,
    tensor: 0,
    squads: 0,
    token: 0,
    metaplex: 0,
    swap: 0,
    stake: 0,
  };

  program_data.forEach((program) => {
    for (const [category, ids] of Object.entries(popular_program_id)) {
      if (ids.includes(program.programId)) {
        programScore[category as keyof typeof programScore] +=
          calculateProgramScore(program);
        break;
      }
    }
  });
  const score =
    programScore.jupiter +
    programScore.tensor +
    programScore.squads +
    programScore.metaplex;

  console.log("Program Score: ", programScore);
  return score;
}

function days_score(stats: StreakAnalysis, totaltx: number): number {
  // Weighted scoring for unique active days
  const uniqueDaysScore = Math.min(
    20,
    Math.log2(stats.uniqueDays + 1) * 4, // Logarithmic scaling
  );

  // Exponential scoring for longest streak
  const streakScore = Math.min(
    10,
    (Math.exp(stats.longestStreak / 50) - 1) * 2, // Exponential scaling
  );

  // Monthly transactions scoring
  let monthlyTxScore = 0;
  let consistencyCheck = true;

  for (let i = 1; i <= 12; i++) {
    if (stats.counts[i] === undefined) {
      consistencyCheck = false;
      continue;
    }
    if (stats.counts[i] > 4) {
      monthlyTxScore += 0.5; // Reward for reaching 5+ transactions in a month
    }
  }

  // Bonus for consistent activity across all months
  if (consistencyCheck) {
    monthlyTxScore += 3;
  }

  // Consistency bonus (lower standard deviation of monthly counts earns extra points)
  const transactionCounts = Object.values(stats.counts || {});
  const meanTx =
    transactionCounts.reduce((sum, val) => sum + val, 0) /
      transactionCounts.length || 0;
  const variance =
    transactionCounts.reduce((sum, val) => sum + Math.pow(val - meanTx, 2), 0) /
      transactionCounts.length || 0;
  const stdDev = Math.sqrt(variance);
  let consistencyBonus = Math.max(0, 5 - stdDev); // Up to 5 points for lower variability

  // Total transactions scoring (new feature)
  const totalTxScore = Math.min(
    5,
    Math.log2(totaltx + 1), // Logarithmic scaling for total transactions
  );

  // Calculate total score (max 50 points)
  const totalScore = Math.min(
    50,
    uniqueDaysScore +
      streakScore +
      monthlyTxScore +
      consistencyBonus +
      totalTxScore,
  );

  return Math.floor(totalScore);
}

function token_score(tokens: RawAccount[]): number {
  let score = 0;
  let lst_check = false,
    stable_coin_check = false;
  for (let i = 0; i < tokens.length; i++) {
    if (lst_check && stable_coin_check) break;
    if (
      lst_tokens.includes(tokens[i].mint.toString()) &&
      tokens[i].amount !== BigInt(0)
    )
      lst_check = true;
    if (
      stable_coins.includes(tokens[i].mint.toString()) &&
      tokens[i].amount !== BigInt(0)
    )
      stable_coin_check = true;
  }
  if (lst_check) score += 10;
  if (stable_coin_check) score += 10;
  return score;
}
