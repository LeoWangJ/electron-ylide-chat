import { EVMNetwork } from './types';

export interface IEthereumContractLink {
	address: string;
	fromBlock?: number;
	toBlock?: number;
}

export const EVM_CONTRACTS: Record<
	EVMNetwork,
	{
		mailer: IEthereumContractLink;
		registry: IEthereumContractLink;
		legacyMailers?: IEthereumContractLink[];
		legacyRegistries?: IEthereumContractLink[];
	}
> = {
	[EVMNetwork.LOCAL_HARDHAT]: {
		mailer: { address: '0x5FbDB2315678afecb367f032d93F642f64180aa3' },
		registry: { address: '0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82' },
	},
	[EVMNetwork.ETHEREUM]: {
		mailer: { address: '0xec77e30c68ac3b496f0a713e9a9e6ad0d0a0a93f', fromBlock: 15372374 },
		registry: { address: '0xf1564eB529cDe03250943f946Ea307301aa19235', fromBlock: 15372319 },
	},
	[EVMNetwork.BNBCHAIN]: {
		mailer: { address: '0xa445a576d0f6fa6baa23f805da804c6ff1c0f886', fromBlock: 20582134 },
		registry: { address: '0x9702e74Bd5Fc0aA5586cbBF236dfC72ee1C93579', fromBlock: 20582146 },
	},
	[EVMNetwork.POLYGON]: {
		mailer: { address: '0x28D9Bb1AEd64C115dD70e886C546ee0420623BC2', fromBlock: 32039400 },
		registry: { address: '0xCdb5D5E87E29fB5Fccff8fF5c2A9827705C0A260', fromBlock: 32039400 },
	},
	[EVMNetwork.AVALANCHE]: {
		mailer: { address: '0x28D9Bb1AEd64C115dD70e886C546ee0420623BC2', fromBlock: 18851746 },
		registry: { address: '0xDFEe2128E3D441078dC286171F27F612B35fD7bD', fromBlock: 18851846 },
	},
	[EVMNetwork.OPTIMISM]: {
		mailer: { address: '0x28d9bb1aed64c115dd70e886c546ee0420623bc2', fromBlock: 19796019 },
		registry: { address: '0xDFEe2128E3D441078dC286171F27F612B35fD7bD', fromBlock: 19796104 },
	},
	[EVMNetwork.ARBITRUM]: {
		mailer: { address: '0x79935f5d685452c361058c0fe5a50b803aa214a1', fromBlock: 20707340 },
		registry: { address: '0xDFEe2128E3D441078dC286171F27F612B35fD7bD', fromBlock: 20707262 },
	},

	// [EVMNetwork.CRONOS]: { mailer: { address: '' }, registry: { address: '' } },
	[EVMNetwork.FANTOM]: {
		mailer: { address: '0x79935f5d685452c361058c0fe5a50b803aa214a1', fromBlock: 48407617 },
		registry: { address: '0x28d9bb1aed64c115dd70e886c546ee0420623bc2', fromBlock: 48407617 },
	},
	[EVMNetwork.KLAYTN]: {
		mailer: { address: '0x28d9bb1aed64c115dd70e886c546ee0420623bc2', fromBlock: 102997948 },
		registry: { address: '0x79935f5d685452c361058c0fe5a50b803aa214a1', fromBlock: 102997948 },
	},
	[EVMNetwork.GNOSIS]: {
		mailer: { address: '0x79935f5d685452c361058c0fe5a50b803aa214a1', fromBlock: 24463497 },
		registry: { address: '0x28d9bb1aed64c115dd70e886c546ee0420623bc2', fromBlock: 24463497 },
	},
	[EVMNetwork.AURORA]: {
		mailer: { address: '0x28d9bb1aed64c115dd70e886c546ee0420623bc2', fromBlock: 75521930 },
		registry: { address: '0x79935f5d685452c361058c0fe5a50b803aa214a1', fromBlock: 75521930 },
	},

	[EVMNetwork.CELO]: {
		mailer: { address: '0x79935f5d685452c361058c0fe5a50b803aa214a1', fromBlock: 15446515 },
		registry: { address: '0x28d9bb1aed64c115dd70e886c546ee0420623bc2', fromBlock: 15446515 },
	},
	[EVMNetwork.MOONBEAM]: {
		mailer: { address: '0x28d9bb1aed64c115dd70e886c546ee0420623bc2', fromBlock: 2007459 },
		registry: { address: '0x79935f5d685452c361058c0fe5a50b803aa214a1', fromBlock: 2007459 },
	},
	[EVMNetwork.MOONRIVER]: {
		mailer: { address: '0x79935f5d685452c361058c0fe5a50b803aa214a1', fromBlock: 2703756 },
		registry: { address: '0x28d9bb1aed64c115dd70e886c546ee0420623bc2', fromBlock: 2703756 },
	},
	[EVMNetwork.METIS]: {
		mailer: { address: '0x28d9bb1aed64c115dd70e886c546ee0420623bc2', fromBlock: 3712292 },
		registry: { address: '0x79935f5d685452c361058c0fe5a50b803aa214a1', fromBlock: 3712292 },
	},
	[EVMNetwork.ASTAR]: {
		mailer: { address: '0xfb3658fbA39459a6B76e4f5a6813e73Bf49BC6BD', fromBlock: 2000783 },
		registry: { address: '0x28d9bb1aed64c115dd70e886c546ee0420623bc2', fromBlock: 2000783 },
	},
};

