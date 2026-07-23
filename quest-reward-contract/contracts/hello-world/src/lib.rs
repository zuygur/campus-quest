#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Vec, vec, IntoVal};

#[derive(Clone)]
#[contracttype]
pub struct Quest {
    pub id: u64,
    pub title: String,
    pub reward_amount: i128,
}

#[derive(Clone)]
#[contracttype]
pub struct Reward {
    pub id: u64,
    pub title: String,
    pub cost: i128,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    TokenContract,
    Quest(u64),
    Reward(u64),
    Completed(u64, Address),
    QuestIds,
    RewardIds,
}

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    pub fn initialize(env: Env, admin: Address, token_contract: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::TokenContract, &token_contract);
    }

    pub fn create_quest(env: Env, quest_id: u64, title: String, reward_amount: i128) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("not initialized");
        admin.require_auth();

        let quest = Quest {
            id: quest_id,
            title,
            reward_amount,
        };
        env.storage()
            .persistent()
            .set(&DataKey::Quest(quest_id), &quest);

        let mut ids: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::QuestIds)
            .unwrap_or(vec![&env]);

        let mut exists = false;

        for id in ids.iter() {
            if id == quest_id {
                exists = true;
                break;
            }
        }

        if !exists {
            ids.push_back(quest_id);
        }

        env.storage()
            .persistent()
            .set(&DataKey::QuestIds, &ids);
    }

    pub fn complete_quest(env: Env, quest_id: u64, student: Address) {
        student.require_auth();

        let completed_key = DataKey::Completed(quest_id, student.clone());
        if env.storage().persistent().has(&completed_key) {
            panic!("quest already completed");
        }

        let quest: Quest = env
            .storage()
            .persistent()
            .get(&DataKey::Quest(quest_id))
            .expect("quest not found");

        let token_contract: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenContract)
            .expect("not initialized");

        let args: Vec<soroban_sdk::Val> = vec![
            &env,
            student.clone().into_val(&env),
            quest.reward_amount.into_val(&env),
        ];

        env.invoke_contract::<()>(
            &token_contract,
            &soroban_sdk::Symbol::new(&env, "mint"),
            args,
        );

        env.storage().persistent().set(&completed_key, &true);
    }

    pub fn get_quest(env: Env, quest_id: u64) -> Quest {
        env.storage()
            .persistent()
            .get(&DataKey::Quest(quest_id))
            .expect("quest not found")
    }

    pub fn has_completed(env: Env, quest_id: u64, student: Address) -> bool {
        env.storage()
            .persistent()
            .has(&DataKey::Completed(quest_id, student))
    }

    pub fn create_reward(env: Env, reward_id: u64, title: String, cost: i128) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("not initialized");
        admin.require_auth();

        let reward = Reward {
            id: reward_id,
            title,
            cost,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Reward(reward_id), &reward);

        let mut ids: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::RewardIds)
            .unwrap_or(vec![&env]);

        let mut exists = false;

        for id in ids.iter() {
            if id == reward_id {
                exists = true;
                break;
            }
        }

        if !exists {
            ids.push_back(reward_id);
        }

        env.storage()
            .persistent()
            .set(&DataKey::RewardIds, &ids);
    }

    pub fn edit_reward(env: Env, reward_id: u64, title: String, cost: i128) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("not initialized");
        admin.require_auth();

        let reward = Reward { id: reward_id, title, cost };
        env.storage()
            .persistent()
            .set(&DataKey::Reward(reward_id), &reward);
    }

    pub fn get_reward(env: Env, reward_id: u64) -> Reward {
        env.storage()
            .persistent()
            .get(&DataKey::Reward(reward_id))
            .expect("reward not found")
    }

    pub fn redeem_reward(env: Env, reward_id: u64, student: Address) {
        student.require_auth();

        let reward: Reward = env
            .storage()
            .persistent()
            .get(&DataKey::Reward(reward_id))
            .expect("reward not found");

        let token_contract: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenContract)
            .expect("not initialized");

        let args: Vec<soroban_sdk::Val> = vec![
            &env,
            student.clone().into_val(&env),
            reward.cost.into_val(&env),
        ];

        env.invoke_contract::<()>(
            &token_contract,
            &soroban_sdk::Symbol::new(&env, "burn"),
            args,
        );
    }  

    pub fn get_all_quests(env: Env) -> Vec<Quest> {
        let ids: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::QuestIds)
            .unwrap_or(vec![&env]);

        let mut quests: Vec<Quest> = vec![&env];

        for id in ids.iter() {
            let quest: Quest = env
                .storage()
                .persistent()
                .get(&DataKey::Quest(id))
                .unwrap();

            quests.push_back(quest);
        }

        quests
    }

    pub fn get_all_rewards(env: Env) -> Vec<Reward> {
        let ids: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::RewardIds)
            .unwrap_or(vec![&env]);

        let mut rewards: Vec<Reward> = vec![&env];

        for id in ids.iter() {
            let reward: Reward = env
                .storage()
                .persistent()
                .get(&DataKey::Reward(id))
                .unwrap();

            rewards.push_back(reward);
        }

        rewards
    }
}

mod test;
