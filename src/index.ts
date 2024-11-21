import { Keypair, PublicKey } from "@solana/web3.js";
import * as bip39 from "bip39";
import { derivePath } from "ed25519-hd-key";

const config = {
  TARGET_PUBKEY: new PublicKey(""),
  KNOWN_23_WORD_MNEMONIC: "",
  DERIVATION_PATHS: ["m/44'/501'/$'/0'", "m/44'/501'/$'", "m/501'/$'/0'/0'"],
  INDEX_DEPTH: 5,
};

const main = async () => {
  const knownMnemonicArray = config.KNOWN_23_WORD_MNEMONIC.split(" ");

  if (knownMnemonicArray.length !== 23) {
    console.error("Known Mnemonic needs to have exactly 23 words");
    return;
  }

  rootLoop: for (let i = 0; i < 24; i++) {
    console.log(`Word ${i + 1} out of 24`);
    for (let j = 0; j < bip39.wordlists.english.length; j++) {
      const possibleMnemonic = [
        ...knownMnemonicArray.slice(0, i),
        bip39.wordlists.english[j],
        ...knownMnemonicArray.slice(i),
      ];

      const seed = await bip39.mnemonicToSeed(possibleMnemonic.join(" "));

      for (const path of config.DERIVATION_PATHS) {
        for (let z = 0; z < config.INDEX_DEPTH; z++) {
          const derivedSeed = derivePath(path.replace("$", z.toString()), Buffer.from(seed).toString("hex")).key;
          const kp = Keypair.fromSeed(derivedSeed);

          if (kp.publicKey.toBase58() === config.TARGET_PUBKEY.toBase58()) {
            console.log(
              `Found pubkey in "${possibleMnemonic.join(" ")}" seed phrase at ${path.replace(
                "$",
                z.toString()
              )} derivation path`
            );

            break rootLoop;
          }
        }
      }
    }
  }
};

main();
