import React from 'react';
import orderData from '../data/order.json';

const Leaderboard = () => {
  const { leaderboardData, stats } = orderData;

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">🏆 ReputationLeaderboard</h1>
          <p className="text-gray-300 text-lg">Top buyers on our marketplace</p>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-gray-900 rounded-lg shadow-2xl border border-blue-600/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-600/20">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                    Products Bought
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                    Total Spent (USDC)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {leaderboardData.map((user, index) => (
                  <tr 
                    key={user.rank} 
                    className={`hover:bg-gray-800/50 transition-colors ${
                      index === 0 ? 'bg-yellow-500/10' : 
                      index === 1 ? 'bg-gray-400/10' : 
                      index === 2 ? 'bg-orange-500/10' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {index === 0 && (
                          <span className="text-2xl mr-2">🥇</span>
                        )}
                        {index === 1 && (
                          <span className="text-2xl mr-2">🥈</span>
                        )}
                        {index === 2 && (
                          <span className="text-2xl mr-2">🥉</span>
                        )}
                        <span className={`text-lg font-bold ${
                          index === 0 ? 'text-yellow-400' : 
                          index === 1 ? 'text-gray-300' : 
                          index === 2 ? 'text-orange-400' : 'text-white'
                        }`}>
                          #{user.rank}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-xs font-bold">
                            {user.address.slice(2, 4).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {formatAddress(user.address)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {user.address}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white font-medium">
                        {user.productsBought} products
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-blue-400">
                        {user.totalSpent} USDC
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Leaderboard;