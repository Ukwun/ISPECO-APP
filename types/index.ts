import { User } from "@clerk/nextjs/server";

export type SocketUser = {
    id: string;
    socketId: string;
    username: string;
    profile: string;
};

export type Participants = {
    caller: SocketUser;
    receiver: SocketUser;
}

export type OngoingCall = {
    participants: Participants;
    isRinging: boolean;
}