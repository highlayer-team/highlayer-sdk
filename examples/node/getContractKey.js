const { HighlayerClient, PrivateKeySigner } = require("../../src");

const ContractAddress =
  "hlcontract1qrktkf7a63qdr73rtwsvafdv3kd9r5whs8q7w88f2wsdv4mgcc6jqf9aq4x";
const Key = "balances.yourAddress";

(async () => {
  let SigningClinet = new HighlayerClient({
    sequencer: "http://127.0.0.1:2880",
    node: "http://51.159.210.149:3000",
  });

  let contract = SigningClinet.KV(ContractAddress);

  console.log(await contract.get(Key));
})();
