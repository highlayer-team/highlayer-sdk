const { SigningHighlayerClient, bip322 } = require("highlayer-sdk");

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

  console.log(
    await SigningClinet.ensureDeposit({
      address: "tb1p0wt007yyzfswhsnwnc45ly9ktyefzyrwznwja0m4gr7n9vjactes80klh4", // Your Address
      minBalance: "100", // The minium balance you need to ignore depositing
      deposit: "500", // If your balance is less than above deposit this much
    })
  );
})();
