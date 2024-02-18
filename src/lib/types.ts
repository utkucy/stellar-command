import { CommanGroupKey, CommandKey } from "./command-keys";

export type CommandGroupType = {
  key: CommanGroupKey;
  heading: React.ReactNode;
  commands: CommandType[];
};

export type CommandType = {
  key: CommandKey;
  label: React.ReactNode;
  onSelect: (command: CommandKey) => void;
};
