#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    Balance(Address),
}

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    pub fn set_admin(env: Env, new_admin: Address) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("not initialized");
        admin.require_auth();

        env.storage().instance().set(&DataKey::Admin, &new_admin);
    }

    pub fn mint(env: Env, to: Address, amount: i128) {
        let key = DataKey::Balance(to.clone());

        let current: i128 = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or(0);

        env.storage()
            .persistent()
            .set(&key, &(current + amount));
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();

        let from_key = DataKey::Balance(from.clone());
        let from_balance: i128 = env.storage().persistent().get(&from_key).unwrap_or(0);

        if from_balance < amount {
            panic!("insufficient balance");
        }

        env.storage()
            .persistent()
            .set(&from_key, &(from_balance - amount));

        let to_key = DataKey::Balance(to.clone());
        let to_balance: i128 = env.storage().persistent().get(&to_key).unwrap_or(0);
        env.storage().persistent().set(&to_key, &(to_balance + amount));
    }

    pub fn burn(env: Env, from: Address, amount: i128) {
        from.require_auth();

        let key = DataKey::Balance(from.clone());
        let current: i128 = env.storage().persistent().get(&key).unwrap_or(0);

        if current < amount {
            panic!("insufficient balance");
        }

        env.storage().persistent().set(&key, &(current - amount));
    }

    pub fn balance(env: Env, address: Address) -> i128 {
        let key = DataKey::Balance(address);
        env.storage().persistent().get(&key).unwrap_or(0)
    }
}
