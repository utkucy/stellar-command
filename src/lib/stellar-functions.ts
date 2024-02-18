import * as StellarSdk from "@stellar/stellar-sdk";
import { StrKey } from "@stellar/stellar-sdk";

export async function fetchAccount(
  publicKey: string,
  server: StellarSdk.Horizon.Server
) {
  if (StrKey.isValidEd25519PublicKey(publicKey)) {
    try {
      let account = await server.accounts().accountId(publicKey).call();
      return account;
    } catch (err) {
      // @ts-ignore
      if (err.response?.status === 404) {
        // @ts-ignore
        throw error(404, "account not funded on network");
      } else {
        // @ts-ignore
        throw error(err.response?.status ?? 400, {
          // @ts-ignore
          message: `${err.response?.title} - ${err.response?.detail}`,
        });
      }
    }
  } else {
    // @ts-ignore
    throw error(400, { message: "invalid public key" });
  }
}

export async function fetchAccountBalances(
  publicKey: string,
  server: StellarSdk.Horizon.Server
) {
  const { balances } = await fetchAccount(publicKey, server);
  return balances;
}
