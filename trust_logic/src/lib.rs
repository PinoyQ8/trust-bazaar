// 🏛️ BAZAAR E-NETWORK | TRUST LOGIC CORE v1.0
// This governs the 20 Pi Security Bond and Reputation math.

pub struct Merchant {
    pub trust_score: u32,
    pub bond_staked: bool,
    pub identity_hash: String,
}

impl Merchant {
    // Logic for the 20 Pi Bond Activation
    pub fn stake_bond(&mut self) {
        self.bond_staked = true;
        self.trust_score += 10;
    }

    // Logic for Transaction Fulfillment (Trust +5)
    pub fn fulfill_order(&mut self) {
        if self.trust_score <= 95 {
            self.trust_score += 5;
        }
    }

    // Logic for Reputation Decay
    pub fn decay_reputation(&mut self) {
        if self.trust_score >= 3 {
            self.trust_score -= 3;
        }
    }
}