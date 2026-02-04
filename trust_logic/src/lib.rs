#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

// 1. Define the Trust Profile
#[contracttype]
#[derive(Clone)]
pub struct TrustProfile {
    pub score: u32,
    pub last_pulse: u64,
}

#[contract]
pub struct TrustContract;

#[contractimpl]
impl TrustContract {
    
    // 2. The Heartbeat Function
    pub fn heartbeat(env: Env, pioneer: Address) {
        pioneer.require_auth();
        let now = env.ledger().timestamp();

        let mut profile: TrustProfile = env.storage().instance()
            .get(&pioneer)
            .unwrap_or(TrustProfile { 
                score: 50, 
                last_pulse: now 
            });

        profile.last_pulse = now;
        env.storage().instance().set(&pioneer, &profile);
    }

    // 3. The Vouch Function
    pub fn vouch(env: Env, voucher: Address, target: Address) {
        voucher.require_auth();

        // Check 1: Cannot vouch for yourself
        if voucher == target {
            return; // Just stop if they try to cheat
        }

        // Check 2: Voucher must have a profile
        // We use 'unwrap' here which is safer than 'expect' for the build
        let mut voucher_profile: TrustProfile = env.storage().instance()
            .get(&voucher)
            .unwrap(); 

        // Check 3: Load Target (or create new)
        let mut target_profile: TrustProfile = env.storage().instance()
            .get(&target)
            .unwrap_or(TrustProfile { 
                score: 50, 
                last_pulse: env.ledger().timestamp() 
            });

        // The Logic: Cost 2, Gift 2
        if voucher_profile.score >= 52 {
            voucher_profile.score -= 2;
            target_profile.score += 2;
            
            env.storage().instance().set(&voucher, &voucher_profile);
            env.storage().instance().set(&target, &target_profile);
        }
    }

    // 4. View Score
    pub fn get_score(env: Env, pioneer: Address) -> u32 {
        let profile: TrustProfile = env.storage().instance()
            .get(&pioneer)
            .unwrap_or(TrustProfile { score: 0, last_pulse: 0 });
        profile.score
    }
}