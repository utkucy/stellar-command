import * as React from "react";
import dayjs from "dayjs";
import * as StellarSdk from "@stellar/stellar-sdk";
import { getPublicKey } from "@stellar/freighter-api";
import {
  ArrowBendRightDown,
  ArrowDown,
  ArrowLeft,
  CalendarBlank,
} from "@phosphor-icons/react";
import { CommandEmpty, CommandGroup, CommandItem, CommandList } from "cmdk";
import { Skeleton } from "../../components/skeleton";
import Label from "../../components/label";
import { CommandSeparator } from "../../components/cmdk";

type Props = {
  server: StellarSdk.Horizon.Server;
  goBack: () => void;
};

type Payment =
  | StellarSdk.Horizon.ServerApi.PaymentOperationRecord
  | StellarSdk.Horizon.ServerApi.CreateAccountOperationRecord
  | StellarSdk.Horizon.ServerApi.AccountMergeOperationRecord
  | StellarSdk.Horizon.ServerApi.PathPaymentOperationRecord
  | StellarSdk.Horizon.ServerApi.PathPaymentStrictSendOperationRecord
  | StellarSdk.Horizon.ServerApi.InvokeHostFunctionOperationRecord;

const RecentPaymentsCommandContent = ({ server, goBack }: Props) => {
  const [publicKey, setPublicKey] = React.useState<string | null>(null);
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const _getPublicKey = async () => {
      const publicKey = await getPublicKey();
      setPublicKey(publicKey);
    };

    _getPublicKey();
  }, []);

  React.useEffect(() => {
    const fetchRecentPayments = async (limit = 10) => {
      if (!publicKey) {
        return;
      }

      const { records } = await server
        .payments()
        .forAccount(publicKey)
        .limit(limit)
        .order("desc")
        .call();

      setPayments(records);

      setIsLoading(false);
    };

    fetchRecentPayments();
  }, [publicKey]);

  const renderPayment = (payment: Payment, index: number) => {
    switch (payment.type) {
      case "payment":
        return (
          <div className="flex flex-col gap-2 px-0 py-4" key={payment.id}>
            <h2 className="text-xl font-bold">
              {`${dayjs(payment.created_at).format("HH:mm MMMM D, YYYY")}`}
            </h2>
            <Label
              className="text-sm text-gray-400 text-wrap "
              title={`${payment.from}`}
            />

            <div className="w-full flex items-center justify-center gap-1">
              <ArrowBendRightDown size={24} />
              <Label
                className="text-base font-medium text-gray-700 text-wrap"
                title={`${payment.amount} ${payment.asset_code || "XLM"}`}
              />
            </div>

            <Label
              className="text-sm text-gray-400 text-wrap "
              title={`${payment.to}`}
            />

            {index !== payments.length - 1 && <CommandSeparator />}
          </div>
        );

      case "create_account":
        return (
          <div key={payment.id} className="px-0 py-4">
            <h2 className="text-xl font-bold">Create Account</h2>

            <Label
              className="text-sm text-gray-400 text-wrap p-4"
              title={`Funder: ${payment.funder}`}
            />
            <Label
              className="text-sm text-gray-400 text-wrap p-4"
              title={`Account: ${payment.account}`}
            />
            <Label
              className="text-sm text-gray-400 text-wrap p-4"
              title={`Starting Balance: ${payment.starting_balance}`}
            />

            {index !== payments.length - 1 && <CommandSeparator />}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col overflow-auto max-h-[500px] ">
      <div className="flex items-center gap-2 p-4">
        <ArrowLeft
          className="text-gray-600 cursor-pointer"
          size={20}
          onClick={goBack}
        />
        <h2>Recent Payments</h2>
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
          {/* <Label
            className="text-sm text-gray-400 text-wrap p-4"
            title={publicKey}
          /> */}

          <CommandList className="px-4">
            <CommandEmpty>
              There is no paymeny history found in your wallet yet.
            </CommandEmpty>
            {payments.map((payment, index) => renderPayment(payment, index))}
          </CommandList>
        </React.Fragment>
      )}
    </div>
  );
};

export default RecentPaymentsCommandContent;
