import React from 'react'

import { useAccount, useConnect, useDisconnect } from "wagmi"

export const ConnectButton = () => {
    const { address } = useAccount()
    const { connectors, connect } = useConnect()
    const { disconnect } = useDisconnect()
  
    return (
      <div>
        {address ? (
          <button 
            onClick={() => disconnect()}
            className="btn btn-primary btn-sm"
          >
            Disconnect
          </button>
        ) : (
          connectors.map((connector) => (
            <button 
              key={connector.uid} 
              onClick={() => connect({ connector })}
              className="btn btn-primary btn-sm"
            >
              {connector.name}
            </button>
          ))
        )}
      </div>
    )
  }

const Navbar = () => {
  return (
    <div className="navbar bg-base-100 shadow-lg">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li><a href="#products">Products</a></li>
            <li><a href="#my-products">My Products</a></li>
          </ul>
        </div>
        <a className="btn btn-ghost text-xl font-bold">MetaMarket</a>
      </div>
      
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li><a href="#products" className="font-medium">Products</a></li>
          <li><a href="#my-products" className="font-medium">My Products</a></li>
        </ul>
      </div>
      
      <div className="navbar-end">
        <ConnectButton />
      </div>
    </div>
  )
}

export default Navbar