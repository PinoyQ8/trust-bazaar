#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Env, Symbol, Address, String, Vec};

#[contract]
pub struct TrustContract;

const DAY_IN_SECONDS: u64 = 86400;

#[contracttype]
#[derive(Clone)]
pub struct Message {
    pub sender: Address,
    pub text: String,
}

#[contracttype]
#[derive(Clone)]
pub struct Escrow {
    pub buyer: Address,
    pub seller: Address,
    pub amount: u32,
    pub buyer_ok: bool,
    pub seller_ok: bool,
}

#[contracttype]
#[derive(Clone)]
pub struct MultiSigWallet {
    pub owners: Vec<Address>,
    pub threshold: u32,
    pub balance: u32,
}

#[contracttype]
#[derive(Clone)]
pub struct MultiSigTx {
    pub wallet_id: u32,
    pub to: Address,
    pub amount: u32,
    pub approvals: Vec<Address>,
    pub executed: bool,
}

#[contractimpl]
impl TrustContract {
    pub fn init(env: Env, admin: Address) {
        env.storage().instance().set(&symbol_short!("admin"), &admin);
    }

    pub fn get_admin(env: Env) -> Address {
        env.storage().instance().get(&symbol_short!("admin")).unwrap()
    }

    pub fn transfer_admin(env: Env, new_admin: Address) {
        let admin: Address = env.storage().instance().get(&symbol_short!("admin")).unwrap();
        admin.require_auth();
        
        env.storage().instance().set(&symbol_short!("admin"), &new_admin);
    }

    pub fn set_maintenance(env: Env, active: bool) {
        let admin: Address = env.storage().instance().get(&symbol_short!("admin")).unwrap();
        admin.require_auth();
        env.storage().instance().set(&symbol_short!("maint"), &active);
    }

    pub fn is_maintenance(env: Env) -> bool {
        env.storage().instance().get(&symbol_short!("maint")).unwrap_or(false)
    }

    // This function increments a "Trust Score" for an account
    pub fn add_trust(env: Env, user: Address) -> u32 {
        user.require_auth();
        let mut score: u32 = env.storage().instance().get(&user).unwrap_or(0);
        
        score += 1;
        
        env.storage().instance().set(&user, &score);
        score
    }

    pub fn vouch(env: Env, voucher: Address, target: Address) {
        if env.storage().instance().get(&symbol_short!("maint")).unwrap_or(false) {
            panic!("Maintenance mode active");
        }
        voucher.require_auth();
        
        let mut score: u32 = env.storage().instance().get(&target).unwrap_or(0);
        score += 1;
        env.storage().instance().set(&target, &score);
        env.events().publish((symbol_short!("vouch"), voucher), target);

        // Reward BZR Token
        let bzr_key = (symbol_short!("bzr"), voucher.clone());
        let mut balance: u32 = env.storage().instance().get(&bzr_key).unwrap_or(0);
        balance += 5;
        env.storage().instance().set(&bzr_key, &balance);
        env.events().publish((symbol_short!("mint"), voucher), 5);
    }

    pub fn transfer_bzr(env: Env, from: Address, to: Address, amount: u32) {
        if env.storage().instance().get(&symbol_short!("maint")).unwrap_or(false) {
            panic!("Maintenance mode active");
        }
        from.require_auth();
        let from_key = (symbol_short!("bzr"), from.clone());
        let to_key = (symbol_short!("bzr"), to.clone());

        let mut from_balance: u32 = env.storage().instance().get(&from_key).unwrap_or(0);
        if from_balance < amount {
            panic!("Insufficient BZR balance");
        }

        from_balance -= amount;
        env.storage().instance().set(&from_key, &from_balance);

        let mut to_balance: u32 = env.storage().instance().get(&to_key).unwrap_or(0);
        to_balance += amount;
        env.storage().instance().set(&to_key, &to_balance);
        
        env.events().publish((symbol_short!("transfer"), from, to), amount);
    }

