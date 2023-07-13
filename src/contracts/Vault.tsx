import { ethers } from 'ethers'

const address_vault = '0xE6d15fDe825377FD6295738856aF18fb40Ef3c6c'

const abi_vault = [
  'function deposit(uint256)',
  'function withdraw(uint256)',
  'function price() view returns (uint)',
  'function totalValueLocked() view returns (uint)',
  'function annualPercentageRate() view returns (uint)',
  'function balanceOf(address) view returns (uint)',
]

const vault = (ethereum: any) => {
  return new ethers.Contract(
    address_vault,
    abi_vault,
    new ethers.BrowserProvider(ethereum)
  )
}

const ivault = () => {
  return new ethers.Interface(abi_vault)
}

export { vault, ivault }
