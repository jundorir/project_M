import { digitWei, computeSymbolToWei, computeWeiToSymbol } from "./common";
import loading from "@utils/loading";

import chain from "../store/chain";
import lang from "../store/lang";
import {
  assignToken as assignTokenAbi,
  netDB as netDBAbi,
  pledge as pledgeAbi,
  WfilErc20 as WfilErc20Abi,
  BaseERC20 as BaseERC20Abi,
  MMRERC20 as MMRAbi,
  Board as BoardAbi,
  WmiswapV1Router01 as WmiswapV1Router01Abi,
  WmiswapV1RouterRead as WmiswapV1RouterReadAbi,
  LpMintPool as LpMintPoolAbi,
  powerMint as powerMintAbi,
  Shop as ShopAbi,
  minerToken as minerTokenAbi,
  subscribe as subscribeAbi,
  MMRLottery as MMRLotteryAbi,
  Mediation as MediationAbi,
  verifyMmrsOrUsdt as VerifyMmrsAndUsdtAbi,
  NewBoardMintPool as newBoradAbi,
  freedomList as MMRS_GRAbi,
  mmrsPledge as mmrs_pledgeAbi,
  FMTMintPool as FMTMintPoolAbi,
  FMTSubscribe as FMTSubscribeAbi,
  DaoCommit as DaoCommitAbi,
} from "../abi";
import { Toast } from "antd-mobile";

let web3_Provider = null;
if (typeof window.web3 !== "undefined") {
  web3_Provider = new window.Web3(window.web3.currentProvider);
  window.utils = web3_Provider.utils;
  window.web3_Provider = web3_Provider;
}

export async function getAccounts() {
  return window.ethereum?.request({ method: "eth_accounts" });
}

let Global_Contract = {};
let Contract = {
  AssignToken: "AssignToken",
  Pledge: "Pledge",
  BaseERC20: "BaseERC20",
  NetDB: "NetDB",
  MMR: "MMR",
  Board: "Board",
  WmiswapV1Router01: "WmiswapV1Router01",
  WmiswapV1RouterRead: "WmiswapV1RouterRead",
  LpMintPool: "LpMintPool",
  Shop: "Shop",
  TLpMintPool: "TLpMintPool",
  minerToken: "minerToken",
  subscribe: "subscribe",
  Lottery: "Lottery",
  Mediation: "Mediation",
  VerifyMmrsAndUsdt: "VerifyMmrsAndUsdt",
  newBorad: "newBorad",
  MMRS_GR: "MMRS_GR",
  mmrs_pledge: "mmrs_pledge",
  FMTMintPool: "FMTMintPool",
  FMTSubscribe: "FMTSubscribe",
  DaoCommit: "DaoCommit",
};
let Abi = {
  AssignToken: assignTokenAbi,
  Pledge: pledgeAbi,
  BaseERC20: BaseERC20Abi,
  NetDB: netDBAbi,
  MMR: MMRAbi,
  Board: BoardAbi,
  WmiswapV1Router01: WmiswapV1Router01Abi,
  WmiswapV1RouterRead: WmiswapV1RouterReadAbi,
  LpMintPool: LpMintPoolAbi,
  TLpMintPool: powerMintAbi,
  Shop: ShopAbi,
  minerToken: minerTokenAbi,
  subscribe: subscribeAbi,
  Lottery: MMRLotteryAbi,
  Mediation: MediationAbi,
  VerifyMmrsAndUsdt: VerifyMmrsAndUsdtAbi,
  newBorad: newBoradAbi,
  MMRS_GR: MMRS_GRAbi,
  mmrs_pledge: mmrs_pledgeAbi,

  FMTMintPool: FMTMintPoolAbi,
  FMTSubscribe: FMTSubscribeAbi,
  DaoCommit: DaoCommitAbi,
};

function getNowUserAddress() {
  return chain.address;
}

export function enable() {
  return new Promise((resolve, reject) => {
    if (typeof window.ethereum === "undefined") {
      console.log("MetaMask????????????!");
      return;
    }
    if (typeof window.web3 === "undefined") {
      console.log("????????????????????????Dapp?????????????????????");
      return;
    }
    if (window.ethereum.enable) {
      window.ethereum
        .enable()
        .then((accounts) => {
          resolve(accounts[0]);
        })
        .catch(function (reason) {
          reject(reason.message);
        });
      return;
    } else {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((accounts) => {
          resolve(accounts[0]);
        })
        .catch(function (reason) {
          reject(reason.message);
        });
    }
  });
}

function getContract(contractName, contractAddress) {
  if (contractAddress === undefined) {
    // console.log("contractName, contractAddress", contractName, contractAddress);
    Toast.info(lang.networkError);
    return null;
  }
  // console.log("web3_Provider", web3_Provider);
  if (web3_Provider === null) {
    if (typeof window.web3 !== "undefined") {
      web3_Provider = new window.Web3(window.web3.currentProvider);
      window.utils = web3_Provider.utils;
      window.web3_Provider = web3_Provider;
    }
  }
  if (web3_Provider === null) return null;
  if (
    [
      Contract.AssignToken,
      Contract.Pledge,
      Contract.BaseERC20,
      Contract.NetDB,
      Contract.MMR,
      Contract.Board,
      Contract.WmiswapV1Router01,
      Contract.WmiswapV1RouterRead,
      Contract.LpMintPool,
      Contract.Shop,
      Contract.IMinerToken,
      Contract.TLpMintPool,
      Contract.minerToken,
      Contract.subscribe,
      Contract.Lottery,
      Contract.Mediation,
      Contract.newBorad,
      Contract.VerifyMmrsAndUsdt,
      Contract.MMRS_GR,
      Contract.mmrs_pledge,
      Contract.FMTMintPool,
      Contract.FMTSubscribe,
      Contract.DaoCommit,
    ].includes(contractName)
  ) {
    if (!Global_Contract[contractName + contractAddress])
      Global_Contract[contractName + contractAddress] =
        new web3_Provider.eth.Contract(Abi[contractName], contractAddress);
    return Global_Contract[contractName + contractAddress];
  }
  return null;
}

function sendAsync(params, needLog = false) {
  //   loading.show();
  return new Promise((resolve, reject) => {
    window.ethereum.sendAsync(
      {
        method: "eth_sendTransaction",
        params: params,
        from: getNowUserAddress(),
      },
      function (err, result) {
        console.log("err: ", err, "result:", result);
        // return;
        loading.show();
        if (!!err) {
          reject(err);
          loading.hidden();
          return;
        }
        let a = null;
        if (result.error) {
          reject(result.error.message);
          if (!!a) clearInterval(a);
          loading.hidden();
          return;
        }
        if (result.result) {
          a = setInterval(() => {
            web3_Provider.eth
              .getTransactionReceipt(result.result)
              .then((res) => {
                // console.log("getTransactionReceipt ==>", res);
                if (res) {
                  loading.hidden();
                  clearInterval(a);
                  if (!needLog) {
                    resolve(res.status); // res.status true or false;
                  } else {
                    resolve({
                      status: res.status,
                      logs: res.logs,
                    }); // res.status true or false;
                  }
                } else {
                }
              });
          }, 200);
        }
      }
    );
  });
}

/**
 * ??????????????????
 * @returns
 */
export async function getMMRPageInfo() {
  const contract = getContract(
    Contract.AssignToken,
    chain.contractAddress?.assignTokenAddress
  );
  return new Promise((resolve) => {
    contract?.methods?.mmrPageInfo(getNowUserAddress()).call((err, result) => {
      if (err) {
        resolve(false);
      }
      if (result) {
        // console.log("getMMRPageInfo ===> ", result);
        resolve(result);
      }
    });
  });
}

/**
 * ????????????????????????
 * @returns
 */
export async function getParent(query = null) {
  const contract = getContract(
    Contract.NetDB,
    chain.contractAddress?.DBAddress
  );
  return new Promise((resolve) => {
    contract?.methods
      ?.getParent(query ? query : getNowUserAddress())
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          // console.log("getParent ===> ", result);
          resolve(result);
        }
      });
  });
}

/**
 * ??????????????????
 * @returns
 */
export async function bindParentAsync(parentAddress) {
  const contract = getContract(
    Contract.NetDB,
    chain.contractAddress?.DBAddress
  );
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.DBAddress,
      value: "0x0",
      data: contract?.methods
        ?.bindParent(getNowUserAddress(), parentAddress)
        .encodeABI(),
    },
  ];
  return sendAsync(params);
}

/**
 * ??????????????????
 * @returns
 */
export function approve(TokenAddress, contractAddress) {
  const contract = getContract(Contract.BaseERC20, TokenAddress);
  let params = [
    {
      from: getNowUserAddress(),
      to: TokenAddress,
      value: "0x0",
      data: contract?.methods
        ?.approve(
          contractAddress,
          web3_Provider.utils.toHex(
            web3_Provider.utils.toBN("1000000000000000000000000000000000")
          )
        )
        .encodeABI(),
    },
  ];
  return sendAsync(params, true);
}

/**
 * ??????????????????????????????
 * @returns
 */
export function allowance(TokenAddress, contractAddress) {
  const contract = getContract(Contract.BaseERC20, TokenAddress);
  return new Promise((resolve) => {
    contract?.methods
      ?.allowance(getNowUserAddress(), contractAddress)
      .call((err, result) => {
        if (err) {
          resolve(-1);
        }
        // console.log("allowance result ====> ", result);
        if (result < 10000000000000000000000000000000) {
          resolve(false);
        } else {
          resolve(result);
        }
      });
  });
}

