const {
  SigningHighlayerClient,
  Actions,
  PrivateKeySigner,
} = require("highlayer-sdk");

const PRIVATE_KEY = "";
const ADDRESS = "";
const CONTRACT =
  "hlcontract1qrktkf7a63qdr73rtwsvafdv3kd9r5whs8q7w88f2wsdv4mgcc6jqf9aq4x";

const ACTION = "transfer";
const PARAMS = {
  to: "test",
  amount: "100",
};

(async () => {
  const SigningClient = new SigningHighlayerClient({
    sequencer: "http://sequencer.highlayer.io/",
    node: "https://seed-node.highlayer.io/",
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
