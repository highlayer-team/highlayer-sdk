const { SigningHighlayerClient, PrivateKeySigner } = require("highlayer-sdk");

const PRIVATE_KEY = "";
const ADDRESS = "";

(async () => {
  let SigningClinet = new SigningHighlayerClient({
    sequencer: "http://sequencer-testnet.highlayer.io/",
    signingFunction: PrivateKeySigner(PRIVATE_KEY, ADDRESS),
  });

  console.log(
    await SigningClinet.ensureDeposit({
      address: "", // Your Address
      minBalance: "100", // The minium balance you need to ignore depositing
      deposit: "500", // If your balance is less than above deposit this much
    })
  );
})();