window.queryAllowance = queryAllowance;
export async function queryAllowance({ type, symbol, round = 1 }) {
  const map = {
    Pledge: chain.contractAddress?.pledgeAddress,
    AssignToken: chain.contractAddress?.assignTokenAddress,
    Router1: chain.contractAddress?.Router1Address,
    Board: chain.contractAddress?.BoardAddress,
    LpMintPool: chain.contractAddress?.lppoolAddress,
    TLpPool: chain.contractAddress?.[`Tlp${round}poolAddress`],
    Shop: chain.contractAddress?.ShopAddress,
    NewShop: chain.contractAddress?.newShop,
    minerToken: chain.contractAddress?.minerTokenAddress,
    subscribe: chain.contractAddress?.[`Subscribe${round}Address`],
    Lottery: chain.contractAddress?.LotteryAddress,
    Mediation: chain.contractAddress?.mediation,
    newBorad: chain.contractAddress?.newBorad,
    MMRS_GR: chain.contractAddress?.MMRS_GR,
    mmrs_pledge: chain.contractAddress?.mmrs_pledge,
    DaoCommit: chain.contractAddress?.DaoCommit,
  };
  const TokenAddress = chain.contractAddress.currencyMap?.[symbol];
  const contractAddress = map[type];
  const contract = getContract(Contract.BaseERC20, TokenAddress);

  const result = await new Promise((resolve) => {
    contract?.methods
      ?.allowance(getNowUserAddress(), contractAddress)
      .call((err, result) => {
        if (err) {
          resolve(-1);
        }
        resolve(result);
      });
  });
  // console.log("result ====> ", result);
  return result / Math.pow(10, 18);
}

/**
 * ????????????????????????????????????
 * @param {*} type 1??????MediaAddress,2??????MarketAddress
 * @param {*} TokenAddress ?????????U??????,????????????????????????
 * @returns
 */
window.isApproveFlow = isApproveFlow;
export async function isApproveFlow({ type, symbol, round = 1 }) {
  const map = {
    Pledge: chain.contractAddress?.pledgeAddress,
    AssignToken: chain.contractAddress?.assignTokenAddress,
    Router1: chain.contractAddress?.Router1Address,
    Board: chain.contractAddress?.BoardAddress,
    LpMintPool: chain.contractAddress?.lppoolAddress,
    TLpPool: chain.contractAddress?.[`Tlp${round}poolAddress`],
    Shop: chain.contractAddress?.ShopAddress,
    minerToken: chain.contractAddress?.minerTokenAddress,
    Lottery: chain.contractAddress?.LotteryAddress,
    Mediation: chain.contractAddress?.mediation,
    newBorad: chain.contractAddress?.newBorad,
    MMRS_GR: chain.contractAddress?.MMRS_GR,
    mmrs_pledge: chain.contractAddress?.mmrs_pledge,
    NewShop: chain.contractAddress?.newShop,
    subscribe: chain.contractAddress?.[`Subscribe${round}Address`],
    DaoCommit: chain.contractAddress?.DaoCommit,
  };

  try {
    let isAllowance = await allowance(
      chain.contractAddress.currencyMap?.[symbol],
      map[type]
    );
    if (isAllowance) {
      return {
        status: true,
        approveAmount: isAllowance / Math.pow(10, 18),
      };
    }

    let { status, logs } = await approve(
      chain.contractAddress.currencyMap?.[symbol],
      map[type]
    );
    if (status) {
      return {
        status: status,
        approveAmount: logs[0].data / Math.pow(10, 18),
      };
    }
  } catch (e) {
    return {
      status: false,
      approveAmount: 0,
    };
  }
}

/**
 * ????????????????????????
 * @param {*} TokenAddress
 */
export async function getBalanceAsync(symbol = "AFIL") {
  // console.log("symbol", symbol);
  //USDTAddress

  const TokenAddress = chain.contractAddress.currencyMap?.[symbol];
  // console.log("TokenAddress", TokenAddress);
  const contract = getContract(Contract.BaseERC20, TokenAddress);
  return new Promise((resolve) => {
    contract?.methods?.balanceOf(getNowUserAddress()).call((err, result) => {
      if (err) {
        resolve(false);
      }
      if (result) {
        resolve(computeWeiToSymbol(result, 4));
      }
    });
  });
}
window.getBalanceAsyncTest = getBalanceAsyncTest;
export async function getBalanceAsyncTest(symbol = "AFIL") {
  // console.log("symbol", symbol);
  //USDTAddress
  const TokenAddress = chain.contractAddress.currencyMap?.[symbol];
  // console.log("TokenAddress", TokenAddress);
  const contract = getContract(Contract.BaseERC20, TokenAddress);
  return new Promise((resolve) => {
    contract?.methods?.balanceOf(getNowUserAddress()).call((err, result) => {
      if (err) {
        resolve(false);
      }
      if (result) {
        resolve(computeWeiToSymbol(result, 4));
      }
    });
  });
}

/**
 * swap from afil to wami
 * @param {*} amount
 * @returns
 */
export async function depositInPledge(amount) {
  const contract = getContract(
    Contract.Pledge,
    chain.contractAddress?.pledgeAddress
  );
  let wei = computeSymbolToWei(amount);
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.pledgeAddress,
      value: "0x0",
      data: contract?.methods
        ?.deposit(web3_Provider.utils.toHex(web3_Provider.utils.toBN(wei)))
        .encodeABI(),
    },
  ];
  return sendAsync(params);
}

export async function getOutfeeInPledge() {
  const contract = getContract(
    Contract.Pledge,
    chain.contractAddress?.pledgeAddress
  );

  return new Promise((resolve) => {
    contract?.methods?.getOutfee().call((err, result) => {
      if (err) {
        resolve(false);
      }
      if (result) {
        // console.log("getOutfeeInPledge ===>", result);
        resolve(result);
      }
    });
  });
}

/**
 * swap from wami to afil
 * @param {*} amount
 * @returns
 */
export async function withDrawInPledge(amount) {
  const contract = getContract(
    Contract.Pledge,
    chain.contractAddress?.pledgeAddress
  );
  let wei = computeSymbolToWei(amount);
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.pledgeAddress,
      value: "0x0",
      data: contract?.methods
        ?.withDraw(web3_Provider.utils.toHex(web3_Provider.utils.toBN(wei)))
        .encodeABI(),
    },
  ];
  return sendAsync(params);
}

/**
 * ????????????
 * @param {*} amount
 * @returns
 */
export async function depositInAssignToken(amount, planId) {
  // console.log("amount=====>", amount, planId);
  const contract = getContract(
    Contract.AssignToken,
    chain.contractAddress?.assignTokenAddress
  );
  let wei = computeSymbolToWei(amount);
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.assignTokenAddress,
      value: "0x0",
      data: contract?.methods
        ?.depositByPeriod(
          web3_Provider.utils.toHex(web3_Provider.utils.toBN(wei)),
          planId
        )
        .encodeABI(),
    },
  ];
  return sendAsync(params);
}

/**
 * ?????????????????????
 * @param {*} amount
 * @returns
 */
export async function withDrawInAssignToken(percent, id) {
  // console.log("percent, idpercent, id", percent, id);
  const contract = getContract(
    Contract.AssignToken,
    chain.contractAddress?.assignTokenAddress
  );
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.assignTokenAddress,
      value: "0x0",
      data: contract?.methods?.withDrawById(percent, id).encodeABI(),
    },
  ];
  return sendAsync(params);
}

/**
 *
 * @returns ??????????????????
 */
export async function rewardInAssignToken() {
  const contract = getContract(
    Contract.AssignToken,
    chain.contractAddress?.assignTokenAddress
  );
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.assignTokenAddress,
      value: "0x0",
      data: contract?.methods?.reward().encodeABI(),
    },
  ];
  return sendAsync(params);
}

/**
 * ????????????????????????
 * @returns ????????????????????????
 */
window.queryAmountFilBeClaimedInAssignToken =
  queryAmountFilBeClaimedInAssignToken;
export async function queryAmountFilBeClaimedInAssignToken() {
  const contract = getContract(
    Contract.AssignToken,
    chain.contractAddress?.assignTokenAddress
  );

  return new Promise((resolve) => {
    contract?.methods
      ?.amountFilBeClaimed(getNowUserAddress())
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          // console.log('queryAmountFilBeClaimedInAssignToken ===>', result)
          resolve(result);
        }
      });
  });
}
/**
 * ????????????????????????
 * @returns ??????????????????
 */
export async function getCurPerUintReward() {
  const contract = getContract(
    Contract.AssignToken,
    chain.contractAddress?.assignTokenAddress
  );
  return new Promise((resolve) => {
    contract?.methods?.curPerUintReward().call((err, result) => {
      if (err) {
        resolve(false);
      }
      if (result) {
        resolve(Number(digitWei(result, 36)));
      }
    });
  });
}

export async function getAmountReceived() {
  const contract = getContract(
    Contract.AssignToken,
    chain.contractAddress?.assignTokenAddress
  );
  return new Promise((resolve) => {
    contract?.methods
      ?.amountReceived(getNowUserAddress())
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          resolve(result);
        }
      });
  });
}

