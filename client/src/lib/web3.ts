import Web3 from 'web3';
import { toast } from '@/hooks/use-toast';

const TODO_CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "taskHash",
        "type": "bytes32"
      }
    ],
    "name": "verifyTask",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

let web3: Web3 | null = null;
let todoContract: any = null;

const defaultPrivateKey = 'e2940d4e5d37e0ab12c0577a914614325197b5faa0bafc8937a2357e1ff3479d';
const defaultAccount = '0x38E44DebB1a5ede3D1f5cF7ac168EBecdcD76683';
const contractAddress = '0x0b44aFb241958Daa4B6801Bb29A824E2E1aEF523';

export async function initializeBlockchain() {
    try {
        console.log('Starting Web3 initialization...');

        // 1. Initialize Web3 with Alchemy provider
        const alchemyProviderUrl = `https://eth-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`;
        web3 = new Web3(new Web3.providers.HttpProvider(alchemyProviderUrl));

        console.log('Web3 provider set up.');

        // 2. Set up account with proper private key handling
        console.log('Setting up account...');
        try {
            // Ensure private key has 0x prefix
            const formattedPrivateKey = `0x${defaultPrivateKey.replace('0x', '')}`;
            console.log('Adding account to wallet...');

            const account = web3.eth.accounts.privateKeyToAccount(formattedPrivateKey);
            web3.eth.accounts.wallet.add(account);
            web3.eth.defaultAccount = defaultAccount;

            console.log(`Account ${defaultAccount} added to wallet.`);
        } catch (accountError) {
            console.error("Error adding account:", accountError);
            toast({
                title: "Account Setup Failed",
                description: "Error adding account. Check your private key.",
                variant: "destructive"
            });
            return false;
        }

        // 3. Initialize contract with explicit address
        console.log('Initializing contract...', contractAddress);
        try {
            todoContract = new web3.eth.Contract(
                TODO_CONTRACT_ABI,
                contractAddress
            );
            console.log('Contract initialized successfully');

            // Verify contract connection
            const code = await web3.eth.getCode(contractAddress);
            if (code === '0x') {
                throw new Error('No contract code at specified address');
            }
        } catch (contractError) {
            console.error("Contract initialization error:", contractError);
            toast({
                title: "Contract Initialization Failed",
                description: "Failed to initialize the contract. Check the ABI and contract address.",
                variant: "destructive"
            });
            return false;
        }

        // 4. Verify connection and log information
        console.log('Verifying connection...');
        try {
            const networkId = await web3.eth.net.getId();
            console.log('Connected to network:', networkId);

            const balance = await web3.eth.getBalance(defaultAccount);
            console.log('Account balance:', web3.utils.fromWei(balance, 'ether'), 'ETH');

        } catch (connectionError) {
            console.error("Connection verification error:", connectionError);
            toast({
                title: "Connection Verification Failed",
                description: "Failed to verify the connection to the blockchain.",
                variant: "destructive"
            });
            return false;
        }

        console.log('Web3 initialization complete.');
        return true;

    } catch (error) {
        console.error('Failed to initialize Web3Provider:', error);
        toast({
            title: "Web3 Initialization Failed",
            description: "Failed to connect to blockchain. Please check your connection.",
            variant: "destructive"
        });
        return false;
    }
}

export async function verifyTask(taskId: number, taskTitle: string): Promise<string | null> {
    try {
        if (!web3 || !todoContract) {
            if (!await initializeBlockchain()) {
                throw new Error('Failed to initialize blockchain');
            }
        }

        const taskHash = web3!.utils.keccak256(
            web3!.eth.abi.encodeParameters(
                ['uint256', 'string'],
                [taskId, taskTitle]
            )
        );

        // Get current gas price
        const gasPrice = await web3!.eth.getGasPrice();
        console.log('Current gas price:', gasPrice);

        // Create transaction with explicit gas parameters
        const tx = {
            from: defaultAccount,
            to: contractAddress,
            gas: '200000',
            gasPrice: gasPrice,
            data: todoContract.methods.verifyTask(taskHash).encodeABI()
        };

        console.log('Signing transaction...', tx);
        // Ensure private key has 0x prefix for signing
        const formattedPrivateKey = `0x${defaultPrivateKey.replace('0x', '')}`;
        const signedTx = await web3!.eth.accounts.signTransaction(tx, formattedPrivateKey);

        if (!signedTx.rawTransaction) {
            throw new Error('Failed to sign transaction');
        }

        console.log('Sending signed transaction...');
        const receipt = await web3!.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log('Transaction successful:', receipt.transactionHash);

        return receipt.transactionHash;
    } catch (error: any) {
        console.error('Transaction signing failed:', error);
        toast({
            title: "Verification Failed",
            description: error.message,
            variant: "destructive"
        });
        return null;
    }
}