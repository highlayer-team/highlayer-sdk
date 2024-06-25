const Big = require("big.js");
const { HighlayerTx, bip322 } = require("../");

Big.PE = 100;

const Actions = {
  sequencerDeposit: ({ amount }) => ({
    program: "system",
    action: "sequencerDeposit",
    params: {
      amount: amount,
    },
  }),
  allocateGas: ({ amount, price }) => ({
    program: "system",
    action: "allocateGas",
    params: {
      amount: amount,
      price: price,
    },
  }),
  transfer: ({ amount, recipient }) => ({
    program: "system",
    action: "transfer",
    params: {
      amount: amount,
      recipient: recipient,
    },
  }),
  uploadData: ({ data }) => ({
    program: "system",
    action: "uploadData",
    params: {
      data: data,
    },
  }),
  createContract: ({ sourceId, initActions, gasForInitActions }) => ({
    program: "system",
    action: "createContract",
    params: {
      sourceId: sourceId,
      initActions: initActions,
      gasForInitActions: gasForInitActions,
    },
  }),
  contractInteraction: ({ contractId, action, params }) => ({
    program: contractId,
    action: action,
    params,
  }),
  log: ({ message }) => ({
    program: "system",
    action: "log",
    params: {
      message: message,
    },
  }),
};

const AlanToHi = (number) => {
  let units = Big(number);
  return units.div(1000000000000).toString();
};

const HiToAlan = (number) => {
  let units = Big(number);
  return units.mul(1000000000000).toString();
};

const PrivateKeySigner = (PrivateKey, Address) => {
  return function signer(transaction) {
    let transactionHash = new HighlayerTx(transaction).rawTxID();
    return bip322.Signer.sign(PrivateKey, Address, transactionHash);
  };
};

module.exports = { Actions, AlanToHi, HiToAlan, PrivateKeySigner };
