const crypto = require("crypto");

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

  setActions(actions) {
    this.actions = [...this.actions, ...actions];
    return this;
  }

  setSignature(signature) {
    this.signature = signature;
    return this;
  }
}

module.exports = { TransactionBuilder };
