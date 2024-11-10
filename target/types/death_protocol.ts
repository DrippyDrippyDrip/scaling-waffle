export type DeathProtocol = {
  "version": "0.1.0",
  "name": "death_protocol",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "stakingState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasuryState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "governanceState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "config",
          "type": {
            "defined": "ProtocolConfig"
          }
        }
      ]
    },
    {
      "name": "stake",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "stakingState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userStakeInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "protocolTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "unstake",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "stakingState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userStakeInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "protocolTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "claimRewards",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "stakingState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userStakeInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "protocolTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createProposal",
      "accounts": [
        {
          "name": "author",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "governanceState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "proposal",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "proposalData",
          "type": {
            "defined": "ProposalData"
          }
        }
      ]
    },
    {
      "name": "vote",
      "accounts": [
        {
          "name": "voter",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "proposal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "governanceState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userStakeInfo",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "support",
          "type": "bool"
        }
      ]
    },
    {
      "name": "executeProposal",
      "accounts": [
        {
          "name": "executor",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "proposal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "governanceState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakingState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasuryState",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "proposal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proposalId",
            "type": "u64"
          },
          {
            "name": "author",
            "type": "publicKey"
          },
          {
            "name": "creationTime",
            "type": "i64"
          },
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "executed",
            "type": "bool"
          },
          {
            "name": "forVotes",
            "type": "u64"
          },
          {
            "name": "againstVotes",
            "type": "u64"
          },
          {
            "name": "voters",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "data",
            "type": {
              "defined": "ProposalData"
            }
          }
        ]
      }
    },
    {
      "name": "stakingState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "currentApy",
            "type": "u64"
          },
          {
            "name": "minStake",
            "type": "u64"
          },
          {
            "name": "maxStake",
            "type": "u64"
          },
          {
            "name": "emergencyCooldown",
            "type": "i64"
          },
          {
            "name": "paused",
            "type": "bool"
          },
          {
            "name": "totalStaked",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "userStakeInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "stakedAmount",
            "type": "u64"
          },
          {
            "name": "lastStakeTimestamp",
            "type": "i64"
          },
          {
            "name": "rewardsClaimed",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "treasuryState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "withdrawalLimit",
            "type": "u64"
          },
          {
            "name": "requiredSignatures",
            "type": "u8"
          },
          {
            "name": "totalBalance",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "withdrawalState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "requests",
            "type": {
              "vec": {
                "defined": "WithdrawalRequest"
              }
            }
          },
          {
            "name": "lastProcessedTime",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "governanceState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "currentApy",
            "type": "u64"
          },
          {
            "name": "votingPeriod",
            "type": "i64"
          },
          {
            "name": "requiredQuorum",
            "type": "u64"
          },
          {
            "name": "proposalCount",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "ProtocolConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "baseApy",
            "type": "u64"
          },
          {
            "name": "minStake",
            "type": "u64"
          },
          {
            "name": "maxStake",
            "type": "u64"
          },
          {
            "name": "emergencyCooldown",
            "type": "i64"
          },
          {
            "name": "withdrawalLimit",
            "type": "u64"
          },
          {
            "name": "votingPeriod",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "WithdrawalRequest",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "requestTime",
            "type": "i64"
          },
          {
            "name": "processed",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "ProposalData",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "UpdateApy",
            "fields": [
              {
                "name": "newApy",
                "type": "u64"
              }
            ]
          },
          {
            "name": "UpdateWithdrawalLimit",
            "fields": [
              {
                "name": "newLimit",
                "type": "u64"
              }
            ]
          },
          {
            "name": "UpdateVotingPeriod",
            "fields": [
              {
                "name": "newPeriod",
                "type": "i64"
              }
            ]
          },
          {
            "name": "UpdateQuorum",
            "fields": [
              {
                "name": "newQuorum",
                "type": "u64"
              }
            ]
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidStakeAmount",
      "msg": "Invalid stake amount"
    },
    {
      "code": 6001,
      "name": "ProtocolPaused",
      "msg": "Protocol is paused"
    },
    {
      "code": 6002,
      "name": "Overflow",
      "msg": "Arithmetic overflow"
    },
    {
      "code": 6003,
      "name": "InvalidUnstakeAmount",
      "msg": "Invalid unstake amount"
    },
    {
      "code": 6004,
      "name": "BondNotMature",
      "msg": "Bond not mature"
    },
    {
      "code": 6005,
      "name": "BondAlreadyClaimed",
      "msg": "Bond already claimed"
    },
    {
      "code": 6006,
      "name": "VotingPeriodEnded",
      "msg": "Voting period has ended"
    },
    {
      "code": 6007,
      "name": "AlreadyVoted",
      "msg": "User has already voted"
    },
    {
      "code": 6008,
      "name": "InsufficientStake",
      "msg": "Insufficient stake for voting"
    },
    {
      "code": 6009,
      "name": "InvalidWithdrawalAmount",
      "msg": "Invalid withdrawal amount"
    },
    {
      "code": 6010,
      "name": "ProposalNotPassed",
      "msg": "Proposal has not passed"
    },
    {
      "code": 6011,
      "name": "VotingPeriodActive",
      "msg": "Voting period still active"
    },
    {
      "code": 6012,
      "name": "InvalidProposalType",
      "msg": "Invalid proposal type"
    },
    {
      "code": 6013,
      "name": "NoRewardsAvailable",
      "msg": "No rewards available to claim"
    }
  ]
};

