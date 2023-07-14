import React from 'react'

import Box from '@mui/material/Box'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Input from '@mui/material/Input'
import ArrowUpwardRounded from '@mui/icons-material/ArrowUpwardRounded'
import ArrowDownwardRounded from '@mui/icons-material/ArrowDownwardRounded'
import InboxIcon from '@mui/icons-material/Inbox'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'

import { ethers } from 'ethers'

import { dai, idai } from '../contracts/Dai'
import { vault, ivault } from '../contracts/Vault'

const Deposit = () => {
  const [state, setState] = React.useState({
    daiBalance: 0,
    daiAllowance: 0,
    price: 0,
    daiAmount: 0,
    vDaiAmount: 0,
    inProgress: false,
  })

  const interact = async () => {
    const accounts = await ethereum.request({ method: 'eth_accounts' })
    setState({
      ...state,
      inProgress: true,
    })
    if (state.daiAmount > state.daiAllowance) {
      ethereum
        .request({
          method: 'eth_sendTransaction',
          params: [
            {
              from: accounts[0],
              to: '0x809a28479C4786890F7590fbCa7a9764F2D22211',
              data: idai().encodeFunctionData('approve', [
                '0xE6d15fDe825377FD6295738856aF18fb40Ef3c6c',
                ethers.parseEther(state.daiAmount.toString()),
              ]),
            },
          ],
        })
        .then((result: any) => {
          setState({
            ...state,
            inProgress: false,
          })
        })
        .catch(() => {
          setState({
            ...state,
            inProgress: false,
          })
        })
    } else {
      ethereum
        .request({
          method: 'eth_sendTransaction',
          params: [
            {
              from: accounts[0],
              to: '0xE6d15fDe825377FD6295738856aF18fb40Ef3c6c',
              data: ivault().encodeFunctionData('deposit', [
                ethers.parseEther(state.daiAmount.toString()),
              ]),
            },
          ],
        })
        .then((result: any) => {
          setState({
            ...state,
            inProgress: false,
          })
        })
        .catch(() => {
          setState({
            ...state,
            inProgress: false,
          })
        })
    }
  }

  const setDaiValue = (e: any) => {
    if (e.target.value > state.daiBalance)
      setState({ ...state, daiAmount: state.daiBalance })
    else setState({ ...state, daiAmount: e.target.value })
  }

  React.useEffect(() => {
    setState({ ...state, vDaiAmount: state.daiAmount / state.price })
  }, [state.daiAmount])

  React.useEffect(() => {
    const initFunc = async () => {
      const accounts = await ethereum.request({ method: 'eth_accounts' })

      await dai(window.ethereum)
        .allowance(accounts[0], '0xE6d15fDe825377FD6295738856aF18fb40Ef3c6c')
        .then(async (allowance: number) => {
          await dai(window.ethereum)
            .balanceOf(accounts[0])
            .then(async (daiBalance: number) => {
              await vault(window.ethereum)
                .price()
                .then((price: number) => {
                  setState({
                    ...state,
                    price: Number(price.toString().slice(0, -14)) / 10000,
                    daiBalance:
                      Number(daiBalance.toString().slice(0, -16)) / 100,
                    daiAllowance:
                      Number(allowance.toString().slice(0, -16)) / 100,
                  })
                })
                .catch(console.log)
            })
            .catch(console.log)
        })
        .catch(console.log)
    }

    initFunc()
  }, [])

  return (
    <Box sx={{ '& > :not(style)': { m: 1 } }}>
      <Alert variant="filled">{`You've got ${state.daiBalance} Dai with ${state.daiAllowance} approval`}</Alert>
      <br />
      <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
        <ArrowUpwardRounded sx={{ color: 'white', mr: 1, my: 0.5 }} />
        <TextField
          fullWidth
          type="number"
          id="input-with-sx"
          label="Input Dai Amount Here"
          variant="standard"
          InputLabelProps={{
            style: { color: '#fff' },
          }}
          sx={{
            '& .MuiInput-underline:before': { borderBottomColor: 'white' },
            '& .MuiInput-underline:after': { borderBottomColor: 'white' },
            input: { color: 'white', borderColor: 'white' },
          }}
          value={state.daiAmount}
          onChange={setDaiValue}
        />
      </Box>
      <br />
      <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
        <ArrowDownwardRounded sx={{ color: 'white', mr: 1, my: 0.5 }} />
        <FormControl disabled variant="standard">
          <InputLabel htmlFor="component-disabled" style={{ color: '#fff' }}>
            Expected vDai Amount
          </InputLabel>
          <Input id="component-disabled" value={state.vDaiAmount} />
        </FormControl>
      </Box>
      <br />
      <Button
        disabled={state.inProgress || state.daiAmount == 0}
        variant="contained"
        startIcon={
          state.daiAmount <= state.daiAllowance ? (
            <InboxIcon />
          ) : (
            <ThumbUpIcon />
          )
        }
        onClick={interact}
        color={state.daiAmount <= state.daiAllowance ? 'success' : 'secondary'}
      >
        {state.daiAmount <= state.daiAllowance ? 'Deposit' : 'Approve'}
      </Button>
    </Box>
  )
}

export default Deposit
