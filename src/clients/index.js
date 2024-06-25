const { HighlayerTx, KVStore } = require("../structs");
const { TransactionBuilder } = require("../builders/index");
const { Actions } = require("../helpers/index");
const msgpackr = require("msgpackr");
const Big = require("big.js");

Big.PE = 100;

class HighlayerClient {
  constructor({ sequencer = null, node = null } = {}) {
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
          "Content-Type": "application/vnd.msgpack",
        },
      }
    );

    let data = msgpackr.unpack(new Uint8Array(await response.arrayBuffer()));

    return data.balance;
  }

  async getSequencerFees() {
    const response = await fetch(`${this.sequencer}/sequencer-prices`, {
      method: "GET",
      headers: {
        "Content-Type": "application/vnd.msgpack",
      },
    });

    let data = msgpackr.unpack(new Uint8Array(await response.arrayBuffer()));

    return data;
  }

  async getTransactionFee(transaction) {
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
    tx.actions = tx.actions.filter((action) => action.action !== "allocateGas");

    let signature = await this.signingFunction(tx.rawTxID());
    tx.signature = signature;

    const encodedTx = tx.encode();

    const response = await fetch(`${this.node}/calculateTxGas`, {
      method: "POST",
      headers: [
        ["Content-Type", "application/vnd.msgpack"],
        ["Content-Length", encodedTx.byteLength.toString()],
      ],
      body: encodedTx,
    });

    let data = msgpackr.unpack(new Uint8Array(await response.arrayBuffer()));

    return {
      gasNeeded: Math.abs(data.gas),
    };
  }

  KV(contractId) {
    if (!this.node) {
      throw new Error("You must provide a Node in Clients constructor");
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

    let signature = await this.signingFunction({ ...tx });
    tx.signature = signature;

    const encodedTx = tx.encode();

    console.log(signature);
    const response = await fetch(`${this.sequencer}/tx`, {
      method: "POST",
      headers: [
        ["Content-Type", "application/vnd.msgpack"],
        ["Content-Length", encodedTx.byteLength.toString()],
      ],
      body: encodedTx,
    });
    let data;
    try {
      data = msgpackr.unpack(new Uint8Array(await response.arrayBuffer()));
    } catch (e) {
      console.error(e);
    }
    return data;
  }

  async getSequencerFeePerByteAswellAsYourSequencerBalanceAndFeeForTransactionAndIfYouCantAffordToUploadThenDepositToSequencerThenUploadOrJustUploadIfBalanceSuffices(
    Transaction
  ) {
    let tx = new HighlayerTx(Transaction);

    let sequencerFees = await this.getSequencerFees();
    let sequnecerFeePerByte = sequencerFees.feePerByte;

    let getSequencerBalance = await this.getSequencerBalance(tx.address);
    let transactionByteLength = Buffer.byteLength(tx.encode(), "utf8");

    let fee = Big(sequnecerFeePerByte).mul(transactionByteLength);

    let remainingBalance = Big(getSequencerBalance).minus(fee);

    if (remainingBalance.lt(0)) {
      let sequencerDepositTX = new TransactionBuilder()
        .setAddress(tx.address)
        .addActions([Actions.sequencerDeposit({ amount: fee.toString() })]);

      try {
        await this.signAndBroadcast(sequencerDepositTX);
      } catch (e) {
        console.error(e);
        return false;
      }
    }

    return await this.signAndBroadcast(Transaction);
  }
}

class HighlayerContract extends KVStore {
  constructor({ SigningClient, Sequencer, node, contractId }) {
    super({ node, contractId });
    this.SigningClient = SigningClient;
    this.Sequencer = Sequencer;
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

    // console.log(this.node);
    return this.SigningClient.signAndBroadcast(transaction);
  }
}

module.exports = { HighlayerClient, SigningHighlayerClient };