export const IDL: DeathProtocol = {
  "version": "0.1.0",
  "name": "death_protocol",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "stakingState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasuryState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "governanceState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "config",
          "type": {
            "defined": "ProtocolConfig"
          }
        }
      ]
    },
    {
      "name": "stake",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "stakingState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userStakeInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "protocolTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "unstake",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "stakingState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userStakeInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "protocolTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "claimRewards",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "stakingState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userStakeInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "protocolTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createProposal",
      "accounts": [
        {
          "name": "author",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "governanceState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "proposal",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "proposalData",
          "type": {
            "defined": "ProposalData"
          }
        }
      ]
    },
    {
      "name": "vote",
      "accounts": [
        {
          "name": "voter",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "proposal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "governanceState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userStakeInfo",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "support",
          "type": "bool"
        }
      ]
    },
    {
      "name": "executeProposal",
      "accounts": [
        {
          "name": "executor",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "proposal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "governanceState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakingState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasuryState",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "proposal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proposalId",
            "type": "u64"
          },
          {
            "name": "author",
            "type": "publicKey"
          },
          {
            "name": "creationTime",
            "type": "i64"
          },
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "executed",
            "type": "bool"
          },
          {
            "name": "forVotes",
            "type": "u64"
          },
          {
            "name": "againstVotes",
            "type": "u64"
          },
          {
            "name": "voters",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "data",
            "type": {
              "defined": "ProposalData"
            }
          }
        ]
      }
    },
    {
      "name": "stakingState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "currentApy",
            "type": "u64"
          },
          {
            "name": "minStake",
            "type": "u64"
          },
          {
            "name": "maxStake",
            "type": "u64"
          },
          {
            "name": "emergencyCooldown",
            "type": "i64"
          },
          {
            "name": "paused",
            "type": "bool"
          },
          {
            "name": "totalStaked",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "userStakeInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "stakedAmount",
            "type": "u64"
          },
          {
            "name": "lastStakeTimestamp",
            "type": "i64"
          },
          {
            "name": "rewardsClaimed",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "treasuryState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "withdrawalLimit",
            "type": "u64"
          },
          {
            "name": "requiredSignatures",
            "type": "u8"
          },
          {
            "name": "totalBalance",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "withdrawalState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "requests",
            "type": {
              "vec": {
                "defined": "WithdrawalRequest"
              }
            }
          },
          {
            "name": "lastProcessedTime",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "governanceState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "currentApy",
            "type": "u64"
          },
          {
            "name": "votingPeriod",
            "type": "i64"
          },
          {
            "name": "requiredQuorum",
            "type": "u64"
          },
          {
            "name": "proposalCount",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "ProtocolConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "baseApy",
            "type": "u64"
          },
          {
            "name": "minStake",
            "type": "u64"
          },
          {
            "name": "maxStake",
            "type": "u64"
          },
          {
            "name": "emergencyCooldown",
            "type": "i64"
          },
          {
            "name": "withdrawalLimit",
            "type": "u64"
          },
          {
            "name": "votingPeriod",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "WithdrawalRequest",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "requestTime",
            "type": "i64"
          },
          {
            "name": "processed",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "ProposalData",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "UpdateApy",
            "fields": [
              {
                "name": "newApy",
                "type": "u64"
              }
            ]
          },
          {
            "name": "UpdateWithdrawalLimit",
            "fields": [
              {
                "name": "newLimit",
                "type": "u64"
              }
            ]
          },
          {
            "name": "UpdateVotingPeriod",
            "fields": [
              {
                "name": "newPeriod",
                "type": "i64"
              }
            ]
          },
          {
            "name": "UpdateQuorum",
            "fields": [
              {
                "name": "newQuorum",
                "type": "u64"
              }
            ]
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidStakeAmount",
      "msg": "Invalid stake amount"
    },
    {
      "code": 6001,
      "name": "ProtocolPaused",
      "msg": "Protocol is paused"
    },
    {
      "code": 6002,
      "name": "Overflow",
      "msg": "Arithmetic overflow"
    },
    {
      "code": 6003,
      "name": "InvalidUnstakeAmount",
      "msg": "Invalid unstake amount"
    },
    {
      "code": 6004,
      "name": "BondNotMature",
      "msg": "Bond not mature"
    },
    {
      "code": 6005,
      "name": "BondAlreadyClaimed",
      "msg": "Bond already claimed"
    },
    {
      "code": 6006,
      "name": "VotingPeriodEnded",
      "msg": "Voting period has ended"
    },
    {
      "code": 6007,
      "name": "AlreadyVoted",
      "msg": "User has already voted"
    },
    {
      "code": 6008,
      "name": "InsufficientStake",
      "msg": "Insufficient stake for voting"
    },
    {
      "code": 6009,
      "name": "InvalidWithdrawalAmount",
      "msg": "Invalid withdrawal amount"
    },
    {
      "code": 6010,
      "name": "ProposalNotPassed",
      "msg": "Proposal has not passed"
    },
    {
      "code": 6011,
      "name": "VotingPeriodActive",
      "msg": "Voting period still active"
    },
    {
      "code": 6012,
      "name": "InvalidProposalType",
      "msg": "Invalid proposal type"
    },
    {
      "code": 6013,
      "name": "NoRewardsAvailable",
      "msg": "No rewards available to claim"
    }
  ]
};
