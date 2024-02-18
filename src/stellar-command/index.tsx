import * as React from "react";
import { toast } from "sonner";
import * as StellarSdk from "@stellar/stellar-sdk";
import {
  DiscordLogo,
  LinkedinLogo,
  TwitterLogo,
  RedditLogo,
  GithubLogo,
  DownloadSimple,
  SignIn,
  Copy,
  ShareNetwork,
  Info,
  Code,
  Wallet,
  Database,
  ClockCounterClockwise,
  PlusCircle,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import {
  getNetwork,
  getNetworkDetails,
  getPublicKey,
  isAllowed,
  isConnected,
  setAllowed,
} from "@stellar/freighter-api";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "../components/cmdk";
import { CommandGroupType, CommandType } from "../lib/types";
import { CommanGroupKey, CommandKey } from "../lib/command-keys";

import { PUB_NET_BASE_URL, TEST_NET_BASE_URL } from "../lib/utils";

import { Toaster } from "../components/toast";
import Label from "../components/label";
import MyAccountCommandContent from "./command-content/my-account";
import RecentPaymentsCommandContent from "./command-content/recent-payments";
import SendPaymentCommandContent from "./command-content/send-payment";

type Props = {
  isTestNet?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const StellarCommand: React.FC<Props> = ({ open, onOpenChange, isTestNet }) => {
  const [searchValue, setSearchValue] = React.useState("");

  const [
    hasBrowserInstalledFreighterWallet,
    setHasBrowserInstalledFreighterWallet,
  ] = React.useState(false);
  const [isAllowedToUseFreighterWallet, setIsAllowedToUseFreighterWallet] =
    React.useState(false);

  const [selectedCommand, setSelectedCommand] =
    React.useState<CommandKey | null>(null);

  const [commandContent, setCommandContent] =
    React.useState<React.ReactNode>(null);

  const baseURL = isTestNet ? TEST_NET_BASE_URL : PUB_NET_BASE_URL;
  const server = new StellarSdk.Horizon.Server(baseURL);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    const checkFreighterWallet = async () => {
      const hasBrowserInstalledFreighterWallet = await isConnected();
      const isAllowedToUseFreighterWallet = await isAllowed();

      setHasBrowserInstalledFreighterWallet(hasBrowserInstalledFreighterWallet);
      setIsAllowedToUseFreighterWallet(isAllowedToUseFreighterWallet);
    };

    checkFreighterWallet();
  }, []);

  React.useEffect(() => {
    const handleCommand = async () => {
      switch (selectedCommand) {
        case CommandKey.FREIGHTER_WALLET_LOGIN:
          const isAllowed = await setAllowed();
          if (isAllowed) {
            setIsAllowedToUseFreighterWallet(true);
          }

          setSelectedCommand(null);
          break;
        case CommandKey.FREIGHTER_WALLET_GET_PUBLIC_KEY:
          const publicKey = await getPublicKey();
          await navigator.clipboard.writeText(publicKey);

          toast.success("Your public key has been copied to the clipboard.");

          setSelectedCommand(null);
          break;
        case CommandKey.FREIGHTER_WALLET_GET_NETWORK:
          const retrieveNetwork = async () => {
            let network = "";
            let error = "";

            try {
              network = await getNetwork();
            } catch (e: any) {
              error = e;
            }

            if (error) {
              return error;
            }

            return network;
          };

          const network = await retrieveNetwork();
          toast.info(`You are connected to the ${network} network.`);

          setSelectedCommand(null);
          break;
        case CommandKey.FREIGHTER_WALLET_GET_NETWORK_INFO:
          const retrieveNetworkDetails = async () => {
            let network: any;
            let error = "";

            try {
              network = await getNetworkDetails();
            } catch (e: any) {
              error = e;
            }

            if (error) {
              return error;
            }

            return network;
          };

          const networkDetails = await retrieveNetworkDetails();
          //TODO CHANGE MODAL CONTENT?
          // toast.info(`You are connected to the ${network} network.`);
          break;
        case CommandKey.FREIGHTER_WALLET_INSTALL:
          window.open("https://www.freighter.app/", "_blank");
          setSelectedCommand(null);
          break;

        case CommandKey.STELLAR_API_LOAD_ACCOUNT:
          setCommandContent(
            <MyAccountCommandContent
              goBack={() => clearSelectedContent()}
              server={server}
            />
          );
          break;

        case CommandKey.STELLAR_API_RECENT_PAYMENTS:
          setCommandContent(
            <RecentPaymentsCommandContent
              goBack={() => clearSelectedContent()}
              server={server}
            />
          );
          break;

        case CommandKey.STELLAR_API_SEND_PAYMENT:
          setCommandContent(
            <SendPaymentCommandContent
              goBack={() => clearSelectedContent()}
              server={server}
              isTestNet={!!isTestNet}
            />
          );
          break;

        case CommandKey.USEFUL_LINKS_STELLAR_DEV_DOCS:
          window.open("https://developers.stellar.org/", "_blank");
          setSelectedCommand(null);
          break;
        case CommandKey.USEFUL_LINKS_SOROBAN_DEV_DOCS:
          window.open("https://soroban.stellar.org/", "_blank");
          setSelectedCommand(null);
          break;

        case CommandKey.STELLAR_SOCIALS_X:
          window.open("https://twitter.com/StellarOrg", "_blank");
          setSelectedCommand(null);
          break;
        case CommandKey.STELLAR_SOCIALS_GITHUB:
          window.open("https://github.com/stellar/stellar-docs", "_blank");
          setSelectedCommand(null);
          break;
        case CommandKey.STELLAR_SOCIALS_DISCORD:
          window.open("https://discord.com/invite/stellardev", "_blank");
          setSelectedCommand(null);
          break;
        case CommandKey.STELLAR_SOCIALS_LINKEDIN:
          window.open(
            "https://www.linkedin.com/company/stellar-development-foundation/",
            "_blank"
          );
          setSelectedCommand(null);
          break;
        case CommandKey.STELLAR_SOCIALS_REDDIT:
          window.open("https://www.reddit.com/r/Stellar/", "_blank");
          setSelectedCommand(null);
          break;
      }
    };

    handleCommand();
  }, [selectedCommand]);

  const clearSelectedContent = () => {
    setSelectedCommand(null);
    setCommandContent(null);
    setSearchValue("");
  };

  const freighterWalletCommands = {
    key: CommanGroupKey.FREIGHTER_WALLET,
    heading: (
      <div className="flex items-center justify-between">
        <span>Freighter Wallet</span>
        {isAllowedToUseFreighterWallet && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-700" />
            <span>Connected</span>
          </div>
        )}
      </div>
    ),
    commands: [],
  } as CommandGroupType;

  if (!hasBrowserInstalledFreighterWallet) {
    freighterWalletCommands.commands.push({
      key: CommandKey.FREIGHTER_WALLET_INSTALL,
      label: (
        <Label
          title="Install Freighter Wallet"
          icon={<DownloadSimple size={16} />}
        />
      ),
      onSelect: setSelectedCommand,
    });
  } else {
    if (!isAllowedToUseFreighterWallet) {
      freighterWalletCommands.commands.push({
        key: CommandKey.FREIGHTER_WALLET_LOGIN,
        label: (
          <Label title="Connect Freighter Wallet" icon={<SignIn size={16} />} />
        ),
        onSelect: setSelectedCommand,
      });
    }

    freighterWalletCommands.commands.push(
      ...([
        {
          key: CommandKey.FREIGHTER_WALLET_GET_PUBLIC_KEY,
          label: <Label title="Copy My Public Key" icon={<Copy size={16} />} />,
          onSelect: setSelectedCommand,
        },
        {
          key: CommandKey.FREIGHTER_WALLET_GET_NETWORK,
          label: (
            <Label title="Check Network" icon={<ShareNetwork size={16} />} />
          ),
          onSelect: setSelectedCommand,
        },
        // {
        //   key: CommandKey.FREIGHTER_WALLET_GET_NETWORK_INFO,
        //   label: <Label title="Network Details" icon={<Info size={16} />} />,
        //   onSelect: setSelectedCommand,
        // },
      ] as CommandType[])
    );
  }

  const stellarApiCommands = {
    key: CommanGroupKey.STELLAR_API,
    heading: (
      <div className="flex items-center justify-between">
        <span>Stellar</span>
      </div>
    ),
    commands: [
      {
        key: CommandKey.STELLAR_API_LOAD_ACCOUNT,
        label: <Label title="My Wallet" icon={<Wallet size={16} />} />,
        onSelect: setSelectedCommand,
      },
      {
        key: CommandKey.STELLAR_API_RECENT_PAYMENTS,
        label: (
          <Label
            title="Recent Payments"
            icon={<ClockCounterClockwise size={16} />}
          />
        ),
        onSelect: setSelectedCommand,
      },
      {
        key: CommandKey.STELLAR_API_SEND_PAYMENT,
        label: (
          <Label title="Send Payment" icon={<ArrowSquareOut size={16} />} />
        ),
        onSelect: setSelectedCommand,
      },
    ],
  } as CommandGroupType;

  const usefulLinks = {
    key: CommanGroupKey.USEFUL_LINKS,
    heading: (
      <div className="flex items-center justify-between">
        <span>Useful Links</span>
      </div>
    ),
    commands: [
      {
        key: CommandKey.USEFUL_LINKS_STELLAR_DEV_DOCS,
        label: (
          <Label title="Stellar Developer Docs" icon={<Code size={16} />} />
        ),
        onSelect: setSelectedCommand,
      },
      {
        key: CommandKey.USEFUL_LINKS_SOROBAN_DEV_DOCS,
        label: (
          <Label title="Soroban Developer Docs" icon={<Code size={16} />} />
        ),
        onSelect: setSelectedCommand,
      },
    ],
  } as CommandGroupType;

  const stellarSocials = {
    key: CommanGroupKey.STELLAR_SOCIALS,
    heading: (
      <div className="flex items-center justify-between">
        <span>Stellar Socials</span>
      </div>
    ),
    commands: [
      {
        key: CommandKey.STELLAR_SOCIALS_X,
        label: <Label title="Twitter" icon={<TwitterLogo size={16} />} />,
        onSelect: setSelectedCommand,
      },
      {
        key: CommandKey.STELLAR_SOCIALS_GITHUB,
        label: <Label title="GitHub" icon={<GithubLogo size={16} />} />,
        onSelect: setSelectedCommand,
      },
      {
        key: CommandKey.STELLAR_SOCIALS_DISCORD,
        label: <Label title="Discord" icon={<DiscordLogo size={16} />} />,
        onSelect: setSelectedCommand,
      },
      {
        key: CommandKey.STELLAR_SOCIALS_LINKEDIN,
        label: <Label title="LinkedIn" icon={<LinkedinLogo size={16} />} />,
        onSelect: setSelectedCommand,
      },
      {
        key: CommandKey.STELLAR_SOCIALS_REDDIT,
        label: <Label title="Reddit" icon={<RedditLogo size={16} />} />,
        select: setSelectedCommand,
      },
    ],
  } as CommandGroupType;

  const commandGroups = [
    freighterWalletCommands,
    stellarApiCommands,
    usefulLinks,
    stellarSocials,
  ] as CommandGroupType[];

  return (
    <React.Fragment>
      <CommandDialog
        open={open}
        onOpenChange={onOpenChange}
        hideCloseButton={!!commandContent}
      >
        {commandContent ? (
          commandContent
        ) : (
          <React.Fragment>
            <CommandInput
              value={searchValue}
              onValueChange={setSearchValue}
              placeholder="Search on Stellar Universe..."
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              {commandGroups.map((group) => (
                <CommandGroup key={group.key} heading={group.heading}>
                  {group.commands.map((cmd) => (
                    <CommandItem
                      key={cmd.key}
                      onSelect={() => {
                        cmd.onSelect(cmd.key);
                      }}
                    >
                      {cmd.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </React.Fragment>
        )}
      </CommandDialog>

      <Toaster position="top-center" />
    </React.Fragment>
  );
};

export default StellarCommand;
