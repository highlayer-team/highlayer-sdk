const { HighlayerTx } = require("../structs");
const { TransactionBuilder } = require("../builders/index");
const { Actions } = require("../helpers/index");

class HighlayerClient {
  constructor({ sequencer = "", node = "" } = {}) {
    this.sequencer = sequencer;
    this.node = node;
  }

  // See https://docs.highlayer.io/http-api.html#fetch-available-deposit-on-sequencer
  async getSequencerBalance(address) {
    if (typeof address !== "string") {
      throw new Error("address must be a string");
    }

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

    return data.balance;
  }

  async getSequencerFees() {
    const response = await fetch(`${this.sequencer}/sequencer-prices`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

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
    if (typeof address !== "string") {
      throw new Error("address must be a string");
    }
    if (isNaN(minBalance) || Number(minBalance) <= 0) {
      throw new Error("minBalance must be a positive number");
    }
    if (isNaN(deposit) || Number(deposit) <= 0) {
      throw new Error("deposit must be a positive number");
    }

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
    if (!(transaction instanceof TransactionBuilder)) {
      throw new Error("Transaction must be an instance of TransactionBuilder");
    }

    if (!transaction.address) {
      throw new Error("Transaction must include an 'address' property");
    }

    if (transaction.actions.length <= 0) {
      throw new Error("Transaction must include an action");
    }

    let tx = new HighlayerTx(transaction);

    let signature = await this.signingFunction(tx.encode());
    tx.signature = signature;

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
