import type { UserEntity } from "@/user/user.entity";

export interface ISession {
    sessionKey?: string;
    sessionId?: number;
    user?: UserEntity;
}