window.getMMRBalanceAsync = getMMRBalanceAsync;
export async function getMMRBalanceAsync(
  symbol = "MMR",
  address = chain.contractAddress?.assignTokenAddress
) {
  // console.log("TokenAddress", chain.contractAddress.currencyMap?.[symbol]);
  const TokenAddress = chain.contractAddress.currencyMap?.[symbol];
  const contract = getContract(Contract.MMR, TokenAddress);
  return new Promise((resolve) => {
    contract?.methods?.balanceOf(address).call((err, result) => {
      if (err) {
        resolve(false);
      }
      if (result) {
        resolve(computeWeiToSymbol(result, 4));
      }
    });
  });
}

//?????????????????????
export async function getCurrentBlock() {
  const blockNumber = await web3_Provider.eth.getBlockNumber();
  return blockNumber;
}
//????????????????????????
export async function getBlockgTime() {
  const blockNumber = await web3_Provider.eth.getBlockNumber();
  const blockTime = await web3_Provider.eth.getBlock(blockNumber);
  return blockTime.timestamp;
}

/**
 *
 * @returns ???????????????????????????
 */
export async function getEthBalanceAsync() {
  const balance = await web3_Provider.eth.getBalance(getNowUserAddress());
  return balance;
}

//new function ?????????????????????
/**
 *
 * ?????????_??????MMR
 */
export async function DAOReward(address) {
  const contract = getContract(
    Contract.Board,
    chain.contractAddress?.BoardAddress
  );
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.BoardAddress,
      value: "0x0",
      data: contract?.methods?.Reward(address).encodeABI(),
    },
  ];
  return sendAsync(params);
}
/**
 *
 * ?????????_???????????????
 */
export async function getIncome() {
  const contract = getContract(
    Contract.Board,
    chain.contractAddress?.BoardAddress
  );
  return new Promise((resolve) => {
    contract?.methods
      ?.amountBeClaimed(getNowUserAddress())
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          // console.log('result----------->', result)
          resolve(computeWeiToSymbol(result[0], 4));
        }
      });
  });
}
/**
 *
 * ?????????_???????????????
 */
export async function getTotalIncome() {
  const contract = getContract(
    Contract.Board,
    chain.contractAddress?.BoardAddress
  );
  return new Promise((resolve) => {
    contract?.methods
      ?._rewardHadReceive(getNowUserAddress())
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          // console.log("------------------>", result);
          resolve(computeWeiToSymbol(result, 4));
        }
      });
  });
}
/**
 *
 * ?????????_???????????????????????????
 */
export async function hasPledged() {
  const contract = getContract(
    Contract.Board,
    chain.contractAddress?.BoardAddress
  );
  return new Promise((resolve) => {
    contract?.methods?._userPowers(getNowUserAddress()).call((err, result) => {
      if (err) {
        resolve(false);
      }
      if (result) {
        resolve(result);
      }
    });
  });
}
/**
 *
 * ?????????_?????????????????????
 */
export async function totalHasPledged() {
  const contract = getContract(
    Contract.Board,
    chain.contractAddress?.BoardAddress
  );
  return new Promise((resolve) => {
    contract?.methods?._totalPower().call((err, result) => {
      if (err) {
        resolve(false);
      }
      if (result) {
        resolve(computeWeiToSymbol(result, 4));
      }
    });
  });
}
/**
 *
 * ?????????_??????????????????MMR
 */
export async function redeemable() {
  const contract = getContract(
    Contract.Board,
    chain.contractAddress?.BoardAddress
  );
  return new Promise((resolve) => {
    contract?.methods
      ?.consultExtractedCopy(getNowUserAddress())
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          // console.log("?????????????????????MMR", result);
          const USDTResult = computeWeiToSymbol(result[0], 4);
          const MMRResult = computeWeiToSymbol(result[1], 4);
          resolve([USDTResult, MMRResult]);
        }
      });
  });
}
/**
 * ???????????????
 * @param {*} amount
 * @returns
 */
export async function toPledge(address, amount) {
  const contract = getContract(
    Contract.Board,
    chain.contractAddress?.BoardAddress
  );
  let wei = computeSymbolToWei(amount);
  // console.log(
  //   'chain.contractAddress?.BoardAddress----->',
  //   chain.contractAddress.BoardAddress
  // )
  // let wei = amount
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.BoardAddress,
      value: "0x0",
      data: contract?.methods
        ?.pledge(
          address,
          web3_Provider.utils.toHex(web3_Provider.utils.toBN(wei))
        )
        .encodeABI(),
    },
  ];
  return sendAsync(params);
}
/**
 * ???????????????
 * @param {*} amount
 * @returns
 */
export async function DAORedeem(address, amount) {
  const contract = getContract(
    Contract.Board,
    chain.contractAddress?.BoardAddress
  );
  // let wei = computeSymbolToWei(amount)
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.BoardAddress,
      value: "0x0",
      data: contract?.methods
        ?.withDraw(
          address,
          web3_Provider.utils.toHex(web3_Provider.utils.toBN(amount))
        )
        .encodeABI(),
    },
  ];
  return sendAsync(params);
}
/**
 *
 * ?????????_?????????USDT_??????
 * ?????????_?????????MMR_??????
 */
export async function needUSDT(amount) {
  const contract = getContract(
    Contract.Board,
    chain.contractAddress?.BoardAddress
  );
  let wei = computeSymbolToWei(amount);
  return new Promise((resolve) => {
    contract?.methods
      ?.needMMrAmount(
        web3_Provider.utils.toHex(web3_Provider.utils.toBN(wei)),
        chain.contractAddress?.MmrAddress,
        chain.contractAddress?.UsdtAddress
      )
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          resolve(computeWeiToSymbol(result, 4));
        }
      });
  });
}
/**
 *
 * ?????????_????????????MMR
 */
export async function MMRhasPledged() {
  const contract = getContract(
    Contract.Board,
    chain.contractAddress?.BoardAddress
  );
  return new Promise((resolve) => {
    contract?.methods
      ?._userPowerByMMR(getNowUserAddress())
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          const data = result;
          // console.log("MMRhasPledged------WEB3------------>", result);
          resolve(data);
        }
      });
  });
}

/**
 *
 * ????????????_??????__minerToken??????
 */
export async function getTPrice(getAbiAddressResult) {
  const contract = getContract(Contract.minerToken, getAbiAddressResult);
  console.log("contract =====> ", contract);
  return new Promise((resolve) => {
    contract?.methods?.price().call((err, result) => {
      if (err) {
        resolve(false);
      }
      if (result) {
        resolve(computeWeiToSymbol(result, 4));
      }
    });
  });
}
/**
 * ??????MINERTOKEN??????MINER???????????????
 *
 */
export async function formMinerTokenToString(minerTokenAddr) {
  const contract = getContract(Contract.minerToken, minerTokenAddr);
  return new Promise((resolve) => {
    contract?.methods?.name().call((err, result) => {
      if (err) {
        resolve(false);
      }
      if (result) {
        resolve(result);
      }
    });
  });
}
/**
 * ????????????_????????????
 * @param {*} amount
 * @returns
 */
export async function toBuyTByRound(amount, round) {
  const TokenAddress = chain.contractAddress.currencyMap?.[`T${round}`];
  const data = await formMinerTokenToString(TokenAddress);

  const contractAddress =
    round > 4
      ? chain.contractAddress?.newShop
      : chain.contractAddress?.ShopAddress;

  const contract = getContract(Contract.Shop, contractAddress);
  let wei = computeSymbolToWei(amount);
  if (data) {
    let params = [
      {
        from: getNowUserAddress(),
        to: contractAddress,
        value: "0x0",
        data: contract?.methods
          ?.buyMinerToken(
            web3_Provider.utils.toHex(web3_Provider.utils.toBN(wei)),
            data
          )
          .encodeABI(),
      },
    ];
    return sendAsync(params);
  }
}

export async function rushTByRound(amount, round) {
  // rushPurchase

  const TokenAddress = chain.contractAddress.currencyMap?.[`T${round}`];
  const data = await formMinerTokenToString(TokenAddress);

  const contractAddress = chain.contractAddress?.newShop;

  const contract = getContract(Contract.Shop, contractAddress);
  let wei = computeSymbolToWei(amount);
  if (data) {
    let params = [
      {
        from: getNowUserAddress(),
        to: contractAddress,
        value: "0x0",
        data: contract?.methods
          ?.rushPurchase(
            web3_Provider.utils.toHex(web3_Provider.utils.toBN(wei)),
            data
          )
          .encodeABI(),
      },
    ];
    return sendAsync(params);
  }
}
/**
 * ????????????????????????
 */
export async function getTimeByRound(round) {
  const TokenAddress = chain.contractAddress.currencyMap?.[`T${round}`];
  const contract = getContract(Contract.minerToken, TokenAddress);
  return new Promise((resolve) => {
    contract?.methods?._SubscribeEndtime().call((err, result) => {
      if (err) {
        // console.log("??????");
        resolve(false);
      }
      if (result) {
        resolve(result);
      }
    });
  });
}
/**
 * ????????????????????????
 */
export async function getBuyEndTimeByRound(round) {
  const TokenAddress = chain.contractAddress.currencyMap?.[`T${round}`];

  const contract = getContract(Contract.minerToken, TokenAddress);
  return new Promise((resolve) => {
    contract?.methods?._BuyEndtime().call((err, result) => {
      if (err) {
        resolve(false);
      }
      if (result) {
        resolve(result);
      }
    });
  });
}

/**
 * ????????????_????????????
 */
export async function signUpByRound(round, amount = 0) {
  if (round > 4) return newSignUpByRound(round, amount);
  const Address = chain.contractAddress?.[`Subscribe${round}Address`];
  const contract = getContract(Contract.subscribe, Address);
  let params = [
    {
      from: getNowUserAddress(),
      to: Address,
      value: "0x0",
      data: contract?.methods?.subScribequal(getNowUserAddress()).encodeABI(),
    },
  ];
  return sendAsync(params);
}

