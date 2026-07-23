import { nativeToScVal, Address } from '@stellar/stellar-sdk'
import { callContract, readContract, TOKEN_ID, QUEST_ID } from './contracts'

export async function getTokenBalance(address) {
  const args = [new Address(address).toScVal()]
  return readContract(TOKEN_ID, 'balance', args, address)
}

export async function getQuest(questId, sourceAddress) {
  const args = [nativeToScVal(questId, { type: 'u64' })]
  return readContract(QUEST_ID, 'get_quest', args, sourceAddress)
}

export async function getAllQuests(sourceAddress) {
  return readContract(QUEST_ID, 'get_all_quests', [], sourceAddress)
}

export async function hasCompletedQuest(questId, studentAddress) {
  const args = [
    nativeToScVal(questId, { type: 'u64' }),
    new Address(studentAddress).toScVal(),
  ]
  return readContract(QUEST_ID, 'has_completed', args, studentAddress)
}

export async function completeQuest(questId, studentAddress) {
  const args = [
    nativeToScVal(questId, { type: 'u64' }),
    new Address(studentAddress).toScVal(),
  ]
  return callContract(QUEST_ID, 'complete_quest', args, studentAddress)
}

export async function getReward(rewardId, sourceAddress) {
  const args = [nativeToScVal(rewardId, { type: 'u64' })]
  return readContract(QUEST_ID, 'get_reward', args, sourceAddress)
}

export async function redeemReward(rewardId, studentAddress) {
  const args = [
    nativeToScVal(rewardId, { type: 'u64' }),
    new Address(studentAddress).toScVal(),
  ]
  return callContract(QUEST_ID, 'redeem_reward', args, studentAddress)
}

export async function createQuest(
  questId,
  title,
  rewardAmount,
  adminAddress
) {
  const args = [
    nativeToScVal(questId, { type: 'u64' }),
    nativeToScVal(title),
    nativeToScVal(BigInt(rewardAmount), { type: 'i128' }),
  ]

  return callContract(
    QUEST_ID,
    'create_quest',
    args,
    adminAddress
  )
}

export async function getAllRewards(sourceAddress) {
  return readContract(QUEST_ID, 'get_all_rewards', [], sourceAddress)
}

export async function createReward(rewardId, title, cost, adminAddress) {
  const args = [
    nativeToScVal(rewardId, { type: 'u64' }),
    nativeToScVal(title),
    nativeToScVal(BigInt(cost), { type: 'i128' }),
  ]

  return callContract(QUEST_ID, 'create_reward', args, adminAddress)
}