import Web3 from 'web3';
import { toast } from '@/hooks/use-toast';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export class Web3Provider {
  private static instance: Web3Provider;
  private web3: Web3;
  private initialized: boolean = false;
  private readonly defaultPrivateKey = 'e2940d4e5d37e0ab12c0577a914614325197b5faa0bafc8937a2357e1ff3479d';
  private readonly defaultAccount = '0x38E44DebB1a5ede3D1f5cF7ac168EBecdcD76683';

  private constructor() {
    console.log('Initializing Web3Provider...');
    // Initialize with Alchemy provider
    this.web3 = new Web3(
      new Web3.providers.HttpProvider(
        `https://eth-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`
      )
    );
  }

  public static getInstance(): Web3Provider {
    if (!Web3Provider.instance) {
      Web3Provider.instance = new Web3Provider();
    }
    return Web3Provider.instance;
  }

  public async initialize(): Promise<boolean> {
    if (this.initialized) return true;

    try {
      console.log('Starting Web3 initialization...');

      // Ensure private key has 0x prefix
      const privateKey = this.defaultPrivateKey.startsWith('0x') 
        ? this.defaultPrivateKey 
        : `0x${this.defaultPrivateKey}`;

      console.log('Setting up account...');
      const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
      this.web3.eth.accounts.wallet.add(account);
      this.web3.eth.defaultAccount = this.defaultAccount;

      console.log('Account setup complete, verifying connection...');
      await this.verifyConnection();

      this.initialized = true;
      console.log('Web3 initialization complete!');
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

  private async verifyConnection(): Promise<void> {
    try {
      const networkId = await this.web3.eth.net.getId();
      console.log('Connected to network ID:', networkId);

      const balance = await this.web3.eth.getBalance(this.defaultAccount);
      console.log('Account balance:', this.web3.utils.fromWei(balance, 'ether'), 'ETH');
    } catch (error) {
      console.error('Connection verification failed:', error);
      throw error;
    }
  }

  public getWeb3(): Web3 {
    return this.web3;
  }

  public getDefaultAccount(): string {
    return this.web3.eth.defaultAccount || this.defaultAccount;
  }

  public async signTransaction(tx: any): Promise<string> {
    try {
      const privateKey = this.defaultPrivateKey.startsWith('0x') 
        ? this.defaultPrivateKey 
        : `0x${this.defaultPrivateKey}`;

      console.log('Signing transaction...');
      const signedTx = await this.web3.eth.accounts.signTransaction(tx, privateKey);

      if (!signedTx.rawTransaction) {
        throw new Error('Failed to sign transaction');
      }

      console.log('Sending signed transaction...');
      const receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      console.log('Transaction successful:', receipt.transactionHash);

      return receipt.transactionHash;
    } catch (error: any) {
      console.error('Transaction signing failed:', error);
      throw new Error(error.message);
    }
  }
}