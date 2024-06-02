const { BIP322, Signer, Verifier, Address } = require("bip322-js");

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
  log: ({ message }) => ({
    program: "system",
    action: "log",
    params: {
      message: message,
    },
  }),
};

module.exports = { Actions };
