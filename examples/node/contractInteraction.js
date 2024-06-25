const {
  SigningHighlayerClient,
  HighlayerContract,
  TransactionBuilder,
  Actions,
  PrivateKeySigner,
} = require("../../src");

const PRIVATE_KEY = "";
const ADDRESS =
  "tb1p0wt007yyzfswhsnwnc45ly9ktyefzyrwznwja0m4gr7n9vjactes80klh4";
const CONTRACT =
  "hlcontract1qrktkf7a63qdr73rtwsvafdv3kd9r5whs8q7w88f2wsdv4mgcc6jqf9aq4x";

const ACTION = "transfer";
const PARAMS = {
  to: "test",
  amount: "100",
};

(async () => {
  const SigningClient = new SigningHighlayerClient({
    node: "http://51.159.210.149:3000",
    sequencer: "http://51.159.210.149:2880",
    signingFunction: PrivateKeySigner(PRIVATE_KEY, ADDRESS),
  });

  const contract = SigningClient.Contract(CONTRACT);

  console.log(
    await contract.interact({
      action: ACTION,
      params: PARAMS,
      gas: Actions.allocateGas({
        amount: 100,
        price: 1,
      }),
      address: ADDRESS,
    })
  );
})();
