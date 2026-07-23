import { Horizon, TransactionBuilder, Networks, Contract, rpc, scValToNative } from '@stellar/stellar-sdk'
import { signTransaction } from './wallet'

export const TOKEN_ID = 'CDVRNAS5WSTMEEBZC34UKCJZM4A4PF2A5SQTV4GS3U4D4UF7AYA2UFDM'
export const QUEST_ID = 'CBRNJ3VUJQTLT2TUD6FX5ARPLGKPCV4V3IHXBKSVSBHVITRS7BEDNSNV'


const horizonServer = new Horizon.Server('https://horizon-testnet.stellar.org')
const rpcServer = new rpc.Server('https://soroban-testnet.stellar.org')

export async function callContract(contractId, method, args, sourceAddress) {
  const sourceAccount = await horizonServer.loadAccount(sourceAddress)
  const contract = new Contract(contractId)

  const operation = contract.call(method, ...args)

  const builtTransaction = new TransactionBuilder(sourceAccount, {
    fee: '1000000',
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build()

  const preparedTransaction = await rpcServer.prepareTransaction(builtTransaction)
  const xdr = preparedTransaction.toXDR()

  const signedResult = await signTransaction(xdr, Networks.TESTNET)

  const signedTransaction = TransactionBuilder.fromXDR(
    signedResult.signedTxXdr,
    Networks.TESTNET
  )
  console.log(signedTransaction.source)


  const sendResponse = await rpcServer.sendTransaction(signedTransaction)

  if (sendResponse.status === 'ERROR') {
    throw new Error('Transaction submission failed')
  }

  let txResponse = await rpcServer.getTransaction(sendResponse.hash)
  while (txResponse.status === 'NOT_FOUND') {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    txResponse = await rpcServer.getTransaction(sendResponse.hash)
  }

  if (txResponse.status !== 'SUCCESS') {

  const events = txResponse.resultMetaXdr?.v4?.()?.sorobanMeta?.()?.diagnosticEvents?.()

  console.log("EVENTS:", events)

  throw new Error("Contract call did not succeed on the network.")
}

  return { hash: sendResponse.hash }
}

export async function readContract(contractId, method, args, sourceAddress) {
  const sourceAccount = await horizonServer.loadAccount(sourceAddress)
  const contract = new Contract(contractId)

  const operation = contract.call(method, ...args)

  const builtTransaction = new TransactionBuilder(sourceAccount, {
    fee: '100',
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build()

  const simulated = await rpcServer.simulateTransaction(builtTransaction)

  if (simulated.result) {
    return scValToNative(simulated.result.retval)
  }

  throw new Error('Simulation failed')
}