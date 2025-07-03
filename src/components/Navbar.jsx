import React from 'react'

import { useAccount, useConnect, useDisconnect } from "wagmi"
import { metaMask } from 'wagmi/connectors';

const connectors = [metaMask()]

export const ConnectButton = () => {
    const { address } = useAccount()
    const { connect } = useConnect()
    const { disconnect } = useDisconnect()
  
    return (
      <div className="flex items-center gap-2">
        {address ? (
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-mono bg-blue-600 px-3 py-1 rounded-lg">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
            <button 
              onClick={() => disconnect()}
              className="btn btn-error btn-sm text-white"
            >
              Disconnect
            </button>
          </div>
        ) : (
          connectors.map((connector) => (
            <button 
              key={connector.uid} 
              onClick={() => connect({ connector })}
              className="btn btn-primary btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none"
            >
              {connector.name || 'Connect MetaMask'}
            </button>
          ))
        )}
      </div>
    )
  }

const Navbar = () => {
  return (
    <div className="navbar bg-black shadow-lg border-b border-blue-600">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden text-white hover:bg-gray-800">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-black border border-blue-600 rounded-box w-52">
            <li><a href="/marketplace" className="text-white hover:bg-blue-600">Marketplace</a></li>
            <li><a href="/list" className="text-white hover:bg-blue-600">Products</a></li>
            <li><a href="/my" className="text-white hover:bg-blue-600">My Products</a></li>
          </ul>
        </div>
        <a href="/" className="btn btn-ghost text-xl font-bold text-white hover:bg-gray-800">MetaMarket</a>
      </div>
      
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li><a href="/marketplace" className="text-white hover:bg-blue-600 font-medium">Marketplace</a></li>
          <li><a href="/list" className="text-white hover:bg-blue-600 font-medium">List</a></li>
          <li><a href="/my" className="text-white hover:bg-blue-600 font-medium">My Products</a></li>
          <li><a href="/leaderboard" className="text-white hover:bg-blue-600 font-medium">Leaderboard</a></li>
        </ul>
      </div>
      
      <div className="navbar-end">
        <ConnectButton />
      </div>
    </div>
  )
}

export default Navbar