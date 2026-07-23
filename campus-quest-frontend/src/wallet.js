import { StellarWalletsKit, Networks as WalletKitNetworks } from '@creit.tech/stellar-wallets-kit'
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter'
import { AlbedoModule } from '@creit.tech/stellar-wallets-kit/modules/albedo'
import { xBullModule } from '@creit.tech/stellar-wallets-kit/modules/xbull'
import { RabetModule } from '@creit.tech/stellar-wallets-kit/modules/rabet'

StellarWalletsKit.init({
  network: WalletKitNetworks.TESTNET,
  modules: [
    new FreighterModule(),
    new AlbedoModule(),
    new xBullModule(),
    new RabetModule(),
  ],
})

export async function connectWallet() {
  const { address } = await StellarWalletsKit.authModal()
  return address
}

export async function disconnectWallet() {
  await StellarWalletsKit.disconnect()
}

export async function signTransaction(xdr, networkPassphrase) {
  return StellarWalletsKit.signTransaction(xdr, { networkPassphrase })
}