const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Pulse", function () {
    let pulse;
    let owner;
    let user1;
    let user2;
    let user3;

    beforeEach(async function () {
        [owner, user1, user2, user3] = await ethers.getSigners();

        const Pulse = await ethers.getContractFactory("Pulse");
        pulse = await Pulse.deploy();
        await pulse.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await pulse.owner()).to.equal(owner.address);
        });

        it("Should start unpaused", async function () {
            expect(await pulse.paused()).to.equal(false);
        });

        it("Should have zero initial stats", async function () {
            const [totalUsers, totalCheckins, totalPoints] = await pulse.getGlobalStats();
            expect(totalUsers).to.equal(0);
            expect(totalCheckins).to.equal(0);
            expect(totalPoints).to.equal(0);
        });
    });

    describe("Daily Check-in", function () {
        it("Should allow first check-in", async function () {
            await expect(pulse.connect(user1).dailyCheckin())
                .to.emit(pulse, "UserJoined")
                .and.to.emit(pulse, "QuestCompleted");
        });

        it("Should create user profile on first check-in", async function () {
            await pulse.connect(user1).dailyCheckin();
            const profile = await pulse.getUserProfile(user1.address);

            expect(profile.exists).to.equal(true);
            expect(profile.totalPoints).to.equal(50); // POINTS_DAILY_CHECKIN
            expect(profile.currentStreak).to.equal(1);
            expect(profile.level).to.equal(1);
        });

        it("Should not allow double check-in same day", async function () {
            await pulse.connect(user1).dailyCheckin();
            await expect(pulse.connect(user1).dailyCheckin())
                .to.be.revertedWith("Already checked in today");
        });

        it("Should increment total users and checkins", async function () {
            await pulse.connect(user1).dailyCheckin();
            await pulse.connect(user2).dailyCheckin();

            const [totalUsers, totalCheckins] = await pulse.getGlobalStats();
            expect(totalUsers).to.equal(2);
            expect(totalCheckins).to.equal(2);
        });
    });

    describe("Other Quests", function () {
        beforeEach(async function () {
            // First check-in to create user
            await pulse.connect(user1).dailyCheckin();
        });

        it("Should complete relay signal quest", async function () {
            await expect(pulse.connect(user1).relaySignal())
                .to.emit(pulse, "QuestCompleted");

            const profile = await pulse.getUserProfile(user1.address);
            expect(profile.totalPoints).to.equal(150); // 50 + 100
        });

        it("Should complete update atmosphere quest", async function () {
            await expect(pulse.connect(user1).updateAtmosphere(5))
                .to.emit(pulse, "QuestCompleted");
        });

        it("Should reject invalid weather code", async function () {
            await expect(pulse.connect(user1).updateAtmosphere(15))
                .to.be.revertedWith("Invalid weather code");
        });

        it("Should complete commit message quest", async function () {
            await expect(pulse.connect(user1).commitMessage("Hello PULSE!"))
                .to.emit(pulse, "MessageCommitted")
                .and.to.emit(pulse, "QuestCompleted");

            const message = await pulse.getUserMessage(user1.address, 0);
            expect(message.content).to.equal("Hello PULSE!");
        });

        it("Should not allow commit message quest twice in one day", async function () {
            await pulse.connect(user1).commitMessage("Hello PULSE!");
            await expect(pulse.connect(user1).commitMessage("Second message"))
                .to.be.revertedWith("Quest already completed");
        });

        it("Should complete predict pulse quest", async function () {
            await expect(pulse.connect(user1).predictPulse(7))
                .to.emit(pulse, "PredictionMade");
        });

        it("Should not allow predict pulse quest twice in one day", async function () {
            await pulse.connect(user1).predictPulse(7);
            await expect(pulse.connect(user1).predictPulse(8))
                .to.be.revertedWith("Quest already completed");
        });

        it("Should reject invalid prediction level", async function () {
            await expect(pulse.connect(user1).predictPulse(0))
                .to.be.revertedWith("Invalid prediction level");
            await expect(pulse.connect(user1).predictPulse(11))
                .to.be.revertedWith("Invalid prediction level");
        });
    });

    describe("Nudge Friend", function () {
        beforeEach(async function () {
            await pulse.connect(user1).dailyCheckin();
            await pulse.connect(user2).dailyCheckin();
            await pulse.connect(user3).dailyCheckin();
        });

        it("Should nudge a friend", async function () {
            await expect(pulse.connect(user1).nudgeFriend(user2.address))
                .to.emit(pulse, "FriendNudged");
        });

        it("Should not nudge yourself", async function () {
            await expect(pulse.connect(user1).nudgeFriend(user1.address))
                .to.be.revertedWith("Cannot nudge yourself");
        });

        it("Should not nudge non-existent user", async function () {
            const randomAddress = ethers.Wallet.createRandom().address;
            await expect(pulse.connect(user1).nudgeFriend(randomAddress))
                .to.be.revertedWith("Friend does not exist");
        });

        it("Should not nudge same friend twice in one day", async function () {
            await pulse.connect(user1).nudgeFriend(user2.address);
            await expect(pulse.connect(user1).nudgeFriend(user2.address))
                .to.be.revertedWith("Quest already completed");
        });

        it("Should not nudge multiple friends in one day", async function () {
            await pulse.connect(user1).nudgeFriend(user2.address);
            await expect(pulse.connect(user1).nudgeFriend(user3.address))
                .to.be.revertedWith("Quest already completed");
        });
    });

    describe("Admin Functions", function () {
        it("Should allow owner to pause", async function () {
            await pulse.connect(owner).pause();
            expect(await pulse.paused()).to.equal(true);
        });

        it("Should block quests when paused", async function () {
            await pulse.connect(owner).pause();
            await expect(pulse.connect(user1).dailyCheckin())
                .to.be.revertedWithCustomError(pulse, "EnforcedPause");
        });

        it("Should allow owner to unpause", async function () {
            await pulse.connect(owner).pause();
            await pulse.connect(owner).unpause();
            expect(await pulse.paused()).to.equal(false);
        });

        it("Should not allow non-owner to pause", async function () {
            await expect(pulse.connect(user1).pause())
                .to.be.revertedWithCustomError(pulse, "OwnableUnauthorizedAccount");
        });
    });

    describe("View Functions", function () {
        it("Should return current day", async function () {
            const day = await pulse.getCurrentDay();
            const expectedDay = Math.floor(Date.now() / 1000 / 86400);
            expect(day).to.be.closeTo(expectedDay, 1);
        });

        it("Should check quest completion", async function () {
            await pulse.connect(user1).dailyCheckin();

            expect(await pulse.hasCompletedQuestToday(user1.address, 1)).to.equal(true);
            expect(await pulse.hasCompletedQuestToday(user1.address, 2)).to.equal(false);
        });
    });
});

