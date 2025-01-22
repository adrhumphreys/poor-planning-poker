import { useState } from "react";
import { Vote } from "./vote";
function App() {
  const [roomName, setRoomName] = useState("");
  const [username, setUsername] = useState("");

  const [joined, setJoined] = useState(false);

  if (joined) {
    return <Vote room={roomName} username={username} />;
  }

  return (
    <main className="p-8 font-display">
      <div className="flex flex-col gap-2 items-start">
        <label htmlFor="room">Room</label>
        <input
          className="border rounded-md px-3 py-2"
          id="room"
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <label htmlFor="username">Username</label>
        <input
          className="border rounded-md px-3 py-2"
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button
          className="border px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
          onClick={() => setJoined(true)}
        >
          Join
        </button>
      </div>
    </main>
  );
}

export default App;
