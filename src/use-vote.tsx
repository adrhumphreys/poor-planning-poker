import usePartySocket from "partysocket/react";
import { PARTYKIT_HOST } from "./env";
import { PokerState } from "./types";
import { useCallback, useState } from "react";

export function useVote(room: string, username: string) {
  const [pokerState, setPokerState] = useState<PokerState | null>(null);

  const socket = usePartySocket({
    host: PARTYKIT_HOST,
    room,
    onMessage(event: { data: string }) {
      const message = JSON.parse(event.data) as PokerState;
      setPokerState(message);
    },
    query: async () => ({
      username,
      roomName: room,
    }),
    onError(e) {
      console.log("error", e);
    },
  });

  const startVote = useCallback(() => {
    socket.send(JSON.stringify({ type: "start-vote" }));
  }, [socket]);

  const showVotes = useCallback(() => {
    socket.send(JSON.stringify({ type: "show-votes" }));
  }, [socket]);

  const vote = useCallback(
    (value: string) => {
      socket.send(JSON.stringify({ type: "vote", username, value }));
    },
    [socket]
  );

  return {
    pokerState,
    startVote,
    showVotes,
    vote,
  };
}
