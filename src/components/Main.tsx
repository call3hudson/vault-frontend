import React from 'react'
import { Link } from '@mui/material'
import SwipeableViews from 'react-swipeable-views'
import { useTheme } from '@mui/material/styles'
import Grid from '@mui/material/Grid'
import AppBar from '@mui/material/AppBar'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'
import Fab from '@mui/material/Fab'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import CircularProgress from '@mui/material/CircularProgress'

import InboxIcon from '@mui/icons-material/Inbox'
import OutboxIcon from '@mui/icons-material/Outbox'
import WalletIcon from '@mui/icons-material/Wallet'
import ChangeCircle from '@mui/icons-material/ChangeCircle'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin'
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange'

import { ethers } from 'ethers'

import Deposit from './Deposit'
import Withdraw from './Withdraw'

import { vault } from '../contracts/Vault'

interface TabPanelProps {
  children?: React.ReactNode
  dir?: string
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  }
}

export default function FullWidthTabs() {
  const theme = useTheme()
  const [state, setState] = React.useState({
    isOpened: false,
    isLoading: true,
    tabIndex: 0,
    selectedAddress: '',
    APY: 0,
    TVL: '0',
    price: 0,
  })

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setState({ ...state, tabIndex: newValue })
  }

  const handleChangeIndex = (index: number) => {
    setState({ ...state, tabIndex: index })
  }

  const connectWallet = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum)
    await provider
      .send('eth_requestAccounts', [])
      .then((accounts: any) => {
        setState({ ...state, selectedAddress: accounts[0] })
      })
      .catch((err: any) => {})
  }

  const switchToSepolia = async () => {
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [
          {
            chainId: '0xAA36A7',
          },
        ],
      })
    } catch (switchError: object) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xAA36A7',
                chainName: 'Sepolia testnet',
                rpcUrls: [
                  'https://rpc.sepolia.org',
                  'https://api.zan.top/node/v1/eth/sepolia/public',
                  'https://eth-sepolia.public.blastapi.io',
                ],
              },
            ],
          })
        } catch (addError) {}
      }
    }
  }

  React.useEffect(() => {
    const initFunc = async () => {
      const accounts = await ethereum.request({ method: 'eth_accounts' })
      if (accounts.length) {
        const chainId = await ethereum.request({ method: 'eth_chainId' })
        if (chainId != 11155111) {
          setState({
            ...state,
            isOpened: true,
            isLoading: false,
          })
        } else {
          await vault(window.ethereum)
            .annualPercentageRate()
            .then(async (apy: number) => {
              await vault(window.ethereum)
                .totalValueLocked()
                .then(async (tvl: number) => {
                  await vault(window.ethereum)
                    .price()
                    .then(async (price: number) => {
                      setState({
                        ...state,
                        selectedAddress: accounts[0],
                        APY: apy,
                        TVL: tvl.toString().slice(0, -18),
                        price: Number(price.toString().slice(0, -14)) / 10000,
                        isOpened: false,
                        isLoading: false,
                      })
                    })
                    .catch(console.log)
                })
                .catch(console.log)
            })
            .catch(console.log)
        }
      } else {
        console.log('Metamask is not connected')
        setState({
          ...state,
          isLoading: false,
        })
      }

      ethereum.on('chainChanged', () => {
        window.location.reload()
      })

      ethereum.on('accountsChanged', (accounts: any) => {
        window.location.reload()
      })
    }

    initFunc()
  }, [])

  return (
    <>
      <Dialog
        open={state.isOpened}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Switch To Sepolia Testnet
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            style={{ marginBottom: 20 }}
          >
            The Vault contract currently deployed on Sepolia Testnet. To
            continue, please switch to the Sepolia testnet.
            <Link target={'www.ethereum.org'}>olia testnet.</Link>
          </DialogContentText>
        </DialogContent>
      </Dialog>
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justifyContent="center"
        sx={{ minHeight: '100vh', background: 'transparent' }}
      >
        <Fab
          disabled={state.selectedAddress !== ''}
          variant="extended"
          sx={{
            position: 'fixed',
            top: 20,
            right: 20,
          }}
          onClick={state.isOpened ? switchToSepolia : connectWallet}
        >
          {state.isLoading ? (
            <CircularProgress
              size={35}
              sx={{
                color: 'grey',
                position: 'absolute',
                left: 11,
                zIndex: 1,
              }}
            />
          ) : (
            <></>
          )}
          {state.isOpened == true ? (
            <ChangeCircle sx={{ mr: 1 }} />
          ) : (
            <WalletIcon sx={{ mr: 1 }} />
          )}
          {state.isOpened == true
            ? 'Switch To...'
            : state.selectedAddress !== ''
            ? `Connected: ${state.selectedAddress.substring(
                0,
                5
              )}...${state.selectedAddress.substring(19, 22)}`
            : 'Connect To Wallet'}
        </Fab>
        {state.isOpened == false ? (
          <>
            {state.selectedAddress === '' ? (
              <></>
            ) : (
              <Box
                disabled
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  boxShadow: 2,
                  borderRadius: 2,
                  width: 500,
                }}
              >
                <AppBar
                  position="static"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: 'black',
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                  }}
                >
                  <Tabs
                    value={state.tabIndex}
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="inherit"
                    variant="fullWidth"
                    aria-label="full width tabs example"
                    TabIndicatorProps={{
                      style: { backgroundColor: `rgba(0, 0, 0, 0.5)` },
                    }}
                  >
                    <Tab
                      icon={<InboxIcon />}
                      label="Deposit"
                      {...a11yProps(0)}
                    />
                    <Tab
                      icon={<OutboxIcon />}
                      label="Withdraw"
                      {...a11yProps(1)}
                    />
                  </Tabs>
                </AppBar>
                <SwipeableViews
                  axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                  index={state.tabIndex}
                  onChangeIndex={handleChangeIndex}
                >
                  <TabPanel
                    value={state.tabIndex}
                    index={0}
                    dir={theme.direction}
                  >
                    <Deposit />
                  </TabPanel>
                  <TabPanel
                    value={state.tabIndex}
                    index={1}
                    dir={theme.direction}
                  >
                    <Withdraw />
                  </TabPanel>
                </SwipeableViews>
                <BottomNavigation
                  showLabels
                  style={{
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8,
                  }}
                >
                  <BottomNavigationAction
                    disabled
                    label={`${state.APY}%`}
                    icon={<TrendingUpIcon />}
                  />
                  <BottomNavigationAction
                    disabled
                    label={`${state.TVL} Dai`}
                    icon={<CurrencyBitcoinIcon />}
                  />
                  <BottomNavigationAction
                    disabled
                    label={`${state.price} Dai`}
                    icon={<CurrencyExchangeIcon />}
                  />
                </BottomNavigation>
              </Box>
            )}
          </>
        ) : (
          <></>
        )}
      </Grid>
    </>
  )
}
