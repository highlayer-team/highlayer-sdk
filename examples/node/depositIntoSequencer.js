const {
  SigningHighlayerClient,
  TransactionBuilder,
  Actions,
  PrivateKeySigner,
} = require("highlayer-sdk");

const PRIVATE_KEY = "";
const ADDRESS = "";

(async () => {
  let SigningClinet = new SigningHighlayerClient({
    sequencer: "http://sequencer.highlayer.io/",
    node: "https://seed-node.highlayer.io/",
    signingFunction: PrivateKeySigner(PRIVATE_KEY, ADDRESS),
  });

  const transaction = new TransactionBuilder()
    .setAddress(ADDRESS)
    .addActions([Actions.sequencerDeposit({ amount: "1000" })]);

  console.log(await SigningClinet.signAndBroadcast(transaction));
})();