/**
 * ????????????_????????????(???) ???5?????????(???)
 */
async function newSignUpByRound(round, amount) {
  const Address = chain.contractAddress?.[`Subscribe${round}Address`];
  const contract = getContract(Contract.FMTSubscribe, Address);
  const wei = computeSymbolToWei(amount);
  const weiHex = web3_Provider.utils.toHex(web3_Provider.utils.toBN(wei));
  let params = [
    {
      from: getNowUserAddress(),
      to: Address,
      value: "0x0",
      data: contract?.methods
        ?.subScribequal(getNowUserAddress(), weiHex)
        .encodeABI(),
    },
  ];
  return sendAsync(params);
}
/**
 * ????????????_??????????????????
 */
export async function getBiggestLimit(address, TAddr) {
  const contract = getContract(
    Contract.Shop,
    chain.contractAddress?.ShopAddress
  );
  const data = await formMinerTokenToString(TAddr);
  return new Promise((resolve) => {
    contract?.methods?.getUserBuyLimits(address, data).call((err, result) => {
      if (err) {
        resolve(false);
      }
      if (result) {
        resolve(computeWeiToSymbol(result, 4));
      }
    });
  });
}
/**
 * ????????????<????????????????????????????????????0?????????????????????????????????????????????0??????????????????
 */
export async function userAmountByRound(round) {
  const Address = chain.contractAddress?.[`Subscribe${round}Address`];
  let contractName = Contract.subscribe;
  if (round > 4) contractName = Contract.FMTSubscribe;
  const contract = getContract(contractName, Address);
  return new Promise((resolve) => {
    contract?.methods
      ?._userSubscribedAmount(getNowUserAddress())
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          resolve(computeWeiToSymbol(result, 4));
        }
      });
  });
}
/**
 * ?????????????????????????????????
 */
export async function totalSubscribeAmountByRound(round) {
  const Address = chain.contractAddress?.[`Subscribe${round}Address`];

  const contractName = round > 4 ? Contract.FMTSubscribe : Contract.subscribe;

  const contract = getContract(contractName, Address);
  return new Promise((resolve) => {
    contract?.methods?._totalSubscribeAmount().call((err, result) => {
      if (err) {
        resolve(false);
      }
      if (result) {
        resolve(computeWeiToSymbol(result, 4));
      }
    });
  });
}
/**
 * ???????????????MMR??????__????????????
 * round <= 4 ?????? ???????????????
 * round > 4  ?????? ?????????FM??????
 */
export async function getUserBoardPowerByRound(round) {
  const Address = chain.contractAddress?.[`Subscribe${round}Address`];

  const contractName = round > 4 ? Contract.FMTSubscribe : Contract.subscribe;

  const contract = getContract(contractName, Address);
  return new Promise((resolve) => {
    contract?.methods
      ?.getUserBoardPower(getNowUserAddress())
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          resolve(computeWeiToSymbol(result, 4));
        }
      });
  });
}
/**
 * ?????????????????????T
 */
export async function nowTBalanceByRound(round) {
  const Address = chain.contractAddress?.[`Subscribe${round}Address`];

  const contractName = round > 4 ? Contract.FMTSubscribe : Contract.subscribe;
  const contract = getContract(contractName, Address);

  return new Promise((resolve) => {
    contract?.methods
      ?._userBuyedAmount(getNowUserAddress())
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          // console.log('?????????????????????T', computeWeiToSymbol(result, 4))
          resolve(computeWeiToSymbol(result, 4));
        }
      });
  });
}
/**
 * ????????????????????????T
 */
export async function nowCanBuyByRound(round) {
  const TokenAddress = chain.contractAddress.currencyMap?.[`T${round}`];
  const data = await formMinerTokenToString(TokenAddress);

  const contractAddress =
    round > 4
      ? chain.contractAddress?.newShop
      : chain.contractAddress?.ShopAddress;

  const contract = getContract(Contract.Shop, contractAddress);
  return new Promise((resolve) => {
    contract?.methods
      ?.getUserBuyLimits(getNowUserAddress(), data)
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          // console.log('????????????????????????T', computeWeiToSymbol(result, 4))
          resolve(computeWeiToSymbol(result, 4));
        }
      });
  });
}

// _userBuyedAmount  ----subscrile?????????????????????T
// getUserBuyLimits  ----Shop  ???????????????????????? ????????????MINNERTOKEN??????

// assignToken abi  ===> mmrPageInfo ???????????? ????????? ???????????? ???????????????
// netDB abi  ===> bindParent ????????????
// netDB abi  ===> getParent ??????????????????

// baseERC20 abi ===> balanceOf ??????????????????
// baseERC20 abi ===> Approve ??????

// pledge abi ===> deposit ??????????????? ??? ??????????????? ?????????
// pledge abi ===> withDraw ??? ?????????????????? ???????????? ?????????
// pledge abi ===> getOutfee  ??????Swap?????????

// assignToken abi ===> depositByPeriod ?????????????????????
// assignToken abi ===> withDrawById  ????????????
// assignToken abi ===> reward ??????????????????
// assignToken abi ===> amountFilBeClaimed ????????????????????????
// assignToken abi ===> amountReceived ?????????????????????fil ???mmr

// ???????????? MMRERC20 abi ====> balanceOf

// window.getMMRPageInfo = getMMRPageInfo;
// window.getParent = getParent;
// window.bindParentAsync = bindParentAsync;
window.getBalanceAsync = getBalanceAsync;

// borad abi ====> Reward ???????????? ?????????
// borad abi ====> amountBeClaimed ???????????????  ?????????
// borad abi ====> _rewardHadReceive ?????????????????????  ?????????
// borad abi ====> pledge ??????  ?????????
// borad abi ====> withDraw ??????  ?????????
// borad abi ====> _userPowers ??????????????????????????? ?????????
// borad abi ====> _userPowers/_totalPower ?????????????????? ?????????
// borad abi ====> consultExtracted ??????????????????MMR
// borad abi ====> _pledgeMmrAmount ????????????MMR??????

// router1 abi ====> addLiquidity ??????????????? ?????????
// router1 abi ====> removeLiquidity ??????????????? ?????????
// router1 abi ====> swapExactTokensForTokens  ?????????USDT ?????? MMR ?????????(swap)
// router1 abi ====> swapTokensForExactTokens  ????????? MMR ?????? USDT  ?????????(swap)
// router1 abi ====> getAmountIn USDT ??? MMR  ?????? ?????????
// router1 abi ====> getAmountOut MMR ??? USDT ?????? ?????????
// router1 abi ====> getAmountsIn   ???????????????????????? ?????????
// router1 abi ====> getAmountsOut   ???????????????????????? ?????????

//
// lp ===> amountBeClaimed ???????????????
// lp ===> _rewardHadReceive ?????????????????????

// Shop ===> tokenAddr ????????????_??????_WFIL?????? ???????????????MMR??????
// minerToken ===> price ????????????_??????_??????
// Shop ===> TokenList_Length ????????????_?????? 1??????1???
// Shop ===> getTokenAddrByIndex  ???????????????1??????,?????????token???????????????token????????????(minerToken===>_SubscribeEndtime)
// minerToken ===> totalSupply ????????????_??????????????????
// subscribe ===> subScribequal ????????????_????????????
// Shop ===> buyMinerToken ????????????_???????????? ??????name:(minerToken??????name)
// Shop ===> getUserBuyLimits ??????????????????  ??????MINER1
// subscrible ===> _userSubscribedAmount ??????0???????????????????????? ??????0?????????????????????
// minerToken ===> _BuyEndtime ????????????????????????
// subscrible ===> _totalSubscribeAmount ???????????????????????????

export async function getAmountsInAsync(amount, from, to) {
  const contract = getContract(
    Contract.WmiswapV1Router01,
    chain.contractAddress?.Router1Address
  );
  const wei = computeSymbolToWei(amount);

  return new Promise((resolve) => {
    contract?.methods
      ?.getAmountsIn(web3_Provider.utils.toHex(web3_Provider.utils.toBN(wei)), [
        to,
        from,
      ])
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          resolve(computeWeiToSymbol(result, 4));
        }
      });
  });
}

export async function getAmountsOutAsync(amount, from, to) {
  const contract = getContract(
    Contract.WmiswapV1Router01,
    chain.contractAddress?.Router1Address
  );
  const wei = computeSymbolToWei(amount);
  return new Promise((resolve) => {
    contract?.methods
      ?.getAmountsOut(
        web3_Provider.utils.toHex(web3_Provider.utils.toBN(wei)),
        [from, to]
      )
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          resolve(result[1]);
        }
      });
  });
}

export async function queryComputeAmounts(amount, fromSymbol, toSymbol) {
  const FromTokenAddress = chain.contractAddress.currencyMap?.[fromSymbol];
  const ToTokenAddress = chain.contractAddress.currencyMap?.[toSymbol];
  // ?????????amount?????????toSymbol ???????????????fromSymbol
  // return getAmountsInAsync(amount, ToTokenAddress, FromTokenAddress);
  return getAmountsOutAsync(amount, FromTokenAddress, ToTokenAddress);
}

