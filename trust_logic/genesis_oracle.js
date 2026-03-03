// THE MASTER LEDGER: Static Export (No 'fs' to prevent S23/Browser crashes)
export const genesisRegistry = [
  { id: "G1", name: "Bazaar Prime", trust: 100, role: "Founder", location: "Global", utility: "Infrastructure" },
  { id: "G2", name: "Manila Hub", trust: 85, role: "Merchant", location: "Philippines", utility: "Rice Trading" },
  { id: "G3", name: "Kuwait Depot", trust: 90, role: "Merchant", location: "Kuwait", utility: "Logistics" }
];

export const getNetworkTrust = () => 98.3;
export const getBufferStatus = () => "45GB ACTIVE";