const {
  SigningHighlayerClient,
  TransactionBuilder,
  Actions,
  bip322,
} = require("highlayer-sdk");

const PRIVATE_KEY = "";
const ADDRESS =
  "tb1p0wt007yyzfswhsnwnc45ly9ktyefzyrwznwja0m4gr7n9vjactes80klh4";

(async () => {
  let SigningClinet = new SigningHighlayerClient({
    sequencer: "http://127.0.0.1:2880",
    signingFunction: function signer(data) {
      return bip322.Signer.sign(PRIVATE_KEY, ADDRESS, data);
    },
  });

  const transaction = new TransactionBuilder().setAddress(ADDRESS).addActions([
    Actions.allocateGas({ amount: "100", price: "10" }),
    Actions.transfer({
      amount: "1000000000000000",
      recipient:
        "tb1p0wt007yyzfswhsnwnc45ly9ktyefzyrwznwja0m4gr7n9vjactes80klh4",
    }),
  ]);

  console.log(await SigningClinet.signAndBroadcast(transaction));
})();