export async function swapUSDTAndMMR({ from, to, amount, minOut = 0 }) {
  const contract = getContract(
    Contract.WmiswapV1Router01,
    chain.contractAddress?.Router1Address
  );

  // console.log("minOut =====>>>>>>", minOut);

  const AMOUNT = computeSymbolToWei(amount);
  const MIN = computeSymbolToWei(minOut);

  const PATHS = [
    chain.contractAddress.currencyMap?.[from],
    chain.contractAddress.currencyMap?.[to],
  ];

  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.Router1Address,
      value: "0x0",
      data: contract?.methods
        ?.swapExactTokensForTokens?.(
          web3_Provider.utils.toHex(web3_Provider.utils.toBN(AMOUNT)),
          web3_Provider.utils.toHex(web3_Provider.utils.toBN(MIN)),
          PATHS,
          getNowUserAddress(),
          Math.floor(+new Date() / 1000) + 10 * 60
        )
        .encodeABI(),
    },
  ];

  return sendAsync(params);
}
/**
 * ???????????????
 */
export async function addLiquidityAsync(
  symbolA,
  symbolB,
  AAmount,
  BAmount,
  amountAMin = 0,
  amountBMin = 0
) {
  const contract = getContract(
    Contract.WmiswapV1Router01,
    chain.contractAddress?.Router1Address
  );
  const tokenAAddress = chain.contractAddress.currencyMap?.[symbolA];
  const tokenBAddress = chain.contractAddress.currencyMap?.[symbolB];
  // const AMOUNT = computeSymbolToWei(AAmount);
  // const BAMOUNT = computeSymbolToWei(BAmount);
  const to = getNowUserAddress();
  const deadline = Math.floor(+Date.now() / 1000) + 10 * 60;

  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.Router1Address,
      value: "0x0",
      data: contract?.methods
        ?.addLiquidity(
          tokenAAddress,
          tokenBAddress,
          web3_Provider.utils.toHex(web3_Provider.utils.toBN(AAmount)),
          web3_Provider.utils.toHex(web3_Provider.utils.toBN(BAmount)),
          amountAMin,
          amountBMin,
          to,
          deadline
        )
        .encodeABI(),
    },
  ];

  return sendAsync(params);
}
/**
 * ???????????????
 */
export async function removeLiquidityAsync(
  symbolA,
  symbolB,
  liquidityAmount,
  amountAMin = 0,
  amountBMin = 0
) {
  const contract = getContract(
    Contract.WmiswapV1Router01,
    chain.contractAddress?.Router1Address
  );

  const tokenAAddress = chain.contractAddress.currencyMap?.[symbolA];
  const tokenBAddress = chain.contractAddress.currencyMap?.[symbolB];
  const to = getNowUserAddress();
  const deadline = Math.floor(+Date.now() / 1000) + 10 * 60;
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.Router1Address,
      value: "0x0",
      data: contract?.methods
        ?.removeLiquidity(
          tokenAAddress,
          tokenBAddress,
          web3_Provider.utils.toHex(web3_Provider.utils.toBN(liquidityAmount)),
          amountAMin,
          amountBMin,
          to,
          deadline
        )
        .encodeABI(),
    },
  ];

  return sendAsync(params);
}

// routerread ===> getAllInfo ??????????????? ??????????????????, ????????????????????????, MMR, USDT???
// routerread ===> getLiquidityValueByToken  ??????????????????????????????
// routerread ===> getLiquidityValue  ???????????????????????????????????? ??????

export async function getAllInfoAsync(symbolA, symbolB) {
  const contract = getContract(
    Contract.WmiswapV1RouterRead,
    chain.contractAddress?.RouterReadAddress
  );

  const A_ADDRESS = chain.contractAddress.currencyMap?.[symbolA];
  const B_ADDRESS = chain.contractAddress.currencyMap?.[symbolB];

  return new Promise((resolve) => {
    contract?.methods
      ?.getAllInfo(A_ADDRESS, B_ADDRESS, getNowUserAddress())
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          resolve(result);
        }
      });
  });
}

export async function getLiquidityValueAsync(
  symbolA,
  symbolB,
  liquidityAmount
) {
  const contract = getContract(
    Contract.WmiswapV1RouterRead,
    chain.contractAddress?.RouterReadAddress
  );

  const A_ADDRESS = chain.contractAddress.currencyMap?.[symbolA];
  const B_ADDRESS = chain.contractAddress.currencyMap?.[symbolB];

  const bn = web3_Provider.utils.toHex(
    web3_Provider.utils.toBN(liquidityAmount)
  );

  return new Promise((resolve) => {
    contract?.methods
      ?.getLiquidityValue(A_ADDRESS, B_ADDRESS, bn)
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          resolve(result);
        }
      });
  });
}

export async function getLiquidityValueByTokenAsync(
  symbolA,
  symbolB,
  amountA,
  amountB
) {
  const contract = getContract(
    Contract.WmiswapV1RouterRead,
    chain.contractAddress?.RouterReadAddress
  );

  const A_ADDRESS = chain.contractAddress.currencyMap?.[symbolA];
  const B_ADDRESS = chain.contractAddress.currencyMap?.[symbolB];
  const A_AMOUNT = computeSymbolToWei(amountA);
  const B_AMOUNT = computeSymbolToWei(amountB);

  return new Promise((resolve) => {
    contract?.methods
      ?.getLiquidityValueByToken(A_ADDRESS, B_ADDRESS, A_AMOUNT, B_AMOUNT, 0, 0)
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          resolve(result);
        }
      });
  });
}

export async function _addLiquidity_internalAsync(symbolA, symbolB, amountA) {
  const contract = getContract(
    Contract.WmiswapV1RouterRead,
    chain.contractAddress?.RouterReadAddress
  );

  const A_ADDRESS = chain.contractAddress.currencyMap?.[symbolA];
  const B_ADDRESS = chain.contractAddress.currencyMap?.[symbolB];
  const A_AMOUNT = computeSymbolToWei(amountA);
  const B_AMOUNT = computeSymbolToWei("1000000000000000");

  return new Promise((resolve) => {
    contract?.methods
      ?._addLiquidity_internal(A_ADDRESS, B_ADDRESS, A_AMOUNT, B_AMOUNT, 0, 0)
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          resolve(result);
        }
      });
  });
}

// ?????????????????????????????????????????????
export async function getUnclaimedIncomeInMobilityMining() {
  const contract = getContract(
    Contract.LpMintPool,
    chain.contractAddress?.lppoolAddress
  );
  return new Promise((resolve) => {
    contract?.methods
      ?.amountBeClaimed(getNowUserAddress())
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          console.log("?????????????????????????????????????????????result----------->", result);
          resolve(computeWeiToSymbol(result[0], 4));
        }
      });
  });
}

// ???????????????????????????????????????????????????
export async function getTotalIncomeInMobilityMining() {
  const contract = getContract(
    Contract.LpMintPool,
    chain.contractAddress?.lppoolAddress
  );
  return new Promise((resolve) => {
    contract?.methods
      ?._rewardHadReceive(getNowUserAddress())
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          console.log("???????????????????????????????????????????????????----------------->", result);
          resolve(computeWeiToSymbol(result, 4));
        }
      });
  });
}

export async function getRewardInMobilityMining() {
  const contract = getContract(
    Contract.LpMintPool,
    chain.contractAddress?.lppoolAddress
  );
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.lppoolAddress,
      value: "0x0",
      data: contract?.methods?.Reward(getNowUserAddress()).encodeABI(),
    },
  ];
  return sendAsync(params);
}
// window.getLPTokenAddress = getLPTokenAddress;
export async function getLPTokenAddress(type = "U") {
  const info = {
    U: [Contract.LpMintPool, chain.contractAddress?.lppoolAddress],
    T: [Contract.TLpMintPool, chain.contractAddress?.TlppoolAddress],
  };
  const contract = getContract(...info[type]);

  return new Promise((resolve) => {
    contract?.methods?.LpTokenAddr().call((err, result) => {
      if (err) {
        resolve(false);
      }
      if (result) {
        resolve(result);
      }
    });
  });
}

// export async function getTTokenAddress() {
//   const round = await getNper();
//   return getMinerTokenrAddr(round - 1);
//   // const contract = getContract(
//   //   Contract.Shop,
//   //   chain.contractAddress?.ShopAddress
//   // );
//   // return new Promise((resolve) => {
//   //   contract?.methods.tokenAddr("MINER1").call((err, result) => {
//   //     if (err) {
//   //       resolve(false);
//   //     }
//   //     if (result) {
//   //       resolve(result);
//   //     }
//   //   });
//   // });
// }

export async function getUserLpPower(type = "U") {
  const info = {
    U: [Contract.LpMintPool, chain.contractAddress?.lppoolAddress],
    T: [Contract.LpMintPool, chain.contractAddress?.TlppoolAddress],
  };
  const contract = getContract(...info[type]);
  return new Promise((resolve) => {
    contract?.methods
      ?._userLpPowers(getNowUserAddress())
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          resolve(computeWeiToSymbol(result, 4));
        }
      });
  });
}

export async function getTotalLpPower(type = "U") {
  const info = {
    U: [Contract.LpMintPool, chain.contractAddress?.lppoolAddress],
    T: [Contract.LpMintPool, chain.contractAddress?.TlppoolAddress],
  };
  const contract = getContract(...info[type]);
  return new Promise((resolve) => {
    contract?.methods?._totalLpPower().call((err, result) => {
      if (err) {
        resolve(false);
      }
      if (result) {
        // resolve(computeWeiToSymbol(result, 4));
        resolve(result);
      }
    });
  });
}

