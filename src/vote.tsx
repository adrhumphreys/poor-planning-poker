import { useState } from "react";
import { useVote } from "./use-vote";

export function Vote({ room, username }: { room: string; username: string }) {
  const { vote, showVotes, startVote, pokerState } = useVote(room, username);

  const [value, setValue] = useState("");

  return (
    <main className="p-8 font-display">
      <div className="flex flex-col gap-2 items-start">
        <div className="flex gap-2">
          <button
            className="border px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
            onClick={startVote}
          >
            Start next round
          </button>
          <button
            className="border px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
            onClick={showVotes}
          >
            Show votes
          </button>
        </div>
        <label htmlFor="value">Value</label>
        <input
          className="border rounded-md px-3 py-2"
          id="value"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button
          className="border px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
          onClick={() => vote(value)}
        >
          Vote
        </button>
        <p className="font-bold">Waiting</p>
        <ul className="list-disc">
          {pokerState?.people
            .filter((p) => !pokerState.votes.some((v) => v.username === p))
            .map((username) => (
              <li key={username}>{username}</li>
            ))}
        </ul>
        <p className="font-bold">Voted</p>
        <ul className="list-disc flex flex-col gap-4">
          {pokerState?.votes.map((vote) => (
            <li key={vote.username}>
              {vote.username}{" "}
              {pokerState.showVotes ? (
                <span className="font-bold rounded p-2 border border-green-600">
                  {vote.value}
                </span>
              ) : (
                ""
              )}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
