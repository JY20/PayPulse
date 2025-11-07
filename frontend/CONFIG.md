# Configuration Guide

## Overview

PayPulse uses a `config.json` file located in the `frontend/public/` directory to manage configuration settings. This approach allows you to easily change settings without rebuilding the application.

## Configuration File Location

```
frontend/
  └── public/
      └── config.json
```

## Configuration Options

### config.json Structure

```json
{
  "polkadotNodeUrl": "wss://testnet-passet-hub.polkadot.io",
  "platformAddress": "5FedX18utL5FphajHzATymbBYntSV2SEb4smRciZMW4FWBX8",
  "networkName": "Paseo Testnet"
}
```

### Available Settings

| Setting | Type | Description | Example |
|---------|------|-------------|---------|
| `polkadotNodeUrl` | string | WebSocket endpoint for Polkadot node connection | `"wss://testnet-passet-hub.polkadot.io"` |
| `platformAddress` | string | Polkadot address that receives platform deposits | `"5FedX18utL5FphajHzATymbBYntSV2SEb4smRciZMW4FWBX8"` |
| `networkName` | string | Display name for the network | `"Paseo Testnet"` |

## Network Options

### Testnet Networks

**Paseo Testnet (Current):**
```json
{
  "polkadotNodeUrl": "wss://testnet-passet-hub.polkadot.io",
  "networkName": "Paseo Testnet"
}
```

**Westend Asset Hub:**
```json
{
  "polkadotNodeUrl": "wss://westend-asset-hub-rpc.polkadot.io",
  "networkName": "Westend Testnet"
}
```

**Rococo Asset Hub:**
```json
{
  "polkadotNodeUrl": "wss://rococo-asset-hub-rpc.polkadot.io",
  "networkName": "Rococo Testnet"
}
```

### Production Network

**Polkadot Mainnet:**
```json
{
  "polkadotNodeUrl": "wss://rpc.polkadot.io",
  "networkName": "Polkadot Mainnet"
}
```

⚠️ **WARNING**: When switching to mainnet, ensure you:
1. Use a secure platform address
2. Have proper security measures in place
3. Test thoroughly on testnet first
4. Keep private keys secure and never commit them to version control

## Platform Address

The `platformAddress` is the Polkadot account that receives all user deposits.

### Current Address

```
5FedX18utL5FphajHzATymbBYntSV2SEb4smRciZMW4FWBX8
```

### Changing the Platform Address

1. Generate a new Polkadot address using:
   - Polkadot.js Extension
   - SubWallet
   - Polkadot.js Apps (https://polkadot.js.org/apps)

2. **Securely store the private key/seed phrase**

3. Update `config.json`:
   ```json
   {
     "platformAddress": "YOUR_NEW_ADDRESS_HERE"
   }
   ```

4. The change takes effect immediately (no rebuild required)

### Security Best Practices

- ✅ Use a dedicated address for the platform
- ✅ Keep private keys in secure hardware wallet
- ✅ Use multi-signature wallets for production
- ✅ Regularly audit incoming transactions
- ❌ Never commit private keys to git
- ❌ Never share seed phrases
- ❌ Don't reuse personal wallet addresses

## How It Works

### Configuration Loading

The application loads `config.json` automatically when:
1. The PolkadotContext initializes
2. Any component accesses configuration values

### In Code

```javascript
import { getConfig, loadConfig } from '../config'

// Load configuration (async)
await loadConfig()

// Get configuration values
const config = getConfig()
console.log(config.platformAddress)
console.log(config.polkadotNodeUrl)
```

### Fallback Configuration

If `config.json` cannot be loaded, the application uses these fallback values:

```javascript
{
  polkadotNodeUrl: 'wss://testnet-passet-hub.polkadot.io',
  platformAddress: '5FedX18utL5FphajHzATymbBYntSV2SEb4smRciZMW4FWBX8',
  networkName: 'Paseo Testnet'
}
```

## Updating Configuration

### During Development

1. Edit `frontend/public/config.json`
2. Save the file
3. Refresh the browser (hard refresh: Ctrl+Shift+R)

No rebuild is necessary!

### In Production

1. Edit `config.json` in your deployed public folder
2. Changes take effect on next page load
3. Users may need to hard refresh (Ctrl+Shift+R)

## Environment-Specific Configuration

### Development Environment

```json
{
  "polkadotNodeUrl": "wss://testnet-passet-hub.polkadot.io",
  "platformAddress": "5FedX18utL5FphajHzATymbBYntSV2SEb4smRciZMW4FWBX8",
  "networkName": "Paseo Testnet (Dev)"
}
```

### Production Environment

```json
{
  "polkadotNodeUrl": "wss://rpc.polkadot.io",
  "platformAddress": "YOUR_PRODUCTION_ADDRESS",
  "networkName": "Polkadot Mainnet"
}
```

## Troubleshooting

### Config Not Loading

**Problem**: Application can't load config.json

**Solutions**:
1. Verify file exists at `frontend/public/config.json`
2. Check file has valid JSON syntax
3. Check browser console for errors
4. Clear browser cache and hard refresh

### Invalid JSON

**Problem**: JSON parse error

**Solution**: Validate your JSON:
```bash
# In the frontend directory
cat public/config.json | python -m json.tool
```

Or use an online JSON validator.

### Changes Not Applying

**Problem**: Updated config but app still uses old values

**Solutions**:
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Check you edited the correct file
4. Verify JSON syntax is valid

## Testing Different Networks

To test on different networks:

1. **Update config.json**:
   ```json
   {
     "polkadotNodeUrl": "wss://westend-asset-hub-rpc.polkadot.io",
     "platformAddress": "YOUR_WESTEND_ADDRESS",
     "networkName": "Westend Testnet"
   }
   ```

2. **Get testnet tokens** from appropriate faucet:
   - Paseo: https://faucet.polkadot.io/paseo
   - Westend: https://faucet.polkadot.io/westend
   - Rococo: https://faucet.polkadot.io/rococo

3. **Hard refresh the browser**

4. **Connect your wallet** (make sure it's on the same network)

5. **Test deposits**

## Additional Notes

- The config file is fetched once and cached in memory
- Changes require page reload to take effect
- The file is publicly accessible (don't store secrets here)
- Use environment variables for truly sensitive data
- Git tracks this file - be careful with production addresses

## Example: Switching to Mainnet

1. **Backup current config**:
   ```bash
   cp public/config.json public/config.json.backup
   ```

2. **Update to mainnet**:
   ```json
   {
     "polkadotNodeUrl": "wss://rpc.polkadot.io",
     "platformAddress": "YOUR_SECURE_MAINNET_ADDRESS",
     "networkName": "Polkadot Mainnet"
   }
   ```

3. **Test thoroughly**:
   - Verify connection
   - Test with small amounts first
   - Monitor transactions
   - Confirm balance updates

4. **Deploy**:
   - Build frontend: `npm run build`
   - Deploy dist folder
   - Verify config.json is in the deployed public folder

## Support

For issues or questions about configuration:
1. Check browser console for errors
2. Verify JSON syntax
3. Test with fallback values
4. Check Polkadot node endpoint is accessible