    pub fn stake(env: Env, user: Address, referrer: Option<Address>) {
        if env.storage().instance().get(&symbol_short!("maint")).unwrap_or(false) {
            panic!("Maintenance mode active");
        }
        user.require_auth();
        // Logic to verify 20 Pi transfer would go here
        
        let mut score: u32 = env.storage().instance().get(&user).unwrap_or(0);
        score += 10; // +10 Trust Score for bonding
        env.storage().instance().set(&user, &score);
        
        let bond_key = (user, symbol_short!("bonded"));
        let timestamp = env.ledger().timestamp();
        env.storage().instance().set(&bond_key, &timestamp);

        if let Some(ref_addr) = referrer {
            // Reward referrer 10 BZR
            let bzr_key = (symbol_short!("bzr"), ref_addr.clone());
            let mut balance: u32 = env.storage().instance().get(&bzr_key).unwrap_or(0);
            balance += 10;
            env.storage().instance().set(&bzr_key, &balance);
            env.events().publish((symbol_short!("referral"), ref_addr), 10);
        }
    }

    pub fn withdraw(env: Env, user: Address) {
        user.require_auth();
        let bond_key = (user.clone(), symbol_short!("bonded"));
        
        if !env.storage().instance().has(&bond_key) {
            panic!("User is not bonded");
        }

        let bond_time: u64 = env.storage().instance().get(&bond_key).unwrap();
        if env.ledger().timestamp() < bond_time + (30 * DAY_IN_SECONDS) {
             panic!("Bond is still locked (30 days)");
        }

        env.storage().instance().remove(&bond_key);
        
        let mut score: u32 = env.storage().instance().get(&user).unwrap_or(0);
        if score >= 10 { score -= 10; } else { score = 0; }
        env.storage().instance().set(&user, &score);
    }

    pub fn force_unbond(env: Env, user: Address) {
        let admin: Address = env.storage().instance().get(&symbol_short!("admin")).unwrap();
        admin.require_auth();
        
        let bond_key = (user.clone(), symbol_short!("bonded"));
        if env.storage().instance().has(&bond_key) {
            env.storage().instance().remove(&bond_key);
            
            let mut score: u32 = env.storage().instance().get(&user).unwrap_or(0);
            if score >= 10 { score -= 10; } else { score = 0; }
            env.storage().instance().set(&user, &score);
        }
    }

    pub fn get_trust(env: Env, user: Address) -> u32 {
        env.storage().instance().get(&user).unwrap_or(0)
    }

    pub fn get_balance(env: Env, user: Address) -> u32 {
        let bzr_key = (symbol_short!("bzr"), user);
        env.storage().instance().get(&bzr_key).unwrap_or(0)
    }

    pub fn buy_badge(env: Env, user: Address, badge: Symbol) {
        if env.storage().instance().get(&symbol_short!("maint")).unwrap_or(false) {
            panic!("Maintenance mode active");
        }
        user.require_auth();
        let cost = 50; // Fixed cost for now
        
        let bzr_key = (symbol_short!("bzr"), user.clone());
        let mut balance: u32 = env.storage().instance().get(&bzr_key).unwrap_or(0);
        
        if balance < cost {
            panic!("Insufficient BZR for badge");
        }
        
        balance -= cost;
        env.storage().instance().set(&bzr_key, &balance);
        
        // Store badge ownership
        let badge_key = (symbol_short!("badge"), user.clone(), badge.clone());
        env.storage().instance().set(&badge_key, &true);
        
        env.events().publish((symbol_short!("buy"), user, badge), cost);
    }

    pub fn has_badge(env: Env, user: Address, badge: Symbol) -> bool {
        let badge_key = (symbol_short!("badge"), user, badge);
        env.storage().instance().get(&badge_key).unwrap_or(false)
    }

