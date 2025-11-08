// Configuration loader
let config = null;

// Azure production API URL
const AZURE_API_URL = 'https://paypulse-api-fwbzc6bmb5b6btc2.canadacentral-01.azurewebsites.net/api';
const LOCAL_API_URL = 'http://localhost:3001/api';

// Determine API base URL based on environment
const getApiBaseUrl = (configuredUrl) => {
  // Handle special keywords
  if (configuredUrl === 'prod' || configuredUrl === 'production') {
    return AZURE_API_URL;
  }
  
  if (configuredUrl === 'dev' || configuredUrl === 'local' || configuredUrl === 'localhost') {
    return LOCAL_API_URL;
  }
  
  // If a specific URL is configured (not "auto"), use it
  if (configuredUrl && configuredUrl !== 'auto') {
    return configuredUrl;
  }

  // Auto-detect: Check if running on localhost
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return LOCAL_API_URL;
  }
  
  // Production environment - use deployed API
  return AZURE_API_URL;
};

// Load configuration from config.json
export const loadConfig = async () => {
  if (config) return config;
  
  try {
    const response = await fetch('/config.json');
    if (!response.ok) {
      throw new Error('Failed to load config.json');
    }
    const loadedConfig = await response.json();
    
    // Process API base URL
    config = {
      ...loadedConfig,
      apiBaseUrl: getApiBaseUrl(loadedConfig.apiBaseUrl)
    };
    
    console.log('🚀 PayPulse Configuration Loaded:');
    console.log('  Network:', config.networkName);
    console.log('  API:', config.apiBaseUrl);
    
    return config;
  } catch (error) {
    console.error('Error loading config:', error);
    // Fallback configuration
    config = {
      polkadotNodeUrl: 'wss://testnet-passet-hub.polkadot.io',
      platformAddress: '5FedX18utL5FphajHzATymbBYntSV2SEb4smRciZMW4FWBX8',
      networkName: 'Paseo Testnet',
      apiBaseUrl: getApiBaseUrl('auto')
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

