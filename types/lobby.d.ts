import { Lobby, LobbyUser, User } from "@prisma/client";

export interface LobbyUserWithRelation extends LobbyUser {
  lobby: Lobby;
  user: User;
}

export interface LobbyWithRelation extends Lobby {
  users: LobbyUserWithRelation[];
}