    pub fn deposit_crowdfund(env: Env, user: Address, amount: u32) {
        if env.storage().instance().get(&symbol_short!("maint")).unwrap_or(false) {
            panic!("Maintenance mode active");
        }
        user.require_auth();
        let bzr_key = (symbol_short!("bzr"), user.clone());
        let mut balance: u32 = env.storage().instance().get(&bzr_key).unwrap_or(0);
        
        if balance < amount {
            panic!("Insufficient BZR");
        }
        
        balance -= amount;
        env.storage().instance().set(&bzr_key, &balance);
        
        let fund_key = symbol_short!("fund");
        let mut fund: u32 = env.storage().instance().get(&fund_key).unwrap_or(0);
        fund += amount;
        env.storage().instance().set(&fund_key, &fund);
        
        env.events().publish((symbol_short!("fund"), user), amount);
    }

    pub fn get_crowdfund_balance(env: Env) -> u32 {
        env.storage().instance().get(&symbol_short!("fund")).unwrap_or(0)
    }

    pub fn vote(env: Env, user: Address, proposal_id: u32, in_favor: bool) {
        if env.storage().instance().get(&symbol_short!("maint")).unwrap_or(false) {
            panic!("Maintenance mode active");
        }
        user.require_auth();
        
        let vote_key = (symbol_short!("voted"), proposal_id, user.clone());
        if env.storage().instance().has(&vote_key) {
            panic!("Already voted");
        }
        
        let bzr_key = (symbol_short!("bzr"), user.clone());
        let balance: u32 = env.storage().instance().get(&bzr_key).unwrap_or(0);
        
        if balance == 0 {
            panic!("No BZR to vote");
        }

        let tally_key = if in_favor { (symbol_short!("votes_y"), proposal_id) } else { (symbol_short!("votes_n"), proposal_id) };
        let mut tally: u32 = env.storage().instance().get(&tally_key).unwrap_or(0);
        tally += balance;
        env.storage().instance().set(&tally_key, &tally);
        
        env.storage().instance().set(&vote_key, &true);
        env.events().publish((symbol_short!("vote"), user, proposal_id), balance);
    }

    pub fn get_proposal_stats(env: Env, proposal_id: u32) -> (u32, u32) {
        let yes: u32 = env.storage().instance().get(&(symbol_short!("votes_y"), proposal_id)).unwrap_or(0);
        let no: u32 = env.storage().instance().get(&(symbol_short!("votes_n"), proposal_id)).unwrap_or(0);
        (yes, no)
    }

    pub fn create_proposal(env: Env, user: Address) -> u32 {
        if env.storage().instance().get(&symbol_short!("maint")).unwrap_or(false) {
            panic!("Maintenance mode active");
        }
        user.require_auth();
        let cost = 100;
        let bzr_key = (symbol_short!("bzr"), user.clone());
        let mut balance: u32 = env.storage().instance().get(&bzr_key).unwrap_or(0);
        
        if balance < cost {
            panic!("Insufficient BZR for proposal");
        }
        
        balance -= cost;
        env.storage().instance().set(&bzr_key, &balance);

        let count_key = symbol_short!("prop_c");
        let mut count: u32 = env.storage().instance().get(&count_key).unwrap_or(0);
        count += 1;
        env.storage().instance().set(&count_key, &count);

        env.events().publish((symbol_short!("proposal"), user), count);
        count
    }

    pub fn raise_dispute(env: Env, accuser: Address, target: Address) {
        if env.storage().instance().get(&symbol_short!("maint")).unwrap_or(false) {
            panic!("Maintenance mode active");
        }
        accuser.require_auth();
        let dispute_key = (target.clone(), symbol_short!("disputed"));
        env.storage().instance().set(&dispute_key, &true);
        
        env.events().publish((symbol_short!("dispute"), accuser), target);
    }

    pub fn is_disputed(env: Env, user: Address) -> bool {
        let dispute_key = (user, symbol_short!("disputed"));
        env.storage().instance().get(&dispute_key).unwrap_or(false)
    }

    pub fn resolve_dispute(env: Env, target: Address) {
        let admin: Address = env.storage().instance().get(&symbol_short!("admin")).unwrap();
        admin.require_auth();

        let dispute_key = (target.clone(), symbol_short!("disputed"));
        env.storage().instance().remove(&dispute_key);
        
        env.events().publish((symbol_short!("resolve"), target), 0);
    }

