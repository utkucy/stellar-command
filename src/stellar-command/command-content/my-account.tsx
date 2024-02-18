import * as React from "react";

import * as StellarSdk from "@stellar/stellar-sdk";
import { getPublicKey } from "@stellar/freighter-api";
import { ArrowLeft } from "@phosphor-icons/react";
import { CommandEmpty, CommandGroup, CommandItem, CommandList } from "cmdk";
import { Skeleton } from "../../components/skeleton";
import Label from "../../components/label";
import { CommandSeparator } from "../../components/cmdk";
import { fetchAccount } from "../../lib/stellar-functions";

type Props = {
  server: StellarSdk.Horizon.Server;
  goBack: () => void;
};

type Balance =
  | StellarSdk.Horizon.HorizonApi.BalanceLineNative
  | StellarSdk.Horizon.HorizonApi.BalanceLineAsset<"credit_alphanum4">
  | StellarSdk.Horizon.HorizonApi.BalanceLineAsset<"credit_alphanum12">
  | StellarSdk.Horizon.HorizonApi.BalanceLineLiquidityPool;

const MyAccountCommandContent = ({ server, goBack }: Props) => {
  const [publicKey, setPublicKey] = React.useState<string | null>(null);
  const [balances, setBalances] = React.useState<Balance[]>([]);
  const [account, setAccount] =
    React.useState<StellarSdk.Horizon.ServerApi.AccountRecord | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const _getPublicKey = async () => {
      const publicKey = await getPublicKey();
      setPublicKey(publicKey);
    };

    _getPublicKey();
  }, []);

  React.useEffect(() => {
    const handleGetAccount = async () => {
      if (!publicKey) {
        return;
      }

      try {
        const account = await fetchAccount(publicKey, server);
        setAccount(account);
        setBalances(account.balances);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading account:", error);
      }
    };

    handleGetAccount();
  }, [publicKey]);

  return (
    <div className="flex flex-col ">
      <div className="flex items-center gap-2 p-4">
        <ArrowLeft
          className="text-gray-600 cursor-pointer"
          size={20}
          onClick={goBack}
        />
        <h2>My Wallet</h2>
      </div>

      <CommandSeparator />

      {isLoading ? (
        <div className="flex flex-col gap-3 mt-2 p-4">
          <Skeleton className="w-full h-[16px] rounded-full" />
          <Skeleton className="w-full h-[16px] rounded-full" />
          <Skeleton className="w-full h-[16px] rounded-full" />
        </div>
      ) : (
        <React.Fragment>
          <Label
            className="text-sm text-gray-400 text-wrap p-4"
            title={account?.account_id}
          />

          <CommandList className="px-4">
            <CommandEmpty>There is no asset in your wallet yet.</CommandEmpty>
            {balances.map((balance, index) => (
              <CommandItem className="!px-0 !py-4" key={index}>
                <div className="flex items-center gap-2">
                  {balance.asset_type === "native"
                    ? "Lumens"
                    : "asset_code" in balance &&
                      `${balance.asset_code} - ${balance.asset_issuer}`}
                  <div>-</div>
                  {balance.balance}
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </React.Fragment>
      )}
    </div>
  );
};

export default MyAccountCommandContent;
