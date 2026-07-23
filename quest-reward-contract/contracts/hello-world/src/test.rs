#![cfg(test)]

use super::*;
use soroban_sdk::{contract, contractimpl, testutils::Address as _, Env};

#[contract]
pub struct MockToken;

#[contractimpl]
impl MockToken {
    pub fn mint(env: Env, to: Address, amount: i128) {
        let key = (to, "balance");
        let current: i128 = env.storage().persistent().get(&key).unwrap_or(0);
        env.storage().persistent().set(&key, &(current + amount));
    }

    pub fn burn(env: Env, from: Address, amount: i128) {
        let key = (from, "balance");
        let current: i128 = env.storage().persistent().get(&key).unwrap_or(0);
        if current < amount {
            panic!("insufficient balance");
        }
        env.storage().persistent().set(&key, &(current - amount));
    }
}

fn setup(env: &Env) -> (ContractClient, Address) {
    let admin = Address::generate(env);
    let token_id = env.register(MockToken, ());

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(env, &contract_id);
    client.initialize(&admin, &token_id);

    (client, admin)
}

#[test]
fn test_create_and_complete_quest() {
    let env = Env::default();
    env.mock_all_auths();

    let (client, _admin) = setup(&env);
    let student = Address::generate(&env);

    client.create_quest(&1u64, &String::from_str(&env, "Attend Workshop"), &50i128);

    let quest = client.get_quest(&1u64);
    assert_eq!(quest.reward_amount, 50);

    client.complete_quest(&1u64, &student);

    assert!(client.has_completed(&1u64, &student));
}

#[test]
#[should_panic(expected = "quest already completed")]
fn test_cannot_complete_quest_twice() {
    let env = Env::default();
    env.mock_all_auths();

    let (client, _admin) = setup(&env);
    let student = Address::generate(&env);

    client.create_quest(&2u64, &String::from_str(&env, "Join Club"), &30i128);
    client.complete_quest(&2u64, &student);
    client.complete_quest(&2u64, &student);
}

#[test]
fn test_create_and_get_reward() {
    let env = Env::default();
    env.mock_all_auths();

    let (client, _admin) = setup(&env);

    client.create_reward(&1u64, &String::from_str(&env, "Free Coffee"), &20i128);

    let reward = client.get_reward(&1u64);
    assert_eq!(reward.cost, 20);
    assert_eq!(reward.title, String::from_str(&env, "Free Coffee"));
}