    pub fn set_nickname(env: Env, user: Address, nickname: Symbol) {
        if env.storage().instance().get(&symbol_short!("maint")).unwrap_or(false) {
            panic!("Maintenance mode active");
        }
        user.require_auth();
        let key = (symbol_short!("nick"), user.clone());
        env.storage().instance().set(&key, &nickname);
        
        let lookup_key = (symbol_short!("n_lookup"), nickname);
        env.storage().instance().set(&lookup_key, &user);
    }

    pub fn get_address_by_nickname(env: Env, nickname: Symbol) -> Option<Address> {
        let lookup_key = (symbol_short!("n_lookup"), nickname);
        env.storage().instance().get(&lookup_key)
    }

    pub fn get_nickname(env: Env, user: Address) -> Symbol {
        let key = (symbol_short!("nick"), user);
        env.storage().instance().get(&key).unwrap_or(symbol_short!("User"))
    }

    pub fn get_bond_time(env: Env, user: Address) -> u64 {
        let bond_key = (user, symbol_short!("bonded"));
        env.storage().instance().get(&bond_key).unwrap_or(0)
    }

    pub fn is_bonded(env: Env, user: Address) -> bool {
        let bond_key = (user, symbol_short!("bonded"));
        env.storage().instance().has(&bond_key)
    }

    pub fn decay(env: Env, user: Address) {
        let admin: Address = env.storage().instance().get(&symbol_short!("admin")).unwrap();
        admin.require_auth();
        
        let mut score: u32 = env.storage().instance().get(&user).unwrap_or(0);
        if score > 0 {
            score -= 1;
            env.storage().instance().set(&user, &score);
            env.events().publish((symbol_short!("decay"), user), score);
        }
    }

    // --- CHAT SYSTEM ---
    pub fn send_message(env: Env, from: Address, to: Address, text: String) {
        if env.storage().instance().get(&symbol_short!("maint")).unwrap_or(false) {
            panic!("Maintenance mode active");
        }
        from.require_auth();
        let key = (symbol_short!("inbox"), to.clone());
        let mut messages: Vec<Message> = env.storage().instance().get(&key).unwrap_or(Vec::new(&env));
        messages.push_back(Message { sender: from, text });
        env.storage().instance().set(&key, &messages);
    }

    pub fn get_messages(env: Env, user: Address) -> Vec<Message> {
        let key = (symbol_short!("inbox"), user);
        env.storage().instance().get(&key).unwrap_or(Vec::new(&env))
    }

    // --- ESCROW SYSTEM ---
    pub fn create_escrow(env: Env, buyer: Address, seller: Address, amount: u32) -> u32 {
        if env.storage().instance().get(&symbol_short!("maint")).unwrap_or(false) {
            panic!("Maintenance mode active");
        }
        buyer.require_auth();
        
        let bzr_key = (symbol_short!("bzr"), buyer.clone());
        let mut balance: u32 = env.storage().instance().get(&bzr_key).unwrap_or(0);
        if balance < amount {
            panic!("Insufficient BZR for escrow");
        }
        balance -= amount;
        env.storage().instance().set(&bzr_key, &balance);

        let id_key = symbol_short!("esc_id");
        let id: u32 = env.storage().instance().get(&id_key).unwrap_or(0) + 1;
        env.storage().instance().set(&id_key, &id);

        let escrow = Escrow { buyer: buyer.clone(), seller: seller.clone(), amount, buyer_ok: false, seller_ok: false };
        env.storage().instance().set(&(symbol_short!("escrow"), id), &escrow);
        
        env.events().publish((symbol_short!("escrow"), buyer, seller), id);
        id
    }

