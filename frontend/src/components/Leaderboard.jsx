import { useEffect, useState, forwardRef, useImperativeHandle } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const Leaderboard = forwardRef((props, ref) => {
  const [leaders, setLeaders] = useState([]);

  const fetchLeaders = () => {
    // FIXED: Added backticks around the URL string
    fetch(`${API_BASE_URL}/api/leaderboard/`)
      .then((res) => res.json())
      .then(setLeaders)
      .catch(() => setLeaders([]));
  };

  useImperativeHandle(ref, () => ({
    refresh: fetchLeaders,
  }));

  useEffect(() => {
    fetchLeaders(); 
    const interval = setInterval(fetchLeaders, 5000); 

    return () => clearInterval(interval); 
  }, []);

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
      <h2 className="font-bold text-xl mb-4 text-gray-900">🏆 Top Players (24h)</h2>

      {leaders.length === 0 && (
        <div className="text-gray-500 text-sm">No activity yet</div>
      )}

      {leaders.map((u, i) => (
        <div key={u.user_id} className="flex justify-between items-center py-2 text-sm">
          <span className="text-gray-700">
            #{i + 1} {u.username}
          </span>
          <span className="text-blue-600 font-medium">{u.karma}</span>
        </div>
      ))}
    </div>
  );
});

export default Leaderboard;