export const EVM_NAMES: Record<EVMNetwork, string> = {
	[EVMNetwork.LOCAL_HARDHAT]: 'LOCAL_HARDHAT',

	[EVMNetwork.ETHEREUM]: 'ETHEREUM',
	[EVMNetwork.BNBCHAIN]: 'BNBCHAIN',
	[EVMNetwork.POLYGON]: 'POLYGON',
	[EVMNetwork.AVALANCHE]: 'AVALANCHE',
	[EVMNetwork.OPTIMISM]: 'OPTIMISM',
	[EVMNetwork.ARBITRUM]: 'ARBITRUM',

	// [EVMNetwork.CRONOS]: 'CRONOS',
	[EVMNetwork.FANTOM]: 'FANTOM',
	[EVMNetwork.KLAYTN]: 'KLAYTN',
	[EVMNetwork.GNOSIS]: 'GNOSIS',
	[EVMNetwork.AURORA]: 'AURORA',
	[EVMNetwork.CELO]: 'CELO',
	[EVMNetwork.MOONBEAM]: 'MOONBEAM',
	[EVMNetwork.MOONRIVER]: 'MOONRIVER',
	[EVMNetwork.METIS]: 'METIS',
	[EVMNetwork.ASTAR]: 'ASTAR',

	// [EVMNetwork.AURORA]: 'AURORA',
	// [EVMNetwork.KLAYTN]: 'KLAYTN',
	// [EVMNetwork.GNOSIS]: 'GNOSIS',
	// [EVMNetwork.CRONOS]: 'CRONOS',

	// [EVMNetwork.CELO]: 'CELO',
	// [EVMNetwork.MOONRIVER]: 'MOONRIVER',
	// [EVMNetwork.MOONBEAM]: 'MOONBEAM',
	// [EVMNetwork.ASTAR]: 'ASTAR',
	// [EVMNetwork.HECO]: 'HECO',

	// [EVMNetwork.METIS]: 'METIS',
};

export const EVM_CHAINS: Record<EVMNetwork, number> = {
	[EVMNetwork.LOCAL_HARDHAT]: 31337,

	[EVMNetwork.ETHEREUM]: 1,
	[EVMNetwork.BNBCHAIN]: 56,
	[EVMNetwork.POLYGON]: 137,
	[EVMNetwork.AVALANCHE]: 43114,
	[EVMNetwork.OPTIMISM]: 10,
	[EVMNetwork.ARBITRUM]: 42161,

	// [EVMNetwork.CRONOS]: 25,
	[EVMNetwork.FANTOM]: 250,
	[EVMNetwork.KLAYTN]: 8217,
	[EVMNetwork.GNOSIS]: 100,
	[EVMNetwork.AURORA]: 1313161554,
	[EVMNetwork.CELO]: 42220,
	[EVMNetwork.MOONBEAM]: 1284,
	[EVMNetwork.MOONRIVER]: 1285,
	[EVMNetwork.METIS]: 1088,
	[EVMNetwork.ASTAR]: 592,

	// [EVMNetwork.HECO]: 128,
};

export const EVM_CHAIN_ID_TO_NETWORK: Record<number, EVMNetwork> = Object.keys(EVM_CHAINS)
	.map(network => ({
		[EVM_CHAINS[network as unknown as EVMNetwork]]: Number(network as unknown as EVMNetwork),
	}))
	.reduce((p, c) => ({ ...p, ...c }), {} as Record<number, EVMNetwork>);

