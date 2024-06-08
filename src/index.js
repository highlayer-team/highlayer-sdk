const { HighlayerTx } = require("./structs");
const { Actions, AlanToHi, HiToAlan } = require("./helpers");
const { SigningHighlayerClient, HighlayerClient } = require("./clients");
const { TransactionBuilder } = require("./builders");

const { BIP322, Signer, Verifier, Address } = require("bip322-js");

module.exports = {
  HighlayerTx,
  Actions,
  SigningHighlayerClient,
  HighlayerClient,
  TransactionBuilder,
  AlanToHi,
  HiToAlan,
  bip322: {
    BIP322,
    Signer,
    Verifier,
    Address,
  },
};
