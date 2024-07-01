const { HighlayerClient, PrivateKeySigner } = require("highlayer-sdk");

const ContractAddress =
  "hlcontract1qjty79prmqevsrn6e6tutfu2tkmccvkrq4r6ztwkrd0mn7j5j5jyqtrp523";
const Key = "counter";

(async () => {
  let SigningClinet = new HighlayerClient({
    sequencer: "http://sequencer.highlayer.io/",
    node: "https://seed-node.highlayer.io/",
  });

  let contract = SigningClinet.KV(ContractAddress);

  console.log(await contract.get(Key));
})();
