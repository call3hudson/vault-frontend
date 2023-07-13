import React from 'react'

import Box from '@mui/material/Box'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Input from '@mui/material/Input'
import ArrowUpwardRounded from '@mui/icons-material/ArrowUpwardRounded'
import ArrowDownwardRounded from '@mui/icons-material/ArrowDownwardRounded'
import OutboxIcon from '@mui/icons-material/Outbox'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'

import { vault } from '../contracts/Vault'

const Withdraw = () => {
  const [state, setState] = React.useState({
    vDaiBalance: 0,
    price: 0,
    daiAmount: 0,
    vDaiAmount: 0,
  })

  const withdraw = async () => {}

  const setvDaiValue = (e: any) => {
    if (e.target.value > state.vDaiBalance)
      setState({ ...state, vDaiAmount: state.vDaiBalance })
    else setState({ ...state, vDaiAmount: e.target.value })
  }

  React.useEffect(() => {
    setState({ ...state, daiAmount: state.vDaiAmount * state.price })
  }, [state])

  React.useEffect(() => {
    const initFunc = async () => {
      const accounts = await ethereum.request({ method: 'eth_accounts' })
      await vault(window.ethereum)
        .balanceOf(accounts[0])
        .then(async (daiBalance: number) => {
          await vault(window.ethereum)
            .price()
            .then((price: number) => {
              setState({
                ...state,
                price: Number(price.toString().slice(0, -14)) / 10000,
                vDaiBalance: Number(daiBalance.toString().slice(0, -18)),
              })
            })
            .catch(console.log)
        })
        .catch(console.log)
    }

    initFunc()
  }, [])

  return (
    <Box sx={{ '& > :not(style)': { m: 1 } }}>
      <Alert
        severity="info"
        variant="filled"
      >{`You've got ${state.vDaiBalance} vDai`}</Alert>
      <br />
      <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
        <ArrowUpwardRounded sx={{ color: 'white', mr: 1, my: 0.5 }} />
        <TextField
          fullWidth
          type="number"
          id="input-with-sx"
          label="Input vDai Amount Here"
          variant="standard"
          InputLabelProps={{
            style: { color: '#fff' },
          }}
          sx={{
            '& .MuiInput-underline:before': { borderBottomColor: 'white' },
            '& .MuiInput-underline:after': { borderBottomColor: 'white' },
            input: { color: 'white', borderColor: 'white' },
          }}
          value={state.vDaiAmount}
          onChange={setvDaiValue}
        />
      </Box>
      <br />
      <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
        <ArrowDownwardRounded sx={{ color: 'white', mr: 1, my: 0.5 }} />
        <FormControl disabled variant="standard">
          <InputLabel htmlFor="component-disabled" style={{ color: '#fff' }}>
            Expected Dai Amount
          </InputLabel>
          <Input id="component-disabled" value={state.daiAmount} />
        </FormControl>
      </Box>
      <br />
      <Button
        variant="contained"
        startIcon={<OutboxIcon />}
        onClick={withdraw}
        color="info"
      >
        Withdraw
      </Button>
    </Box>
  )
}

export default Withdraw