export async function pledgeInMobilityMining(lpAmount, type = "U") {
  const info = {
    U: [Contract.LpMintPool, chain.contractAddress?.lppoolAddress],
    T: [Contract.LpMintPool, chain.contractAddress?.TlppoolAddress],
  };
  const contract = getContract(...info[type]);
  let wei = computeSymbolToWei(lpAmount);
  let params = [
    {
      from: getNowUserAddress(),
      to: info[type][1],
      value: "0x0",
      data: contract?.methods
        ?.pledge(
          getNowUserAddress(),
          web3_Provider.utils.toHex(web3_Provider.utils.toBN(wei))
        )
        .encodeABI(),
    },
  ];
  return sendAsync(params);
}

export async function redeemInMobilityMining(lpAmount, type = "U") {
  const info = {
    U: [Contract.LpMintPool, chain.contractAddress?.lppoolAddress],
    T: [Contract.LpMintPool, chain.contractAddress?.TlppoolAddress],
  };
  const contract = getContract(...info[type]);
  let wei = computeSymbolToWei(lpAmount);
  let params = [
    {
      from: getNowUserAddress(),
      to: info[type][1],
      value: "0x0",
      data: contract?.methods
        ?.withDraw(
          getNowUserAddress(),
          web3_Provider.utils.toHex(web3_Provider.utils.toBN(wei))
        )
        .encodeABI(),
    },
  ];
  return sendAsync(params);
}

window.getAllInfoAsync = getAllInfoAsync;

/**
 *  _userTPowerAmount ===> ????????????T
 * _userWfilPowerAmount ===> ????????????WFIL
 *  _TADDR ===> T?????????
 *
 *  getNeedWFILByTAmount ===>???????????????T
 *
 * deposit ===>??????
 *
 * withDraw ===> ??????
 */

// ????????????????????????????????????
export async function queryAmountFilBeClaimedInComputational(round) {
  const contractName = round > 4 ? Contract.FMTMintPool : Contract.TLpMintPool;
  const contract = getContract(
    contractName,
    chain.contractAddress?.[`Tlp${round}poolAddress`]
  );

  return new Promise((resolve) => {
    contract?.methods
      ?.amountBeClaimed(getNowUserAddress())
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          resolve(result[0]);
        }
      });
  });
}

window.queryAmountFilBeClaimedInComputational =
  queryAmountFilBeClaimedInComputational;
// ????????????????????????????????????
export async function queryAmountReceivedInComputational(round) {
  const contractName = round > 4 ? Contract.FMTMintPool : Contract.TLpMintPool;
  const contract = getContract(
    contractName,
    chain.contractAddress?.[`Tlp${round}poolAddress`]
  );
  return new Promise((resolve) => {
    contract?.methods
      ?._rewardHadReceive(getNowUserAddress())
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          resolve(result);
        }
      });
  });
}
window.queryAmountReceivedInComputational = queryAmountReceivedInComputational;
// ????????????????????????
export async function receiveRewardInComputational(round) {
  const contractName = round > 4 ? Contract.FMTMintPool : Contract.TLpMintPool;
  const contract = getContract(
    contractName,
    chain.contractAddress?.[`Tlp${round}poolAddress`]
  );
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.[`Tlp${round}poolAddress`],
      value: "0x0",
      data: contract?.methods?.reward(getNowUserAddress()).encodeABI(),
    },
  ];
  return sendAsync(params);
}

// window.queryUserTPowerAmountInComputational =
//   queryUserTPowerAmountInComputational;
// ??????????????????T
export async function queryUserTPowerAmountInComputational(round) {
  if (round > 4) return queryUserTPowerAmountInComputational_NEW(round);
  const contract = getContract(
    Contract.TLpMintPool,
    chain.contractAddress?.[`Tlp${round}poolAddress`]
  );

  return new Promise((resolve) => {
    contract?.methods
      ?._userTPowerAmount(getNowUserAddress())
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          resolve(result);
        }
      });
  });
}

async function queryUserTPowerAmountInComputational_NEW(round) {
  const contract = getContract(
    Contract.FMTMintPool,
    chain.contractAddress?.[`Tlp${round}poolAddress`]
  );

  return new Promise((resolve) => {
    contract?.methods?._userPowers(getNowUserAddress()).call((err, result) => {
      console.log("err ===>", err);
      console.log("result ===>", result);
      if (err) {
        resolve(false);
      }
      if (result) {
        resolve(result / 2);
      }
    });
  });
}

// ??????????????????WFIL
export async function queryUserWFILPowerAmountInComputational(round) {
  // todo ???????????????
  if (round > 4) return queryUserLpInComputational(round);
  const contract = getContract(
    Contract.TLpMintPool,
    chain.contractAddress?.[`Tlp${round}poolAddress`]
  );

  return new Promise((resolve) => {
    contract?.methods
      ?._userWfilPowerAmount(getNowUserAddress())
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          resolve(result);
        }
      });
  });
}

export async function queryUserLpInComputational(round) {
  const contract = getContract(
    Contract.FMTMintPool,
    chain.contractAddress?.[`Tlp${round}poolAddress`]
  );
  return new Promise((resolve) => {
    contract?.methods?._userLp(getNowUserAddress()).call((err, result) => {
      if (err) {
        resolve(false);
      }
      if (result) {
        resolve(result);
      }
    });
  });
}

// ?????? ???????????????T????????? ?????????
export async function queryTAddressInComputational(round) {
  const contract = getContract(
    Contract.TLpMintPool,
    chain.contractAddress?.[`Tlp${round}poolAddress`]
  );

  return new Promise((resolve) => {
    contract?.methods?._TADDR().call((err, result) => {
      if (err) {
        resolve(false);
      }
      if (result) {
        resolve(result);
      }
    });
  });
}

// ?????? ????????????WFIL
export async function queryNeedWFILByTInComputational(amount, round) {
  if (round > 4) return queryNeedWFILByTInComputational_NEW(amount, round);
  const contract = getContract(
    Contract.TLpMintPool,
    chain.contractAddress?.[`Tlp${round}poolAddress`]
  );

  let wei = computeSymbolToWei(amount);
  return new Promise((resolve) => {
    contract?.methods
      ?.getNeedWFILByTAmount(
        web3_Provider.utils.toHex(web3_Provider.utils.toBN(wei))
      )
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          console.log("queryNeedWFILByTInComputational ====> ", result);
          resolve(result);
        }
      });
  });
}

window.queryNeedWFILByTInComputational_NEW =
  queryNeedWFILByTInComputational_NEW;
export async function queryNeedWFILByTInComputational_NEW(amount, round) {
  const contract = getContract(
    Contract.FMTMintPool,
    chain.contractAddress?.[`Tlp${round}poolAddress`]
  );

  let wei = computeSymbolToWei(amount / 2); // ??????2?????????????????? ????????????
  return new Promise((resolve) => {
    contract?.methods
      ?.needWfilAmount(web3_Provider.utils.toHex(web3_Provider.utils.toBN(wei)))
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          console.log("queryNeedWFILByTInComputational ====> ", result);
          resolve(result);
        }
      });
  });
}

// ????????????????????????
export async function depositInComputational(amount, WFILAmoutWei, round) {
  if (round > 4) return depositInComputational_NEW(amount, round);
  // todo  ?????????
  const contract = getContract(
    Contract.TLpMintPool,
    chain.contractAddress?.[`Tlp${round}poolAddress`]
  );
  let wei = computeSymbolToWei(amount);
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.[`Tlp${round}poolAddress`],
      value: "0x0",
      data: contract?.methods
        ?.deposit(
          getNowUserAddress(),
          web3_Provider.utils.toHex(web3_Provider.utils.toBN(wei)),
          web3_Provider.utils.toHex(web3_Provider.utils.toBN(WFILAmoutWei))
        )
        .encodeABI(),
    },
  ];
  return sendAsync(params);
}

async function depositInComputational_NEW(amount, round) {
  const contract = getContract(
    Contract.FMTMintPool,
    chain.contractAddress?.[`Tlp${round}poolAddress`]
  );
  let wei = computeSymbolToWei(amount);
  console.log("amount, round", wei, amount, round);
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.[`Tlp${round}poolAddress`],
      value: "0x0",
      data: contract?.methods
        ?.pledge(
          getNowUserAddress(),
          web3_Provider.utils.toHex(web3_Provider.utils.toBN(wei))
        )
        .encodeABI(),
    },
  ];
  return sendAsync(params);
}

// ????????????????????????
export async function withDrawInComputational(amount, round) {
  const contractName = round > 4 ? Contract.FMTMintPool : Contract.TLpMintPool;

  const contract = getContract(
    contractName,
    chain.contractAddress?.[`Tlp${round}poolAddress`]
  );
  let number = amount;
  if (round <= 4) {
    let wei = computeSymbolToWei(amount);
    number = web3_Provider.utils.toHex(web3_Provider.utils.toBN(wei));
  }
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.[`Tlp${round}poolAddress`],
      value: "0x0",
      data: contract?.methods
        ?.withDraw(getNowUserAddress(), number)
        .encodeABI(),
    },
  ];
  return sendAsync(params);
}

export async function getTotalSalesByRound(round) {
  const TokenAddress = chain.contractAddress.currencyMap?.[`T${round}`];

  const contract = getContract(Contract.minerToken, TokenAddress);
  return new Promise((resolve) => {
    contract?.methods?.totalSupply().call((err, result) => {
      if (err) {
        // console.log("??????");
        resolve(false);
      }
      if (result) {
        if (round > 4) {
          resolve(computeWeiToSymbol(result, 4) - 5);
        } else {
          resolve(computeWeiToSymbol(result, 4));
        }
      }
    });
  });
}

