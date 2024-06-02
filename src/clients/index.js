const bitcoin = require("bitcoinjs-lib");
const { HighlayerTx } = require("../structs");
const { BIP322, Signer, Verifier, Address } = require("bip322-js");

class HighlayerClient {
  constructor({ sequencer = "http://127.0.0.1:2880", node = "" } = {}) {
    this.sequencer = sequencer;
    this.node = node;
  }
}

class SigningHighlayerClient extends HighlayerClient {
  constructor({ signingFunction, sequencer, node } = {}) {
    super({ sequencer, node });
    this.signingFunction = signingFunction;
  }

  setSigningFunction(signingFunction) {
    this.signingFunction = signingFunction;
    return this;
  }

  async signAndBroadcast(transaction) {
    let tx = new HighlayerTx(transaction);

    let signature = await this.signingFunction(tx.encode());
    tx.signature = signature;

    console.log(tx);

    const response = await fetch(`${this.sequencer}/tx`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: tx.encode(),
    });

    console.log(tx.actions);

    const data = await response.json(); // Assuming the response is JSON
    return data;
  }
}

module.exports = { HighlayerClient, SigningHighlayerClient };
