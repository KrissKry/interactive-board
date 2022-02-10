export interface ControlButtonPanel {
    id: string;

    icon: string;

    iconFalse?: string;

    state?: boolean;

    callback: (e?: any) => void;
}