export async function getTPriceByRound(round, toSymbol = true) {
  const TokenAddress = chain.contractAddress.currencyMap?.[`T${round}`];

  const contract = getContract(Contract.minerToken, TokenAddress);
  return new Promise((resolve) => {
    contract?.methods?.price().call((err, result) => {
      if (err) {
        resolve(false);
      }
      if (result) {
        if (toSymbol) {
          resolve(computeWeiToSymbol(result, 4));
        } else {
          resolve(result);
        }
      }
    });
  });
}

export async function getMarketPrice(round) {
  const TokenAddress = chain.contractAddress.currencyMap?.[`T${round}`];
  const WFILAddress = chain.contractAddress.currencyMap?.["WFIL"];

  const contract = getContract(
    Contract.WmiswapV1RouterRead,
    chain.contractAddress?.RouterReadAddress
  );

  return new Promise((resolve) => {
    contract?.methods
      ?.getPriceAndTotalSupply(TokenAddress, WFILAddress)
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          resolve(result);
        }
      });
  });
}

window.getMarketPrice = getMarketPrice;
window.getUSDTTOWFILPrice = getUSDTTOWFILPrice;

export async function getUSDTTOWFILPrice() {
  const TokenAddress = chain.contractAddress.currencyMap?.USDT;
  const WFILAddress = chain.contractAddress.currencyMap?.AFIL;

  const contract = getContract(
    Contract.WmiswapV1RouterRead,
    chain.contractAddress?.RouterReadAddress
  );

  return new Promise((resolve) => {
    contract?.methods
      ?.getPriceAndTotalSupply(TokenAddress, WFILAddress)
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          resolve(result);
        }
      });
  });
}

// ???????????????T?????????
export async function getTBalanceInShop(round) {
  const TokenAddress = chain.contractAddress.currencyMap?.[`T${round}`];
  const contract = getContract(Contract.BaseERC20, TokenAddress);

  const contractAddress =
    round > 4
      ? chain.contractAddress?.newShop
      : chain.contractAddress?.ShopAddress;
  return new Promise((resolve) => {
    contract?.methods?.balanceOf(contractAddress).call((err, result) => {
      if (err) {
        resolve(false);
      }
      if (result) {
        resolve(computeWeiToSymbol(result, 4));
      }
    });
  });
}

window.getTotalLpInComputation = getTotalLpInComputation;
export async function getTotalLpInComputation(round) {
  const TokenAddress = chain.contractAddress?.[`T${round}lpAddress`];
  const contract = getContract(Contract.BaseERC20, TokenAddress);

  return new Promise((resolve) => {
    contract?.methods?.totalSupply().call((err, result) => {
      if (err) {
        resolve(false);
      }
      if (result) {
        resolve(computeWeiToSymbol(result, 4));
      }
    });
  });
}

window.getTBalanceInShop = getTBalanceInShop;
window.getNewestLotteryPeriod = getNewestLotteryPeriod;
// ????????????????????????????????????
// viewCurrentLotteryId
export async function getNewestLotteryPeriod() {
  const contract = getContract(
    Contract.Lottery,
    chain.contractAddress?.LotteryAddress
  );

  return new Promise((resolve) => {
    contract?.methods?.viewCurrentLotteryId().call((err, result) => {
      if (err) {
        resolve(false);
      }
      if (result) {
        resolve(parseInt(result));
      }
    });
  });
}

window.getViewLotteryDetail = getViewLotteryDetail;
// ???????????????????????????
export async function getViewLotteryDetail(id) {
  const contract = getContract(
    Contract.Lottery,
    chain.contractAddress?.LotteryAddress
  );

  return new Promise((resolve) => {
    contract?.methods?.viewLottery(id).call((err, result) => {
      if (err) {
        resolve(false);
      }
      if (result) {
        console.log("result =====>", result);
        resolve(result);
      }
    });
  });
}
window.calculateTotalPriceForBulkTickets = calculateTotalPriceForBulkTickets;
// ????????????????????????
export async function calculateTotalPriceForBulkTickets(
  _discountDivisor,
  _priceTicket,
  _numberTickets
) {
  const contract = getContract(
    Contract.Lottery,
    chain.contractAddress?.LotteryAddress
  );

  return new Promise((resolve) => {
    contract?.methods
      ?.calculateTotalPriceForBulkTickets(
        _discountDivisor,
        _priceTicket,
        _numberTickets
      )
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          console.log("result =====>", result);
          resolve(result);
        }
      });
  });
}

window.viewUserInfoForLotteryId = viewUserInfoForLotteryId;
export async function viewUserInfoForLotteryId(id) {
  const contract = getContract(
    Contract.Lottery,
    chain.contractAddress?.LotteryAddress
  );

  return new Promise((resolve) => {
    contract?.methods
      ?.viewUserInfoForLotteryId_1(getNowUserAddress(), id)
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          window.tickets = result[1];
          console.log("result =====>", result);
          resolve(result);
        }
      });
  });
}

window.buyTickets = buyTickets;
export async function buyTickets(period, tickets) {
  console.log("period, tickets ======>", period, tickets);
  const contract = getContract(
    Contract.Lottery,
    chain.contractAddress?.LotteryAddress
  );
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.LotteryAddress,
      value: "0x0",
      data: contract?.methods?.buyTickets(period, tickets).encodeABI(),
    },
  ];
  return sendAsync(params);
}

window.claimTickets = claimTickets;
export async function claimTickets(period, ticketIDArray, bracketArray) {
  const contract = getContract(
    Contract.Lottery,
    chain.contractAddress?.LotteryAddress
  );
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.LotteryAddress,
      value: "0x0",
      data: contract?.methods
        ?.claimTickets(period, ticketIDArray, bracketArray)
        .encodeABI(),
    },
  ];
  return sendAsync(params);
}

// MMRS_GR
// window.freeBuyInMMRS_GR = freeBuyInMMRS_GR;
// ??????
export async function freeBuyInMMRS_GR(amount) {
  const contract = getContract(
    Contract.Mediation,
    chain.contractAddress?.mediation
  );

  const wei = computeSymbolToWei(amount);
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.mediation,
      value: "0x0",
      data: contract?.methods
        ?.freeBuy(web3_Provider.utils.toHex(web3_Provider.utils.toBN(wei)))
        .encodeABI(),
    },
  ];
  return sendAsync(params);
}

window.oldFreeBuy = oldFreeBuy;
export async function oldFreeBuy(amount = 200) {
  const contract = getContract(
    Contract.freedomList,
    chain.contractAddress?.MMRS_GR
  );

  const wei = computeSymbolToWei(amount);
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.MMRS_GR,
      value: "0x0",
      data: contract?.methods
        ?.freeBuy(web3_Provider.utils.toHex(web3_Provider.utils.toBN(wei)))
        .encodeABI(),
    },
  ];
  return sendAsync(params);
}
// getLimit

window.getLimitInMMRS_GR = getLimitInMMRS_GR;
export async function getLimitInMMRS_GR() {
  const contract = getContract(
    Contract.Mediation,
    chain.contractAddress?.mediation
  );
  console.log("getLimitInMMRS_GR");
  return new Promise((resolve) => {
    contract?.methods?.getLimit().call((err, result) => {
      console.log("err, result", err, result);
      if (err) {
        resolve(false);
      }
      if (result) {
        resolve(computeWeiToSymbol(result, 0));
      }
    });
  });
}

export async function getUserAmountInMMRS_GR() {
  const contract = getContract(
    Contract.Mediation,
    chain.contractAddress?.mediation
  );

  return new Promise((resolve) => {
    contract?.methods?._userAmount(getNowUserAddress()).call((err, result) => {
      if (err) {
        resolve(false);
      }

      console.log("_userAmount===>", err, result);
      // if (result) {
      resolve(result);
      // }
    });
  });
}

export async function rewardInMMRS_GR({
  userAddress,
  usdtHex,
  mmrsHex,
  idx,
  sign,
}) {
  const contract = getContract(
    Contract.VerifyMmrsAndUsdt,
    chain.contractAddress?.mmrsReplace
  );

  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.mmrsReplace,
      value: "0x0",
      data: contract?.methods
        ?.reward(userAddress, "0x" + usdtHex, "0x" + mmrsHex, idx, sign)
        .encodeABI(),
    },
  ];
  return sendAsync(params);
}

/**
 *
 * MMRS?????????_???????????????
 */
export async function MMRSIncome() {
  const contract = getContract(
    Contract.newBorad,
    chain.contractAddress?.newBorad
  );
  return new Promise((resolve) => {
    contract?.methods
      ?.amountBeClaimed(getNowUserAddress())
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          // console.log("MMRS?????????_???????????????----------->", result);
          resolve(computeWeiToSymbol(result[0], 4));
        }
      });
  });
}
/**
 *
 * MMRS?????????_???????????????
 */
export async function MMRSTotalIncome() {
  const contract = getContract(
    Contract.newBorad,
    chain.contractAddress?.newBorad
  );
  return new Promise((resolve) => {
    contract?.methods
      ?._rewardHadReceive(getNowUserAddress())
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          // console.log("MMRS?????????_???????????????----------->", result);
          resolve(computeWeiToSymbol(result, 4));
        }
      });
  });
}

/**
 *
 *  MMRS?????????_??????MMR??????
 */
