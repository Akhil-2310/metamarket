import React, { useState } from 'react';

const Leaderboard = () => {
  // Mock data for leaderboard
  const [leaderboardData] = useState([
    {
      rank: 1,
      address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      productsBought: 15,
      totalSpent: "2,450.00"
    },
    {
      rank: 2,
      address: "0x8ba1f109551bD432803012645Hac136c772c3c3",
      productsBought: 12,
      totalSpent: "1,890.00"
    },
    {
      rank: 3,
      address: "0x1234567890123456789012345678901234567890",
      productsBought: 10,
      totalSpent: "1,650.00"
    },
    {
      rank: 4,
      address: "0xabcdef1234567890abcdef1234567890abcdef12",
      productsBought: 8,
      totalSpent: "1,320.00"
    },
    {
      rank: 5,
      address: "0x9876543210987654321098765432109876543210",
      productsBought: 7,
      totalSpent: "1,150.00"
    },
    {
      rank: 6,
      address: "0xfedcba0987654321fedcba0987654321fedcba09",
      productsBought: 6,
      totalSpent: "980.00"
    },
    {
      rank: 7,
      address: "0x1111111111111111111111111111111111111111",
      productsBought: 5,
      totalSpent: "820.00"
    },
    {
      rank: 8,
      address: "0x2222222222222222222222222222222222222222",
      productsBought: 4,
      totalSpent: "650.00"
    },
    {
      rank: 9,
      address: "0x3333333333333333333333333333333333333333",
      productsBought: 3,
      totalSpent: "480.00"
    },
    {
      rank: 10,
      address: "0x4444444444444444444444444444444444444444",
      productsBought: 2,
      totalSpent: "320.00"
    }
  ]);

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">🏆 Leaderboard</h1>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-900 rounded-lg p-6 border border-blue-600/30">
            <div className="flex items-center">
              <div className="p-2 bg-blue-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
           
    
          

         

        
          
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;