import { useRef } from "react";
import Feed from "./components/Feed";
import Leaderboard from "./components/Leaderboard";

export default function App() {
  const leaderboardRef = useRef();

  const refreshLeaderboard = () => {
    if (leaderboardRef.current) {
      leaderboardRef.current.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-white text-black p-4 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <Feed onLike={refreshLeaderboard} />
        </div>
        <div className="w-full lg:w-80">
          <Leaderboard ref={leaderboardRef} />
        </div>
      </div>
    </div>
  );
}
