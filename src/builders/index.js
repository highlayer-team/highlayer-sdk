const crypto = require("crypto");
const { Actions } = require("..");

class TransactionBuilder {
  constructor({
    address = "",
    signature = null,
    nonce = crypto.randomBytes(4).readUInt32BE(0),
    actions = null,
    bundlePosition = null,
    sequencerTxIndex = null,
    trueTxIndex = null,
    parentBundleHash = null,
    sequencerSignature = null,
  } = {}) {
    this.address = address;
    this.signature = signature;
    this.nonce = nonce;
    this.actions = actions;
    this.bundlePosition = bundlePosition;
    this.sequencerTxIndex = sequencerTxIndex;
    this.trueTxIndex = trueTxIndex;
    this.parentBundleHash = parentBundleHash;
    this.sequencerSignature = sequencerSignature;
  }

  setAddress(address) {
    this.address = address;
    return this;
  }

  setNonce(nonce) {
    this.nonce = nonce;
    return this;
  }

  addActions(actions) {
    if (!Array.isArray(actions)) {
      throw new Error("actions must be of type Array");
    }

    // Use this because if array isnt set the value is null.
    // Cant really set it to an empty array because that wouldnt work with sequencer/node
    if (!Array.isArray(this.actions)) {
      this.actions = [];
    }

    this.actions = [...this.actions, ...actions];
  }

  setSignature(signature) {
    this.signature = signature;
    return this;
  }
}

module.exports = { TransactionBuilder };