    pub fn approve_escrow(env: Env, escrow_id: u32, caller: Address) {
        caller.require_auth();
        let key = (symbol_short!("escrow"), escrow_id);
        let mut escrow: Escrow = env.storage().instance().get(&key).unwrap();

        if caller == escrow.buyer { escrow.buyer_ok = true; } 
        else if caller == escrow.seller { escrow.seller_ok = true; } 
        else { panic!("Not a party to this escrow"); }

        if escrow.buyer_ok && escrow.seller_ok {
            let seller_key = (symbol_short!("bzr"), escrow.seller.clone());
            let mut bal: u32 = env.storage().instance().get(&seller_key).unwrap_or(0);
            env.storage().instance().set(&seller_key, &(bal + escrow.amount));
            env.storage().instance().remove(&key);
            env.events().publish((symbol_short!("release"), escrow_id), escrow.amount);
        } else {
            env.storage().instance().set(&key, &escrow);
        }
    }

    // --- SUBSCRIPTION SYSTEM ---
    pub fn subscribe(env: Env, user: Address) {
        if env.storage().instance().get(&symbol_short!("maint")).unwrap_or(false) {
            panic!("Maintenance mode active");
        }
        user.require_auth();
        let cost = 50;
        let bzr_key = (symbol_short!("bzr"), user.clone());
        let mut balance: u32 = env.storage().instance().get(&bzr_key).unwrap_or(0);
        
        if balance < cost {
            panic!("Insufficient BZR for subscription");
        }
        
        balance -= cost;
        env.storage().instance().set(&bzr_key, &balance);
        
        let sub_key = (symbol_short!("sub"), user.clone());
        let current_expiry: u64 = env.storage().instance().get(&sub_key).unwrap_or(0);
        let now = env.ledger().timestamp();
        
        let start_time = if current_expiry > now { current_expiry } else { now };
        let new_expiry = start_time + (30 * DAY_IN_SECONDS);
        
        env.storage().instance().set(&sub_key, &new_expiry);
        env.events().publish((symbol_short!("sub"), user), new_expiry);
    }

    pub fn is_subscribed(env: Env, user: Address) -> bool {
        let sub_key = (symbol_short!("sub"), user);
        let expiry: u64 = env.storage().instance().get(&sub_key).unwrap_or(0);
        expiry > env.ledger().timestamp()
    }

    // --- MULTI-SIG WALLET ---
    pub fn create_wallet(env: Env, creator: Address, owners: Vec<Address>, threshold: u32) -> u32 {
        creator.require_auth();
        if threshold == 0 || threshold > owners.len() { panic!("Invalid threshold"); }
        
        let id_key = symbol_short!("mw_id");
        let id: u32 = env.storage().instance().get(&id_key).unwrap_or(0) + 1;
        env.storage().instance().set(&id_key, &id);

        let wallet = MultiSigWallet { owners, threshold, balance: 0 };
        env.storage().instance().set(&(symbol_short!("mw"), id), &wallet);
        id
    }

    pub fn deposit_wallet(env: Env, user: Address, wallet_id: u32, amount: u32) {
        user.require_auth();
        let bzr_key = (symbol_short!("bzr"), user.clone());
        let mut user_bal: u32 = env.storage().instance().get(&bzr_key).unwrap_or(0);
        if user_bal < amount { panic!("Insufficient BZR"); }
        
        user_bal -= amount;
        env.storage().instance().set(&bzr_key, &user_bal);

        let w_key = (symbol_short!("mw"), wallet_id);
        let mut wallet: MultiSigWallet = env.storage().instance().get(&w_key).unwrap();
        wallet.balance += amount;
        env.storage().instance().set(&w_key, &wallet);
    }

    pub fn propose_tx(env: Env, user: Address, wallet_id: u32, to: Address, amount: u32) -> u32 {
        user.require_auth();
        let w_key = (symbol_short!("mw"), wallet_id);
        let wallet: MultiSigWallet = env.storage().instance().get(&w_key).unwrap();
        if !wallet.owners.contains(&user) { panic!("Not an owner"); }

        let tx_id_key = symbol_short!("mtx_id");
        let tx_id: u32 = env.storage().instance().get(&tx_id_key).unwrap_or(0) + 1;
        env.storage().instance().set(&tx_id_key, &tx_id);

        let mut approvals = Vec::new(&env);
        approvals.push_back(user.clone());

        let tx = MultiSigTx { wallet_id, to, amount, approvals, executed: false };
        env.storage().instance().set(&(symbol_short!("mtx"), tx_id), &tx);
        
        // If threshold is 1, execute immediately (logic handled in approve_tx would be duplicated, so we call approve logic essentially)
        if wallet.threshold == 1 {
             Self::approve_tx(env, user, tx_id);
        }
        tx_id
    }

