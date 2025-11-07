// Configuration loader
let config = null;

// Load configuration from config.json
export const loadConfig = async () => {
  if (config) return config;
  
  try {
    const response = await fetch('/config.json');
    if (!response.ok) {
      throw new Error('Failed to load config.json');
    }
    config = await response.json();
    return config;
  } catch (error) {
    console.error('Error loading config:', error);
    // Fallback configuration
    config = {
      polkadotNodeUrl: 'wss://testnet-passet-hub.polkadot.io',
      platformAddress: '5FedX18utL5FphajHzATymbBYntSV2SEb4smRciZMW4FWBX8',
      networkName: 'Paseo Testnet'
    };
    return config;
  }
};

// Get config value (must call loadConfig first)
export const getConfig = () => {
  if (!config) {
    console.warn('Config not loaded yet. Call loadConfig() first.');
    // Return fallback
    return {
      polkadotNodeUrl: 'wss://testnet-passet-hub.polkadot.io',
      platformAddress: '5FedX18utL5FphajHzATymbBYntSV2SEb4smRciZMW4FWBX8',
      networkName: 'Paseo Testnet'
    };
  }
  return config;
};

// Export for backwards compatibility
export const POLKADOT_NODE_URL = getConfig().polkadotNodeUrl;
export const PLATFORM_ADDRESS = getConfig().platformAddress;

// Alternative endpoints you can configure in config.json:
// Westend Asset Hub: 'wss://westend-asset-hub-rpc.polkadot.io'
// Rococo Asset Hub: 'wss://rococo-asset-hub-rpc.polkadot.io'
// Paseo Asset Hub: 'wss://pas-rpc.stakeworld.io'

