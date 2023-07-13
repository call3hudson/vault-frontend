import { ethers } from 'ethers'

const address_dai = '0x809a28479C4786890F7590fbCa7a9764F2D22211'

const abi_dai = [
  'function balanceOf(address) view returns (uint)',
  'function allowance(address owner, address spender) view returns (uint)',
  'function approve(address spender, uint256 amount) returns (bool)',
]

const dai = (ethereum: any) => {
  return new ethers.Contract(
    address_dai,
    abi_dai,
    new ethers.BrowserProvider(ethereum)
  )
}

const idai = () => {
  return new ethers.Interface(abi_dai)
}

export { dai, idai }
