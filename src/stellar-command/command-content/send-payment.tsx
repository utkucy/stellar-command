import * as React from "react";
import freighterApi from "@stellar/freighter-api";
import * as StellarSdk from "@stellar/stellar-sdk";
import { getPublicKey } from "@stellar/freighter-api";
import { ArrowLeft } from "@phosphor-icons/react";
import { CommandEmpty, CommandGroup, CommandItem, CommandList } from "cmdk";
import { Skeleton } from "../../components/skeleton";
import Label from "../../components/label";
import { CommandSeparator } from "../../components/cmdk";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/select";
import {
  fetchAccount,
  fetchAccountBalances,
} from "../../lib/stellar-functions";
import { Input } from "../../components/input";
import { Button } from "../../components/button";
import { toast } from "sonner";
import { ReloadIcon } from "@radix-ui/react-icons";

type Props = {
  server: StellarSdk.Horizon.Server;
  isTestNet: boolean;
  goBack: () => void;
};

type Balance =
  | StellarSdk.Horizon.HorizonApi.BalanceLineNative
  | StellarSdk.Horizon.HorizonApi.BalanceLineAsset<"credit_alphanum4">
  | StellarSdk.Horizon.HorizonApi.BalanceLineAsset<"credit_alphanum12">
  | StellarSdk.Horizon.HorizonApi.BalanceLineLiquidityPool;

const SendPaymentCommandContent = ({ server, goBack, isTestNet }: Props) => {
  const [publicKey, setPublicKey] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [balances, setBalances] = React.useState<Balance[]>([]);
  const [account, setAccount] =
    React.useState<StellarSdk.Horizon.ServerApi.AccountRecord | null>(null);

  const [assetAmount, setAssetAmount] = React.useState<number | null>(null);
  const [selectedAsset, setSelectedAsset] = React.useState<string | null>(null);
  const [destination, setDestination] = React.useState<string | null>(null);

  const [paymentLoading, setPaymentLoading] = React.useState(false);

  React.useEffect(() => {
    const _getPublicKey = async () => {
      const publicKey = await getPublicKey();
      setPublicKey(publicKey);
    };

    _getPublicKey();
  }, []);

  React.useEffect(() => {
    const _fetchAccount = async (limit = 10) => {
      if (!publicKey) {
        return;
      }

      const account = await fetchAccount(publicKey, server);
      const balances = await fetchAccountBalances(publicKey, server);

      setAccount(account);
      setBalances(balances);

      setIsLoading(false);
    };

    _fetchAccount();
  }, [publicKey]);

  const sendPayment = async () => {
    if (!publicKey) {
      return;
    }

    setPaymentLoading(true);

    const network = !!isTestNet ? "TESTNET" : "PUBLIC";

    try {
      const sourceAccount = await server.loadAccount(publicKey);

      const asset = balances.find(
        (balance) =>
          ("asset_code" in balance && balance.asset_code === selectedAsset) ||
          balance.asset_type === "native"
      );

      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: network,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: destination || "",
            asset:
              selectedAsset === "native"
                ? StellarSdk.Asset.native()
                : asset && "asset_issuer" in asset
                ? new StellarSdk.Asset(selectedAsset!, asset.asset_issuer)
                : new StellarSdk.Asset(selectedAsset!),
            amount: assetAmount!.toString(),
            source: publicKey,
          })
        )
        // Add other operations if necessary
        .setTimeout(30)
        .build();

      const xdrString = transaction.toXDR();

      const signResponse = await freighterApi.signTransaction(xdrString, {
        network,
      });

      const transactionToSubmit = StellarSdk.TransactionBuilder.fromXDR(
        signResponse,
        network
      );

      const transactionResponse = await server.submitTransaction(
        transactionToSubmit
      );

      if (transactionResponse.successful) {
        toast.success("Payment sent successfully.");

        setAssetAmount(null);
        setSelectedAsset(null);
        setDestination(null);
        setPaymentLoading(false);

        goBack();
      } else {
        toast.error("Failed to send payment.");
      }
    } catch (error) {
      console.log(error);
      toast.error("An Error Occurred. Please try again.");
    }
    setPaymentLoading(false);
  };

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2 ">
        <ArrowLeft
          className="text-gray-600 cursor-pointer"
          size={20}
          onClick={goBack}
        />
        <h2>Send Payment</h2>
      </div>

      <CommandSeparator />

      {isLoading ? (
        <div className="flex flex-col gap-3 mt-2 ">
          <Skeleton className="w-full h-[16px] rounded-full" />
          <Skeleton className="w-full h-[16px] rounded-full" />
          <Skeleton className="w-full h-[16px] rounded-full" />
        </div>
      ) : !publicKey ? (
        <CommandEmpty>
          Your public key is not found. Please connect your Freighter Wallet.
        </CommandEmpty>
      ) : (
        <React.Fragment>
          <Label
            className="text-xs text-gray-400 text-wrap py-4"
            title={publicKey}
          />

          <div className="flex w-full items-center gap-2">
            <Input
              type="number"
              placeholder="Amount"
              className="flex-auto"
              min={0}
              onChange={(e) => setAssetAmount(Number(e.target.value))}
            />

            <Select
              onValueChange={setSelectedAsset}
              value={selectedAsset || undefined}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select an asset..." />
              </SelectTrigger>
              <SelectContent>
                {balances.filter((b) => b.asset_type === "native").length >
                  0 && <SelectItem value="native">XLM</SelectItem>}
                {balances
                  .filter((balance) => "asset_code" in balance)
                  .map((balance, index) => (
                    <SelectItem key={index} value={(balance as any).asset_code}>
                      {(balance as any).asset_code}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            placeholder="Destination Address"
            className="w-full "
            onChange={(e) => setDestination(e.target.value)}
          />

          <Button
            onClick={() => sendPayment()}
            disabled={!selectedAsset || !assetAmount || !destination}
            className="py-3"
          >
            {paymentLoading && (
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign Transaction with Freighter
          </Button>
        </React.Fragment>
      )}
    </div>
  );
};

export default SendPaymentCommandContent;
