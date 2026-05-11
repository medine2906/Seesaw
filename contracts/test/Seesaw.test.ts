import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { Seesaw } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

const VOTE = ethers.parseEther("0.01");
const FIVE_MIN = 5 * 60;

describe("Seesaw", function () {
  let seesaw: Seesaw;
  let creator: HardhatEthersSigner;
  let alice: HardhatEthersSigner;
  let bob: HardhatEthersSigner;
  let carol: HardhatEthersSigner;

  beforeEach(async () => {
    [creator, alice, bob, carol] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("Seesaw");
    seesaw = (await Factory.deploy()) as Seesaw;
  });

  it("submitContent creates a content entry", async () => {
    const tx = await seesaw.connect(creator).submitContent("ipfs://test");
    await tx.wait();
    const c = await seesaw.getContent(0);
    expect(c.creator).to.equal(creator.address);
    expect(c.metadataURI).to.equal("ipfs://test");
    expect(c.settled).to.be.false;
    expect(await seesaw.contentCount()).to.equal(1n);
  });

  it("voteUp and voteDown update pools correctly", async () => {
    await seesaw.connect(creator).submitContent("ipfs://test");
    await seesaw.connect(alice).voteUp(0, { value: VOTE });
    await seesaw.connect(bob).voteDown(0, { value: VOTE });
    await seesaw.connect(carol).voteUp(0, { value: VOTE });

    const c = await seesaw.getContent(0);
    expect(c.posPool).to.equal(VOTE * 2n);
    expect(c.negPool).to.equal(VOTE);
  });

  it("getTiltRatio returns correct values", async () => {
    await seesaw.connect(creator).submitContent("ipfs://test");
    expect(await seesaw.getTiltRatio(0)).to.equal(0n);

    await seesaw.connect(alice).voteUp(0, { value: VOTE });
    expect(await seesaw.getTiltRatio(0)).to.equal(100n); // 100% positive

    await seesaw.connect(bob).voteDown(0, { value: VOTE });
    expect(await seesaw.getTiltRatio(0)).to.equal(0n); // 50/50

    await seesaw.connect(carol).voteDown(0, { value: VOTE });
    // posPool=1, negPool=2, total=3 → (1*200/3)-100 = 66-100 = -33
    const ratio = await seesaw.getTiltRatio(0);
    expect(ratio).to.be.lt(0n);
  });

  it("settle: positive wins — creator gets 80%, pos voters split 20%", async () => {
    await seesaw.connect(creator).submitContent("ipfs://test");
    await seesaw.connect(alice).voteUp(0, { value: VOTE });
    await seesaw.connect(bob).voteUp(0, { value: VOTE });
    await seesaw.connect(carol).voteDown(0, { value: VOTE });

    await time.increase(FIVE_MIN + 1);

    const totalPool = VOTE * 3n;
    const creatorExpected = (totalPool * 80n) / 100n;
    const voterRewards = totalPool - creatorExpected;

    const creatorBefore = await ethers.provider.getBalance(creator.address);
    const aliceBefore = await ethers.provider.getBalance(alice.address);
    const bobBefore = await ethers.provider.getBalance(bob.address);

    await seesaw.connect(carol).settle(0); // carol settles (anyone can)

    const creatorAfter = await ethers.provider.getBalance(creator.address);
    const aliceAfter = await ethers.provider.getBalance(alice.address);
    const bobAfter = await ethers.provider.getBalance(bob.address);

    expect(creatorAfter - creatorBefore).to.equal(creatorExpected);
    // alice and bob each contributed equally so they split voterRewards 50/50
    expect(aliceAfter - aliceBefore).to.be.closeTo(voterRewards / 2n, ethers.parseEther("0.0001"));
    expect(bobAfter - bobBefore).to.be.closeTo(voterRewards / 2n, ethers.parseEther("0.0001"));

    const c = await seesaw.getContent(0);
    expect(c.settled).to.be.true;
  });

  it("settle: negative wins — neg voters split 100%", async () => {
    await seesaw.connect(creator).submitContent("ipfs://test");
    await seesaw.connect(alice).voteUp(0, { value: VOTE });
    await seesaw.connect(bob).voteDown(0, { value: VOTE });
    await seesaw.connect(carol).voteDown(0, { value: VOTE });

    await time.increase(FIVE_MIN + 1);

    const totalPool = VOTE * 3n;
    const bobBefore = await ethers.provider.getBalance(bob.address);
    const carolBefore = await ethers.provider.getBalance(carol.address);

    const settleTx = await seesaw.connect(alice).settle(0);
    const receipt = await settleTx.wait();
    const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

    const bobAfter = await ethers.provider.getBalance(bob.address);
    const carolAfter = await ethers.provider.getBalance(carol.address);
    const aliceAfter = await ethers.provider.getBalance(alice.address);

    // Bob and carol each get half of totalPool
    expect(bobAfter - bobBefore).to.be.closeTo(totalPool / 2n, ethers.parseEther("0.0001"));
    expect(carolAfter - carolBefore).to.be.closeTo(totalPool / 2n, ethers.parseEther("0.0001"));
  });

  it("reverts on double-settle and early settle", async () => {
    await seesaw.connect(creator).submitContent("ipfs://test");
    await seesaw.connect(alice).voteUp(0, { value: VOTE });

    await expect(seesaw.settle(0)).to.be.revertedWithCustomError(seesaw, "NotYetSettleable");

    await time.increase(FIVE_MIN + 1);
    await seesaw.settle(0);

    await expect(seesaw.settle(0)).to.be.revertedWithCustomError(seesaw, "AlreadySettled");
  });

  it("reverts voting with wrong amount or after deadline", async () => {
    await seesaw.connect(creator).submitContent("ipfs://test");

    await expect(
      seesaw.connect(alice).voteUp(0, { value: ethers.parseEther("0.005") })
    ).to.be.revertedWithCustomError(seesaw, "WrongVoteAmount");

    await time.increase(FIVE_MIN + 1);
    await expect(
      seesaw.connect(alice).voteUp(0, { value: VOTE })
    ).to.be.revertedWithCustomError(seesaw, "VotingClosed");
  });
});
