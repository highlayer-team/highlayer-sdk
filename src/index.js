const { HighlayerTx } = require("./structs");
const { Actions, AlanToHi, HiToAlan, PrivateKeySigner } = require("./helpers");
const {
  SigningHighlayerClient,
  HighlayerClient,
  HighlayerContract,
} = require("./clients");
const { TransactionBuilder } = require("./builders");

const { BIP322, Signer, Verifier, Address } = require("bip322-js");

module.exports = {
  HighlayerTx,
  Actions,
  SigningHighlayerClient,
  HighlayerClient,
  HighlayerContract,
  TransactionBuilder,
  AlanToHi,
  HiToAlan,
  PrivateKeySigner,
  bip322: {
    BIP322,
    Signer,
    Verifier,
    Address,
  },
};