    pub fn approve_tx(env: Env, user: Address, tx_id: u32) {
        user.require_auth();
        let tx_key = (symbol_short!("mtx"), tx_id);
        let mut tx: MultiSigTx = env.storage().instance().get(&tx_key).unwrap();
        if tx.executed { panic!("Already executed"); }

        let w_key = (symbol_short!("mw"), tx.wallet_id);
        let mut wallet: MultiSigWallet = env.storage().instance().get(&w_key).unwrap();
        
        if !wallet.owners.contains(&user) { panic!("Not an owner"); }
        
        // Add approval if not present
        if !tx.approvals.contains(&user) {
            tx.approvals.push_back(user);
        }

        if tx.approvals.len() >= wallet.threshold {
            if wallet.balance < tx.amount { panic!("Insufficient wallet balance"); }
            wallet.balance -= tx.amount;
            env.storage().instance().set(&w_key, &wallet);

            let to_key = (symbol_short!("bzr"), tx.to.clone());
            let mut to_bal: u32 = env.storage().instance().get(&to_key).unwrap_or(0);
            to_bal += tx.amount;
            env.storage().instance().set(&to_key, &to_bal);

            tx.executed = true;
            env.events().publish((symbol_short!("multisig"), tx.wallet_id), tx.amount);
        }
        env.storage().instance().set(&tx_key, &tx);
    }

    // --- LOTTERY SYSTEM ---
    pub fn buy_ticket(env: Env, user: Address) {
        if env.storage().instance().get(&symbol_short!("maint")).unwrap_or(false) {
            panic!("Maintenance mode active");
        }
        user.require_auth();
        let cost = 10;
        let bzr_key = (symbol_short!("bzr"), user.clone());
        let mut balance: u32 = env.storage().instance().get(&bzr_key).unwrap_or(0);
        
        if balance < cost {
            panic!("Insufficient BZR for ticket");
        }
        
        balance -= cost;
        env.storage().instance().set(&bzr_key, &balance);
        
        let lotto_key = symbol_short!("lotto");
        let mut pool: Vec<Address> = env.storage().instance().get(&lotto_key).unwrap_or(Vec::new(&env));
        pool.push_back(user.clone());
        env.storage().instance().set(&lotto_key, &pool);
        
        env.events().publish((symbol_short!("lotto_buy"), user), pool.len());
    }

    pub fn run_lottery(env: Env) {
        let admin: Address = env.storage().instance().get(&symbol_short!("admin")).unwrap();
        admin.require_auth();
        
        let lotto_key = symbol_short!("lotto");
        let pool: Vec<Address> = env.storage().instance().get(&lotto_key).unwrap_or(Vec::new(&env));
        
        if pool.is_empty() {
            panic!("No participants");
        }
        
        let winner_idx = env.prng().gen_range(0..pool.len());
        let winner = pool.get(winner_idx).unwrap();
        let pot = pool.len() * 10;
        
        let bzr_key = (symbol_short!("bzr"), winner.clone());
        let mut balance: u32 = env.storage().instance().get(&bzr_key).unwrap_or(0);
        balance += pot;
        env.storage().instance().set(&bzr_key, &balance);
        
        env.storage().instance().remove(&lotto_key);
        env.events().publish((symbol_short!("lotto_win"), winner), pot);
    }
    
    pub fn get_lottery_info(env: Env) -> u32 {
        let lotto_key = symbol_short!("lotto");
        let pool: Vec<Address> = env.storage().instance().get(&lotto_key).unwrap_or(Vec::new(&env));
        pool.len()
    }
}

mod test;