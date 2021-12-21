type UserStatus = 'CONNECTED' | 'DISCONNECTED';

/**
 * @property name
 * @property status
 */
export interface UserInterface {
    name: string;

    status: UserStatus;
}
