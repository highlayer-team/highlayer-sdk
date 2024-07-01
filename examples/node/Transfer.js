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

  const transaction = new TransactionBuilder().setAddress(ADDRESS).addActions([
    Actions.allocateGas({ amount: "100", price: "10" }),
    Actions.transfer({
      amount: "1000000000000000",
      recipient: "ADDRESS",
    }),
  ]);

  console.log(await SigningClinet.signAndBroadcast(transaction));
})();
