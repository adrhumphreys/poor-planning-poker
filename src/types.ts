export type Vote = {
  value: string;
  username: string;
};

export type PokerState = {
  roomName: string;
  votes: Vote[];
  people: string[];
  showVotes: boolean;
};
