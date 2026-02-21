// 🏛️ PROJECT BAZAAR | SMART CONTRACT v3.1 (Stabilized)
// Includes: Academy Trust Score, Legacy Vault, Medical Emergency, and Panic Protocol.

#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol, Vec};

// ============================================================
// 📦 DATA STRUCTURES
// ============================================================

#[contracttype]
#[derive(Clone)]
pub struct Merchant {
    pub trust_score: u32,
    pub bond_staked: bool,
    pub bzr_balance: i128,
    pub badges: Vec<Symbol>,
    pub is_disputed: bool,
    pub nickname: Symbol,
    pub messages: Vec<Message>,
}

#[contracttype]
#[derive(Clone)]
pub struct Message {
    pub sender: Address,
    pub text: String,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone)]
pub struct LegacyVault {
    pub heir: Option<Address>,
    pub last_heartbeat: u64,
    pub is_locked: bool,
    pub is_frozen: bool,
}

#[contracttype]
#[derive(Clone)]
pub struct MedicalEmergency {
    pub target_user: Address,
    pub votes_collected: u32,
    pub is_unlocked: bool,
}

#[contracttype]
pub enum DataKey {
    Merchant(Address),
    Vault(Address),
    Witnesses(Address),
    Emergency(Address),
    PanicVotes(Address),
}

// ============================================================
// ⚙️ THE CONTRACT
// ============================================================
#[contract]
pub struct TrustContract;

#[contractimpl]
impl TrustContract {

    // --- FEATURE 1: LEGACY VAULT ---

    pub fn create_vault(env: Env, user: Address, heir: Address) {
        user.require_auth();
        let vault = LegacyVault {
            heir: Some(heir),
            last_heartbeat: env.ledger().timestamp(),
            is_locked: true,
            is_frozen: false,
        };
        env.storage().persistent().set(&DataKey::Vault(user), &vault);
    }

    pub fn ping_heartbeat(env: Env, user: Address) {
        user.require_auth();
        let mut vault: LegacyVault = env.storage().persistent().get(&DataKey::Vault(user.clone())).expect("Vault not found");
        if vault.is_frozen {
            vault.is_frozen = false; 
        }
        vault.last_heartbeat = env.ledger().timestamp();
        env.storage().persistent().set(&DataKey::Vault(user), &vault);
    }

    pub fn claim_legacy(env: Env, target_user: Address) {
        let vault: LegacyVault = env.storage().persistent().get(&DataKey::Vault(target_user.clone())).expect("Vault not found");
        let heir = vault.heir.unwrap();
        heir.require_auth(); 

        let deadman_limit = 15_552_000; // 180 Days
        let time_elapsed = env.ledger().timestamp() - vault.last_heartbeat;

        if time_elapsed < deadman_limit {
            panic!("Owner is still alive");
        }
    }

    // --- FEATURE 2: SECURITY CIRCLE ---

    pub fn assign_witnesses(env: Env, user: Address, witnesses: Vec<Address>) {
        user.require_auth();
        if witnesses.len() > 5 { panic!("Max 5 witnesses"); }
        env.storage().persistent().set(&DataKey::Witnesses(user), &witnesses);
    }

    pub fn declare_emergency(env: Env, target_user: Address) {
        let key = DataKey::Emergency(target_user.clone());
        if env.storage().persistent().has(&key) { panic!("Emergency active"); }

        let emergency = MedicalEmergency {
            target_user: target_user,
            votes_collected: 0,
            is_unlocked: false,
        };
        env.storage().persistent().set(&key, &emergency);
    }

    pub fn witness_vote_medical(env: Env, witness: Address, target_user: Address) {
        witness.require_auth();
        let circle: Vec<Address> = env.storage().persistent().get(&DataKey::Witnesses(target_user.clone())).expect("No Circle");
        if !circle.contains(witness.clone()) { panic!("Not a witness"); }

        let key = DataKey::Emergency(target_user.clone());
        let mut emergency: MedicalEmergency = env.storage().persistent().get(&key).expect("No emergency");
        emergency.votes_collected += 1;
        if emergency.votes_collected >= 3 {
            emergency.is_unlocked = true; 
        }
        env.storage().persistent().set(&key, &emergency);
    }

    pub fn panic_button(env: Env, witness: Address, target_user: Address) {
        witness.require_auth();
        let circle: Vec<Address> = env.storage().persistent().get(&DataKey::Witnesses(target_user.clone())).expect("No Circle");
        if !circle.contains(witness.clone()) { panic!("Not a witness"); }

        let key = DataKey::PanicVotes(target_user.clone());
        let mut votes: u32 = env.storage().persistent().get(&key).unwrap_or(0);
        votes += 1;
        env.storage().persistent().set(&key, &votes);

        if votes >= 3 {
            let mut vault: LegacyVault = env.storage().persistent().get(&DataKey::Vault(target_user.clone())).expect("Vault not found");
            vault.is_frozen = true;
            let time_warp = 15_552_000 - 604_800; 
            vault.last_heartbeat = env.ledger().timestamp() - time_warp;
            env.storage().persistent().set(&DataKey::Vault(target_user), &vault);
        }
    }

    // --- FEATURE 3: MERCHANT TRUST ---

    pub fn stake(env: Env, user: Address) {
        user.require_auth();
        let mut merchant = env.storage().persistent().get(&DataKey::Merchant(user.clone())).unwrap_or(Merchant {
            trust_score: 0, bond_staked: false, bzr_balance: 0, badges: Vec::new(&env), 
            is_disputed: false, nickname: Symbol::new(&env, "User"), messages: Vec::new(&env)
        });
        if merchant.bond_staked { panic!("Already bonded"); }
        merchant.bond_staked = true;
        merchant.trust_score += 10;
        env.storage().persistent().set(&DataKey::Merchant(user), &merchant);
    }

    pub fn vouch(env: Env, voucher: Address, target: Address) {
        voucher.require_auth();
        // SAFE INITIALIZATION: No more "Target not found" traps
        let mut target_data = env.storage().persistent().get(&DataKey::Merchant(target.clone())).unwrap_or(Merchant {
            trust_score: 0, bond_staked: false, bzr_balance: 0, badges: Vec::new(&env), 
            is_disputed: false, nickname: Symbol::new(&env, "NewUser"), messages: Vec::new(&env)
        });

        if target_data.trust_score < 100 { target_data.trust_score += 1; }
        env.storage().persistent().set(&DataKey::Merchant(target), &target_data);
    }

    pub fn get_trust(env: Env, user: Address) -> u32 {
        let merchant = env.storage().persistent().get(&DataKey::Merchant(user)).unwrap_or(Merchant {
            trust_score: 0, bond_staked: false, bzr_balance: 0, badges: Vec::new(&env), 
            is_disputed: false, nickname: Symbol::new(&env, "User"), messages: Vec::new(&env)
        });
        merchant.trust_score
    }
}