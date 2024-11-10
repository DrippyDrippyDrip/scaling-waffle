import React from 'react';
import { X } from 'lucide-react';

interface DocsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DocsPopup({ isOpen, onClose }: DocsPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-4xl mx-auto bg-black border-2 border-cyan-400">
          <div className="border-b-2 border-cyan-400 p-4 flex justify-between items-center">
            <h1 className="text-xl text-cyan-400">{'>'}_DEATH Protocol Technical Documentation</h1>
            <button onClick={onClose} className="text-cyan-400 hover:text-cyan-300">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-8 text-cyan-400">
            <section>
              <h2 className="text-xl mb-4">{'>'}_Protocol Architecture Overview</h2>
              <div className="space-y-2 text-sm">
                <p>{'>'}_The DEATH Protocol implements a sophisticated multi-program architecture on the Solana blockchain, utilizing several interconnected programs to manage token economics, staking mechanics, and governance:</p>
                <ul className="ml-4 space-y-2">
                  <li>{'>'}_Core Programs:
                    <ul className="ml-4 space-y-1">
                      <li>- Token Program (Custom SPL implementation)</li>
                      <li>- Staking Program (PDA-based state management)</li>
                      <li>- Treasury Program (Multi-signature control)</li>
                      <li>- Governance Program (DAO mechanisms)</li>
                    </ul>
                  </li>
                  <li>{'>'}_Account Structure:
                    <ul className="ml-4 space-y-1">
                      <li>- Program Derived Addresses (PDAs) for deterministic account generation</li>
                      <li>- Segregated state accounts for atomic operations</li>
                      <li>- Look-up tables for efficient account resolution</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl mb-4">{'>'}_Token Implementation Details</h2>
              <div className="space-y-2 text-sm">
                <p>{'>'}_Token Contract Specifications:</p>
                <ul className="ml-4 space-y-2">
                  <li>- SPL Token Program Base: Extended implementation with custom minting logic</li>
                  <li>- Decimals: 9 (standard SPL configuration)</li>
                  <li>- Authority: Multi-signature governance control</li>
                  <li>- Minting Schedule: Dynamic based on protocol parameters</li>
                </ul>
                <p>{'>'}_Security Features:</p>
                <ul className="ml-4 space-y-2">
                  <li>- Time-locked transfers for protocol-owned accounts</li>
                  <li>- Rate-limited minting with cooldown periods</li>
                  <li>- Overflow protection using checked math operations</li>
                  <li>- Emergency freeze capabilities for governance</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl mb-4">{'>'}_Staking Mechanism Implementation</h2>
              <div className="space-y-2 text-sm">
                <p>{'>'}_Core Staking Logic:</p>
                <ul className="ml-4 space-y-2">
                  <li>- State Management:
                    <ul className="ml-4 space-y-1">
                      <li>• User stake tracking via PDA-derived accounts</li>
                      <li>• Global state for protocol parameters</li>
                      <li>• Reward distribution tracking</li>
                    </ul>
                  </li>
                  <li>- Reward Calculation:
                    <ul className="ml-4 space-y-1">
                      <li>• Time-weighted accumulation using slot tracking</li>
                      <li>• Tier-based multipliers with compound effects</li>
                      <li>• Dynamic APY adjustments based on total stake</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl mb-4">{'>'}_Advanced Protocol Features</h2>
              <div className="space-y-2 text-sm">
                <p>{'>'}_Dynamic APY System:</p>
                <ul className="ml-4 space-y-2">
                  <li>- Implementation:
                    <ul className="ml-4 space-y-1">
                      <li>• Chainlink VRF integration for randomization</li>
                      <li>• Market volatility tracking via oracle feeds</li>
                      <li>• Governance-controlled bounds and adjustment periods</li>
                    </ul>
                  </li>
                  <li>- Emergency Controls:
                    <ul className="ml-4 space-y-1">
                      <li>• Circuit breaker implementation</li>
                      <li>• Tiered authorization system</li>
                      <li>• Automated response triggers</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl mb-4">{'>'}_Treasury Management System</h2>
              <div className="space-y-2 text-sm">
                <p>{'>'}_Architecture:</p>
                <ul className="ml-4 space-y-2">
                  <li>- Multi-signature Implementation:
                    <ul className="ml-4 space-y-1">
                      <li>• M-of-N signature scheme using threshold cryptography</li>
                      <li>• Time-locked execution for major operations</li>
                      <li>• Proposal queuing system</li>
                    </ul>
                  </li>
                  <li>- Fund Management:
                    <ul className="ml-4 space-y-1">
                      <li>• Automated reward distribution</li>
                      <li>• Strategic reserve allocation</li>
                      <li>• Emergency fund segregation</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl mb-4">{'>'}_Integration Guidelines</h2>
              <div className="space-y-2 text-sm">
                <p>{'>'}_Smart Contract Interaction:</p>
                <ul className="ml-4 space-y-2">
                  <li>- Program Calls:
                    <ul className="ml-4 space-y-1">
                      <li>• CPI safety checks and guards</li>
                      <li>• Account validation procedures</li>
                      <li>• Error handling patterns</li>
                    </ul>
                  </li>
                  <li>- State Management:
                    <ul className="ml-4 space-y-1">
                      <li>• Account data serialization</li>
                      <li>• State transition validations</li>
                      <li>• Atomic operation patterns</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl mb-4">{'>'}_Security Considerations</h2>
              <div className="space-y-2 text-sm">
                <p>{'>'}_Security Measures:</p>
                <ul className="ml-4 space-y-2">
                  <li>- Access Control:
                    <ul className="ml-4 space-y-1">
                      <li>• Role-based permission system</li>
                      <li>• Signature verification procedures</li>
                      <li>• Program authority constraints</li>
                    </ul>
                  </li>
                  <li>- Attack Prevention:
                    <ul className="ml-4 space-y-1">
                      <li>• Reentrancy guards</li>
                      <li>• Integer overflow protection</li>
                      <li>• Flash loan attack mitigation</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl mb-4">{'>'}_Performance Optimization</h2>
              <div className="space-y-2 text-sm">
                <p>{'>'}_Optimization Strategies:</p>
                <ul className="ml-4 space-y-2">
                  <li>- Compute Unit Management:
                    <ul className="ml-4 space-y-1">
                      <li>• Instruction batching patterns</li>
                      <li>• Data packing optimization</li>
                      <li>• Memory allocation strategies</li>
                    </ul>
                  </li>
                  <li>- Transaction Efficiency:
                    <ul className="ml-4 space-y-1">
                      <li>• Parallel transaction processing</li>
                      <li>• Account prefetching</li>
                      <li>• State compression techniques</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}