export const EVM_RPCS: Record<EVMNetwork, { rpc: string; blockLimit?: number; lastestNotSupported?: boolean }[]> = {
	[EVMNetwork.LOCAL_HARDHAT]: [{ rpc: 'http://localhost:8545/' }],

	[EVMNetwork.ETHEREUM]: [
		{ rpc: 'https://eth-mainnet.g.alchemy.com/v2/MbanB2kJ4QyiFjOlUTSmkUj8lfbU6T6K' },
		{ rpc: 'wss://mainnet.infura.io/ws/v3/3bcb970aa2dd447cbad6ac4301ed63bf' },
		{ rpc: 'https://mainnet.infura.io/v3/3bcb970aa2dd447cbad6ac4301ed63bf' },
		{ rpc: 'https://eth-mainnet.public.blastapi.io' },
		{ rpc: 'https://eth-rpc.gateway.pokt.network' },
	],
	[EVMNetwork.BNBCHAIN]: [
		{
			rpc: 'https://still-tiniest-surf.bsc.discover.quiknode.pro/390c72acf357bb7fc5f2b9175a08d48b774c69db/',
			blockLimit: 3500,
		},
		{ rpc: 'https://bsc-dataseed.binance.org/' },
		{ rpc: 'https://bsc-dataseed2.binance.org' },
		{ rpc: 'https://bsc-dataseed3.binance.org' },
	],
	[EVMNetwork.POLYGON]: [
		{ rpc: 'https://polygon-mainnet.g.alchemy.com/v2/QsyQEuK4OgNSuo086MfKTXhO4DQCfYFu' },
		// 'https://polygon-mainnet.infura.io/v3/3bcb970aa2dd447cbad6ac4301ed63bf',
		// 'https://polygon-rpc.com',
		// 'https://rpc-mainnet.matic.quiknode.pro',
		// 'https://polygon-mainnet.public.blastapi.io',
	],
	[EVMNetwork.ARBITRUM]: [
		{ rpc: 'https://arb-mainnet.g.alchemy.com/v2/KY0LKW4PMTxWlVz8DkyBZ_IODtnn5_7r' },
		{ rpc: 'https://arb1.arbitrum.io/rpc' },
		{ rpc: 'https://rpc.ankr.com/arbitrum' },
	],
	[EVMNetwork.OPTIMISM]: [
		{ rpc: 'https://opt-mainnet.g.alchemy.com/v2/G8JwqBBJNnRouFnVbsmGA0E4WZtJNqPO' },
		{ rpc: 'https://mainnet.optimism.io' },
		{ rpc: 'https://optimism-mainnet.public.blastapi.io' },
		{ rpc: 'https://rpc.ankr.com/optimism' },
	],

	[EVMNetwork.AVALANCHE]: [
		{
			rpc: 'https://rpc.ankr.com/avalanche',
		},
		{
			rpc: 'https://ava-mainnet.blastapi.io/cc59bb68-a7ff-4278-9f16-278ba49d7635/ext/bc/C/rpc',
			blockLimit: 500,
		},
	],
	// [EVMNetwork.CRONOS]: [{ rpc: 'https://evm.cronos.org' }, { rpc: 'https://cronosrpc-1.xstaking.sg' }],
	[EVMNetwork.FANTOM]: [{ rpc: 'https://rpc.fantom.network' }],
	[EVMNetwork.KLAYTN]: [
		{ rpc: 'https://public-node-api.klaytnapi.com/v1/cypress' },
		{ rpc: 'https://klaytn01.fandom.finance' },
		{ rpc: 'https://klaytn02.fandom.finance' },
	],
	[EVMNetwork.GNOSIS]: [
		{ rpc: 'https://rpc.gnosischain.com' },
		{ rpc: 'wss://rpc.gnosischain.com/wss' },
		{ rpc: 'https://xdai-rpc.gateway.pokt.network' },
		{ rpc: 'https://gnosis-mainnet.public.blastapi.io' },
	],
	[EVMNetwork.AURORA]: [{ rpc: 'https://mainnet.aurora.dev' }],

	[EVMNetwork.CELO]: [
		{ rpc: 'wss://forno.celo.org/ws' },
		{ rpc: 'https://forno.celo.org' },
		{ rpc: 'https://rpc.ankr.com/celo' },
	],
	[EVMNetwork.MOONBEAM]: [
		{ rpc: 'wss://wss.api.moonbeam.network' },
		{ rpc: 'https://rpc.api.moonbeam.network' },
		{ rpc: 'https://moonbeam.public.blastapi.io' },
	],
	[EVMNetwork.MOONRIVER]: [{ rpc: 'https://rpc.api.moonriver.moonbeam.network' }],
	[EVMNetwork.ASTAR]: [
		{ rpc: 'https://astar.blastapi.io/cc59bb68-a7ff-4278-9f16-278ba49d7635' },
		{ rpc: 'https://astar-mainnet.g.alchemy.com/v2/Ib5I59bSB2Vv41PJlF2TWWqjND4ppGdi' },
	],
	[EVMNetwork.METIS]: [{ rpc: 'https://andromeda.metis.io/?owner=1088' }],
	// [EVMNetwork.HECO]: [
	// 	'wss://ws-mainnet.hecochain.com',
	// 	'https://http-mainnet.hecochain.com',
	// 	'https://hecoapi.terminet.io/rpc',
	// ],
};
