import type * as Party from "partykit/server";
import { PokerState } from "./types";
import { produce } from "immer";

type Message =
  | { type: "start-vote" }
  | { type: "show-votes" }
  | { type: "vote"; username: string; value: string };

export default class Server implements Party.Server {
  state: PokerState | undefined;

  constructor(readonly room: Party.Room) {}

  async onRequest(req: Party.Request) {
    if (req.method === "POST") {
      const { roomName } = (await req.json()) as {
        roomName: string;
      };
      this.state = {
        roomName,
        people: [],
        votes: [],
        showVotes: false,
      };
    }

    if (this.state) {
      return new Response(JSON.stringify(this.state), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not found", { status: 404 });
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    const params = new URLSearchParams(ctx.request.url.split("?")[1]);
    const username = params.get("username") ?? "Biome";
    const roomName = params.get("roomName");

    if (!roomName) {
      throw new Error("No room name");
    }

    if (!this.state) {
      this.state = {
        roomName,
        people: [],
        votes: [],
        showVotes: false,
      };
    }

    if (this.state.people.includes(username)) {
      // This is a hack to send the state through to the connectee
      this.room.broadcast(JSON.stringify(this.state));
      return;
    }

    conn.setState(username);

    this.state = produce(this.state, (draft) => {
      draft.people.push(username);
    });
    this.saveState();
    this.room.broadcast(JSON.stringify(this.state));
  }

  onClose(connection: Party.Connection): void | Promise<void> {
    const username = connection.state;
    if (!username || !this.state) return;

    this.state = produce(this.state, (draft) => {
      draft.people = draft.people.filter((user) => user !== username);
    });
    this.saveState();
    this.room.broadcast(JSON.stringify(this.state));
  }

  onMessage(message: string, sender: Party.Connection) {
    const msg = JSON.parse(message) as Message;

    switch (msg.type) {
      case "start-vote":
        this.startVote();
        break;
      case "vote":
        this.vote(msg.username, msg.value);
        break;
      case "show-votes":
        this.showVotes();
        break;
      default:
        throw new Error("Missing type");
    }
  }

  startVote() {
    if (!this.state) return;
    this.state = produce(this.state, (draft) => {
      draft.votes = [];
      draft.showVotes = false;
    });
    this.saveState();
    this.room.broadcast(JSON.stringify(this.state));
  }

  vote(username: string, value: string) {
    if (!this.state) return;
    this.state = produce(this.state, (draft) => {
      const vote = draft.votes.find((v) => v.username === username);

      if (vote) {
        vote.value = value;
      } else {
        draft.votes.push({ username, value });
      }
    });
    this.saveState();
    this.room.broadcast(JSON.stringify(this.state));
  }

  showVotes() {
    if (!this.state) return;
    this.state = produce(this.state, (draft) => {
      draft.showVotes = true;
    });
    this.saveState();
    this.room.broadcast(JSON.stringify(this.state));
  }

  async saveState() {
    if (this.state) {
      await this.room.storage.put<PokerState>("state", this.state);
    }
  }

  async onStart() {
    this.state = await this.room.storage.get<PokerState>("state");
  }
}

Server satisfies Party.Worker;