export async function MMRSDAOReward() {
  const contract = getContract(
    Contract.newBorad,
    chain.contractAddress?.newBorad
  );
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.newBorad,
      value: "0x0",
      data: contract?.methods?.Reward(getNowUserAddress()).encodeABI(),
    },
  ];
  return sendAsync(params);
}
// ??????
export async function oldfreeBuyInMMRS_GR(amount) {
  const contract = getContract(
    Contract.MMRS_GR,
    chain.contractAddress?.MMRS_GR
  );

  const wei = computeSymbolToWei(amount);
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.MMRS_GR,
      value: "0x0",
      data: contract?.methods
        ?.freeBuy(web3_Provider.utils.toHex(web3_Provider.utils.toBN(wei)))
        .encodeABI(),
    },
  ];
  return sendAsync(params);
}
// ?????????
export async function olduserAmountInMMRS_GR() {
  const contract = getContract(
    Contract.MMRS_GR,
    chain.contractAddress?.MMRS_GR
  );

  return new Promise((resolve) => {
    contract?.methods?._userAmount(getNowUserAddress()).call((err, result) => {
      if (err) {
        resolve(false);
      }
      if (result) {
        resolve(result);
      }
    });
  });
}

export async function getUserPowerMMRSBoard() {
  // getUserPower
  const contract = getContract(
    Contract.newBorad,
    chain.contractAddress?.newBorad
  );
  return new Promise((resolve) => {
    contract?.methods?.getUserPower(getNowUserAddress()).call((err, result) => {
      if (err) {
        resolve(false);
      }
      if (result) {
        resolve(computeWeiToSymbol(result, 4));
      }
    });
  });
}
// MMRS_GR
// MMRS+USDT??????
export async function mixBuyInMMRS_GR(amount) {
  const contract = getContract(
    Contract.mmrs_pledge,
    chain.contractAddress?.mmrs_pledge
  );

  const wei = computeSymbolToWei(amount);
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.mmrs_pledge,
      value: "0x0",
      data: contract?.methods
        ?.pledge(web3_Provider.utils.toHex(web3_Provider.utils.toBN(wei)))
        .encodeABI(),
    },
  ];
  return sendAsync(params);
}
// MMRS_GR
// USDT?????????MMRS
export async function getMMRSInMMRS_GR(amount) {
  // getUserPower
  const contract = getContract(
    Contract.mmrs_pledge,
    chain.contractAddress?.mmrs_pledge
  );
  const wei = computeSymbolToWei(amount);
  return new Promise((resolve) => {
    contract?.methods
      ?.quote(web3_Provider.utils.toHex(web3_Provider.utils.toBN(wei)))
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          console.log("????????????MMRS----->", result);
          resolve(computeWeiToSymbol(result, 4));
        }
      });
  });
}

// ??????FM
export async function rewardFMInForceMining(
  userAddress,
  usdtHex,
  mmrsHex,
  idx,
  sign
) {
  const contract = getContract(
    Contract.VerifyMmrsAndUsdt,
    chain.contractAddress?.fm
  );

  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.fm,
      value: "0x0",
      data: contract?.methods
        ?.reward(userAddress, "0x" + usdtHex, "0x" + mmrsHex, idx, sign)
        .encodeABI(),
    },
  ];
  return sendAsync(params);
}

export async function queryRushPurchaseEndTime(round) {
  const TokenAddress = chain.contractAddress.currencyMap?.[`T${round}`];
  const contract = getContract(Contract.minerToken, TokenAddress);
  return new Promise((resolve) => {
    contract?.methods?._RushPurchaseEndTime().call((err, result) => {
      if (err) {
        resolve(false);
      }
      if (result) {
        resolve(result);
      }
    });
  });
}

//  ?????????
export async function pledgeTotalPower(round) {
  // deplagetotalPower_NEW
  if (round > 4) return pledgeTotalPower_NEW(round);
  const contract = getContract(
    Contract.TLpMintPool,
    chain.contractAddress?.[`Tlp${round}poolAddress`]
  );
  return new Promise((resolve) => {
    contract?.methods?._totalTPower().call((err, result) => {
      if (err) {
        resolve(false);
      }
      if (result) {
        resolve(computeWeiToSymbol(result, 4));
      }
    });
  });
}

export async function pledgeTotalPower_NEW(round) {
  console.log("round ===>", round);
  const contract = getContract(
    Contract.FMTMintPool,
    chain.contractAddress?.[`Tlp${round}poolAddress`]
  );
  return new Promise((resolve) => {
    contract?.methods?._totalPower().call((err, result) => {
      if (err) {
        resolve(false);
      }
      if (result) {
        resolve(computeWeiToSymbol(result, 4));
      }
    });
  });
  //
}

/**
 * ??????
 */
// ??????
export async function DAO_commitVote(round, num, isPositive) {
  console.log(round, num, isPositive);
  const contract = getContract(
    Contract.DaoCommit,
    chain.contractAddress?.DaoCommit
  );
  let wei = computeSymbolToWei(num);
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.DaoCommit,
      value: "0x0",
      data: contract?.methods
        ?.CommitVote(
          round,
          num,
          // web3_Provider.utils.toHex(web3_Provider.utils.toBN(wei)),
          isPositive
        )
        .encodeABI(),
    },
  ];
  return sendAsync(params);
}
// ??????MMR
export async function DAO_reward(round) {
  const contract = getContract(
    Contract.DaoCommit,
    chain.contractAddress?.DaoCommit
  );
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.DaoCommit,
      value: "0x0",
      data: contract?.methods?.reward(round).encodeABI(),
    },
  ];
  return sendAsync(params);
}
// ??????MMRS
export async function DAO_withDraw(round) {
  const contract = getContract(
    Contract.DaoCommit,
    chain.contractAddress?.DaoCommit
  );
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.DaoCommit,
      value: "0x0",
      data: contract?.methods?.withDraw(round).encodeABI(),
    },
  ];
  return sendAsync(params);
}
// ?????????MMR
export async function DAO_beClaimed(round) {
  const contract = getContract(
    Contract.DaoCommit,
    chain.contractAddress?.DaoCommit
  );
  return new Promise((resolve) => {
    contract?.methods
      ?.beClaimed(getNowUserAddress(), round)
      .call((err, result) => {
        if (err) {
          resolve("");
        }
        if (result) {
          // console.log("?????????MMR", result);
          resolve(computeWeiToSymbol(result, 4));
        }
      });
  });
  //
}
// ?????????MMRS ==>getAllCanWithDraw
export async function DAO_getAllCanWithDraw(round) {
  console.log("getAllCanWithDraw+++", round);
  const contract = getContract(
    Contract.DaoCommit,
    chain.contractAddress?.DaoCommit
  );
  return new Promise((resolve) => {
    contract?.methods
      ?.getAllCanWithDraw(getNowUserAddress(), round)
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          // resolve(computeWeiToSymbol(result, 4));
          // console.log("???????????????111111111111111", result);
          resolve(result);
        }
      });
  });
  //
}
//????????????
// export async function DAO_Info(round) {
//   const contract = getContract(
//     Contract.DaoCommit,
//     chain.contractAddress?.DaoCommit
//   );
//   return new Promise((resolve) => {
//     // contract?.methods?.getUserVoteInfo(round).call((err, result) => {
//     contract?.methods
//       ?.userWithDrawInfo(getNowUserAddress(), round, 0)
//       .call((err, result) => {
//         if (err) {
//           resolve(false);
//         }
//         if (result) {
//           console.log("????????????", result);
//           resolve(result);
//         }
//       });
//   });
//   //
// }
//????????????
export async function DAO_userVoteInfo(round) {
  const contract = getContract(
    Contract.DaoCommit,
    chain.contractAddress?.DaoCommit
  );
  return new Promise((resolve) => {
    contract?.methods
      ?.isRewardForPeriod(getNowUserAddress(), round)
      .call((err, result) => {
        if (err) {
          resolve(false);
        }
        if (result) {
          // console.log("????????????", result);
          resolve(result);
        }
      });
  });
  //
}
//????????????
export async function DAO_voteResultInfo(round) {
  const contract = getContract(
    Contract.DaoCommit,
    chain.contractAddress?.DaoCommit
  );
  return new Promise((resolve) => {
    contract?.methods?.voteResultInfo(round).call((err, result) => {
      if (err) {
        resolve(false);
      }
      if (result) {
        // console.log("????????????", result);
        resolve(result);
      }
    });
  });
  //
}
//????????????
export async function DAO_periodDeadline(round) {
  const contract = getContract(
    Contract.DaoCommit,
    chain.contractAddress?.DaoCommit
  );
  return new Promise((resolve) => {
    contract?.methods?.periodDeadline(round).call((err, result) => {
      if (err) {
        resolve(false);
      }
      if (result) {
        // console.log("????????????", result);
        resolve(result);
      }
    });
  });
  //
}
//????????????
export async function periodLockEndTime(round) {
  const contract = getContract(
    Contract.DaoCommit,
    chain.contractAddress?.DaoCommit
  );
  return new Promise((resolve) => {
    contract?.methods?.periodLockEndTime(round).call((err, result) => {
      if (err) {
        resolve(false);
      }
      if (result) {
        // console.log("??????", result);
        resolve(result);
      }
    });
  });
  //
}
//CommitVote ??????
//reward ??????MMR
//withDraw ??????MMRS
//beClaimed  ?????????MMR
// getAllCanWithDraw ?????????MMRS
// getUserVoteInfo ????????????
// userVoteInfo ????????????
//voteResultInfo ????????????
//periodDeadline ????????????
//periodLockEndTime ????????????
