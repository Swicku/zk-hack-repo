import {Injectable} from "@nestjs/common";
import {AccountUpdate, fetchAccount, Field, MerkleTree, Mina, PrivateKey, PublicKey, UInt32, UInt64} from "o1js";
import {Voter, Voting } from "./Voting";

const COMMUNITY_MEMBERS = [
    {
        index: 0n,
        key: "B62qp8vaXi3ccMtRBWxkNp148Dngt6xEvc3KbWfXESv8tcfvM2TspeW",
    },
    {
        index: 1n,
        key: "B62qp8vaXi3ccMtRBWxkNp148Dngt6xEvc3KbWfXESv8tcfvM2TspeW",
    },
    {
        index: 2n,
        key: "B62qrykqwRReYSjTCDCVJs8ju7aCtmQUqSuLrQ9PrAEqkMY2W9Dj4gD",
    },
    {
        index: 3n,
        key: "B62qr14qM5mUNKwDtqAHiA4hAy2oSqrzbArbK3ZnLdsA5oqBJRMPacs",
    },
];


const networkUrl = "https://api.minascan.io/node/devnet/v1/graphql";
// :O
const privateKeyBase58 = "EKEG5UX4zWPdfa88THjoAUkJkEt6PaZh15PSgz2DTC8AALg6rWCy";

@Injectable()
export class ManagementService {
    async deployContract(verificationKey: { data: string; hash: string | Field }) {
        let privateKey = PrivateKey.fromBase58(privateKeyBase58);
        let publicKey = privateKey.toPublicKey();

        let appPrivateKey = PrivateKey.random()
        let appPublicKey = appPrivateKey.toPublicKey()


        let sender = privateKey.toPublicKey();

        const contract = new Voting(appPublicKey);

        const Tree = new MerkleTree(8);

        for (let i = 0; i < COMMUNITY_MEMBERS.length; i++) {
            let voter = new Voter({
                publicKey: PublicKey.fromBase58(COMMUNITY_MEMBERS[i].key),
                decision: UInt32.from(0),
            });

            Tree.setLeaf(COMMUNITY_MEMBERS[i].index, voter.hash());
        }

        let initialRoot = Tree.getRoot();
        contract.root.set(initialRoot)
        // contract.title.set(Field.from('New Parking'))
        // contract.description.set(Field.from('New parking for all of us to enjoy!'))
        Mina.setActiveInstance(Mina.Network(networkUrl));

        // let { account } = await fetchAccount({ publicKey: appPublicKey });
        // let isDeployed = account?.zkapp?.verificationKey !== undefined;
        let isDeployed = false

        if (isDeployed) {
            console.log(
                'zkApp for public key',
                appPublicKey.toBase58(),
                'found deployed'
            );
        } else {
            console.log('Deploying zkapp for public key', appPublicKey.toBase58());
            let transaction = await Mina.transaction(
                { sender, fee: 1000000 },
                async () => {
                    AccountUpdate.fundNewAccount(publicKey);
                    await Voting.compile()
                    // NOTE: this calls `init()` if this is the first deploy
                    await contract.deploy({ verificationKey });
                }
            );
            await transaction.prove();
            transaction.sign([privateKey, appPrivateKey]);

            console.log('Sending the deploy transaction...');
            const res = await transaction.send();
            if (res.status === 'rejected') {
                console.log('error sending transaction (see above)');
            } else {
                console.log(
                    'See deploy transaction at',
                    `https://minascan.io/devnet/tx/${res.hash}`
                );
                console.log('waiting for zkApp account to be deployed...');
                await res.wait();
                isDeployed = true;
            }
        }
        return isDeployed;
    }

}