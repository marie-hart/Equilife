export type ActionButton = {
  key: string;
  title: string;
  icon: string;
  color?: string;
  disabled: boolean;
  onClick?: () => void;
};

export type SelectedKind = "event" | null;