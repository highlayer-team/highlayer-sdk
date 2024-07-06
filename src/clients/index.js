const { HighlayerTx, KVStore } = require("../structs");
const { TransactionBuilder } = require("../builders/index");
const { Actions } = require("../helpers/index");
const msgpackr = require("msgpackr");
const Big = require("big.js");

Big.PE = 100;

class HighlayerClient {
  constructor({
    sequencer = "http://sequencer.highlayer.io",
    node = "https://seed-node.highlayer.io/",
  } = {}) {
    this.sequencer = sequencer.replace(/\/$/, "");
    this.node = node.replace(/\/$/, "");
  }

  async getSequencerBalance(address) {
    if (typeof address !== "string") {
      throw new Error("Address must be a string");
    }

    const response = await fetch(
      `${this.sequencer}/depositBalance/${address}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/vnd.msgpack",
        },
      }
    );

    const data = msgpackr.unpack(new Uint8Array(await response.arrayBuffer()));
    return data.balance;
  }

  async getSequencerFees() {
    const response = await fetch(`${this.sequencer}/sequencerPrices`, {
      method: "GET",
      headers: {
        "Content-Type": "application/vnd.msgpack",
      },
    });

    return msgpackr.unpack(new Uint8Array(await response.arrayBuffer()));
  }

  async getTransactionFee(transaction) {
    if (!(transaction instanceof TransactionBuilder)) {
      throw new Error("Transaction must be an instance of TransactionBuilder");
    }

    if (!transaction.address) {
      throw new Error("Transaction must include an 'address' property");
    }

    if (transaction.actions.length === 0) {
      throw new Error("Transaction must include at least one action");
    }

    const tx = new HighlayerTx(transaction);
    tx.actions = tx.actions.filter((action) => action.action !== "allocateGas");

    // const signature = await this.signingFunction({ ...tx });
    // tx.signature = signature;

    const encodedTx = tx.encode();

    const response = await fetch(`${this.node}/calculateTxGas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.msgpack",
        "Content-Length": encodedTx.byteLength.toString(),
      },
      body: encodedTx,
    });

    const data = msgpackr.unpack(new Uint8Array(await response.arrayBuffer()));

    return {
      gasNeeded: Math.abs(data.gas),
    };
  }

  KV(contractId) {
    if (!this.node) {
      throw new Error("You must provide a Node in the Client's constructor");
    }

    return new KVStore({
      node: this.node,
      contractId,
    });
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

  Contract(contractId) {
    return new HighlayerContract({
      SigningClient: this,
      node: this.node,
      contractId,
    });
  }

  async ensureDeposit({ address, minBalance, deposit }) {
    if (typeof address !== "string") {
      throw new Error("Address must be a string");
    }
    if (isNaN(minBalance) || Number(minBalance) <= 0) {
      throw new Error("minBalance must be a positive number");
    }
    if (isNaN(deposit) || Number(deposit) <= 0) {
      throw new Error("deposit must be a positive number");
    }

    const currentBalance = await this.getSequencerBalance(address);
    const minimumBalance = BigInt(minBalance);
    const depositAmount = BigInt(deposit);

    if (minimumBalance > BigInt(currentBalance)) {
      const sequencerDepositTX = new TransactionBuilder()
        .setAddress(address)
        .addActions([Actions.sequencerDeposit({ amount: depositAmount })]);

      try {
        await this.signAndBroadcast(sequencerDepositTX);
        return true;
      } catch (e) {
        console.error("Error during deposit:", e);
        return false;
      }
    }

    return true;
  }

  async signAndBroadcast(transaction) {
    if (!(transaction instanceof TransactionBuilder)) {
      throw new Error("Transaction must be an instance of TransactionBuilder");
    }

    if (!transaction.address) {
      throw new Error("Transaction must include an 'address' property");
    }

    if (transaction.actions.length === 0) {
      throw new Error("Transaction must include at least one action");
    }

    const tx = new HighlayerTx(transaction);
    const signature = await this.signingFunction({ ...tx });
    tx.signature = signature;

    const encodedTx = tx.encode();

    const response = await fetch(`${this.sequencer}/tx`, {
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.msgpack",
        "Content-Length": encodedTx.byteLength.toString(),
      },
      body: encodedTx,
    });

    try {
      return msgpackr.unpack(new Uint8Array(await response.arrayBuffer()));
    } catch (e) {
      console.error("Error unpacking response:", e);
      throw e;
    }
  }

  async getSequencerFeePerByteAswellAsYourSequencerBalanceAndFeeForTransactionAndIfYouCantAffordToUploadThenDepositToSequencerThenUploadOrJustUploadIfBalanceSuffices(
    transaction
  ) {
    const tx = new HighlayerTx(transaction);
    const sequencerFees = await this.getSequencerFees();
    const sequencerFeePerByte = sequencerFees.feePerByte;
    const sequencerBalance = await this.getSequencerBalance(tx.address);
    const transactionByteLength = Buffer.byteLength(tx.encode(), "utf8");

    const fee = Big(sequencerFeePerByte).mul(transactionByteLength);
    const remainingBalance = Big(sequencerBalance).minus(fee);

    if (remainingBalance.lt(0)) {
      const sequencerDepositTX = new TransactionBuilder()
        .setAddress(tx.address)
        .addActions([Actions.sequencerDeposit({ amount: fee.toString() })]);

      try {
        await this.signAndBroadcast(sequencerDepositTX);
      } catch (e) {
        console.error("Error during deposit:", e);
        return false;
      }
    }

    return this.signAndBroadcast(transaction);
  }
}

class HighlayerContract extends KVStore {
  constructor({ SigningClient, node, contractId }) {
    super({ node, contractId });
    this.SigningClient = SigningClient;
  }

  async interact({ action, params, gas, address }) {
    const transaction = new TransactionBuilder()
      .setAddress(address)
      .setActions([
        gas,
        Actions.contractInteraction({
          contractId: this.contractId,
          action,
          params,
        }),
      ]);

    return this.SigningClient.signAndBroadcast(transaction);
  }
}

module.exports = { HighlayerClient, SigningHighlayerClient };
