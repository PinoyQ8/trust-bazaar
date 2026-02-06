
#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{
        testutils::{Address as _, Ledger, LedgerInfo},
        Address, Env,
    };

    fn create_contract(env: &Env) -> TrustContractClient<'static> {
        let contract_id = env.register_contract(None, TrustContract);
        TrustContractClient::new(env, &contract_id)
    }

    #[test]
    #[should_panic]
    fn vouch_from_non_existent_profile_panics() {
        let env = Env::default();
        let client = create_contract(&env);

        let voucher = Address::random(&env);
        let target = Address::random(&env);

        client.vouch(&voucher, &target);
    }
}
