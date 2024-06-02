const { HighlayerTx } = require("../structs");
const { TransactionBuilder } = require("../builders/index");
const { Actions } = require("../helpers/index");

class HighlayerClient {
  constructor({ sequencer = "", node = "" } = {}) {
    this.sequencer = sequencer;
    this.node = node;
  }

  async getSequencerBalance(address) {
    const response = await fetch(
      `${this.sequencer}/depositBalance/${address}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "text/plain",
        },
      }
    );

    const data = await response.json();

    return data;
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

  async ensureDeposit({ address, minBalance, deposit }) {
    let currentBalance = await this.getSequencerBalance(address);

    let minimumBalance = BigInt(minBalance);
    let depositAmount = BigInt(deposit);

    if (minimumBalance > BigInt(currentBalance)) {
      let sequencerDepositTX = new TransactionBuilder()
        .setAddress(address)
        .addActions([Actions.sequencerDeposit({ amount: depositAmount })]);

      try {
        await this.signAndBroadcast(sequencerDepositTX);
      } catch (e) {
        console.error(e);
        return false;
      }

      return true;
    } else {
      return true;
    }
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

    const data = await response.json();
    return data;
  }
}

module.exports = { HighlayerClient, SigningHighlayerClient };
