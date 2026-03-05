// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PULSE - Daily Ritual dApp Smart Contract
 * @author PULSE Team
 * @notice Implements daily check-ins, streak tracking, quests, and points system
 * @dev Designed for Base (Ethereum L2) deployment
 * 
 * Security Considerations:
 * - No unbounded loops
 * - ReentrancyGuard on state-changing functions
 * - Input validation on all public functions
 * - Access control with owner pattern
 * - SafeMath not needed (Solidity ^0.8.0+ has built-in overflow checks)
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract Pulse is Ownable, ReentrancyGuard, Pausable {
    // ============================================
    // CONSTANTS
    // ============================================
    
    // Time constants
    uint256 public constant SECONDS_PER_DAY = 86400;
    uint256 public constant STREAK_GRACE_PERIOD = 2 days;
    uint256 public constant COMBO_WINDOW = 5 hours;
    
    // Quest IDs
    uint8 public constant QUEST_DAILY_CHECKIN = 1;
    uint8 public constant QUEST_RELAY_SIGNAL = 2;
    uint8 public constant QUEST_UPDATE_ATMOSPHERE = 3;
    uint8 public constant QUEST_NUDGE_FRIEND = 4;
    uint8 public constant QUEST_MINT_HOUR_BADGE = 5;
    uint8 public constant QUEST_COMMIT_MESSAGE = 6;
    uint8 public constant QUEST_STAKE_STREAK = 7;
    uint8 public constant QUEST_CLAIM_MILESTONE = 8;
    uint8 public constant QUEST_PREDICT_PULSE = 9;
    uint8 public constant QUEST_OPEN_CAPSULE = 10;
    
    // Points per quest
    uint256 public constant POINTS_DAILY_CHECKIN = 50;
    uint256 public constant POINTS_RELAY_SIGNAL = 100;
    uint256 public constant POINTS_UPDATE_ATMOSPHERE = 30;
    uint256 public constant POINTS_NUDGE_FRIEND = 40;
    uint256 public constant POINTS_MINT_HOUR_BADGE = 60;
    uint256 public constant POINTS_COMMIT_MESSAGE = 20;
    uint256 public constant POINTS_STAKE_STREAK = 200;
    uint256 public constant POINTS_CLAIM_MILESTONE = 500;
    uint256 public constant POINTS_PREDICT_PULSE = 80;
    uint256 public constant POINTS_OPEN_CAPSULE = 1000;
    uint256 public constant COMBO_BONUS_POINTS = 200;
    
    // ============================================
    // STRUCTS
    // ============================================
    
    struct UserProfile {
        uint256 totalPoints;
        uint256 currentStreak;
        uint256 longestStreak;
        uint256 lastCheckinTime;
        uint256 totalCheckins;
        uint256 level;
        uint256 stakedAmount;
        uint256 joinedTime;
        bool exists;
    }
    
    struct DailyQuestStatus {
        uint16 completedQuests;  // Bitmap for quests 1-10
        uint256 firstQuestTime;  // For combo tracking
        bool comboActivated;
    }
    
    struct Message {
        string content;
        uint256 timestamp;
    }
    
    struct Prediction {
        uint8 predictedActivity;
        uint256 predictionTime;
    }
    
    // ============================================
    // STATE VARIABLES
    // ============================================
    
    // User profiles
    mapping(address => UserProfile) public userProfiles;
    
    // Daily quest status: user => day => status
    mapping(address => mapping(uint256 => DailyQuestStatus)) public dailyQuests;
    
    // User messages: user => messageId => message
    mapping(address => mapping(uint256 => Message)) public userMessages;
    mapping(address => uint256) public userMessageCount;
    
    // Nudge tracking: keccak256(nudger, nudged, day) => bool
    mapping(bytes32 => bool) public nudges;
    
    // Predictions: user => day => prediction
    mapping(address => mapping(uint256 => Prediction)) public predictions;
    
    // Global statistics
    uint256 public totalUsers;
    uint256 public totalCheckins;
    uint256 public totalPointsDistributed;
    
    // ============================================
    // EVENTS
    // ============================================
    
    event UserJoined(address indexed user, uint256 timestamp);
    event QuestCompleted(
        address indexed user, 
        uint8 indexed questId, 
        uint256 pointsEarned, 
        uint256 day
    );
    event StreakUpdated(address indexed user, uint256 newStreak, uint256 longestStreak);
    event ComboActivated(address indexed user, uint256 bonusPoints, uint256 day);
    event MessageCommitted(address indexed user, uint256 messageId, uint256 timestamp);
    event FriendNudged(address indexed nudger, address indexed nudged, uint256 day);
    event PredictionMade(address indexed user, uint8 prediction, uint256 day);
    event LevelUp(address indexed user, uint256 newLevel);
    
    // ============================================
    // CONSTRUCTOR
    // ============================================
    
    constructor() Ownable(msg.sender) {
        // Contract deploys in unpaused state
    }
    
    // ============================================
    // MODIFIERS
    // ============================================
    
    modifier userExists() {
        require(userProfiles[msg.sender].exists, "User does not exist");
        _;
    }
    
    // ============================================
    // INTERNAL FUNCTIONS
    // ============================================
    
    /**
     * @dev Get current day number since Unix epoch
     */
    function _getCurrentDay() internal view returns (uint256) {
        return block.timestamp / SECONDS_PER_DAY;
    }
    
    /**
     * @dev Check if a specific quest is completed in the bitmap
     */
    function _isQuestCompleted(uint16 bitmap, uint8 questId) internal pure returns (bool) {
        return (bitmap & uint16(1 << questId)) != 0;
    }
    
    /**
     * @dev Set a quest as completed in bitmap
     */
    function _setQuestCompleted(uint16 bitmap, uint8 questId) internal pure returns (uint16) {
        return bitmap | uint16(1 << questId);
    }
    
    /**
     * @dev Calculate streak multiplier (1x, 2x, or 3x)
     */
    function _getStreakMultiplier(uint256 streak) internal pure returns (uint256) {
        if (streak <= 7) return 1;
        if (streak <= 30) return 2;
        return 3;
    }
    
    /**
     * @dev Initialize user if not exists
     */
    function _ensureUserExists(address user) internal {
        if (!userProfiles[user].exists) {
            userProfiles[user] = UserProfile({
                totalPoints: 0,
                currentStreak: 0,
                longestStreak: 0,
                lastCheckinTime: 0,
                totalCheckins: 0,
                level: 1,
                stakedAmount: 0,
                joinedTime: block.timestamp,
                exists: true
            });
            totalUsers++;
            emit UserJoined(user, block.timestamp);
        }
    }
    
    /**
     * @dev Add points to user with streak multiplier
     */
    function _addPoints(address user, uint256 basePoints) internal returns (uint256) {
        UserProfile storage profile = userProfiles[user];
        uint256 multiplier = _getStreakMultiplier(profile.currentStreak);
        uint256 pointsToAdd = basePoints * multiplier;
        
        profile.totalPoints += pointsToAdd;
        totalPointsDistributed += pointsToAdd;
        
        // Check for level up
        uint256 newLevel = (profile.totalPoints / 1000) + 1;
        if (newLevel > profile.level) {
            profile.level = newLevel;
            emit LevelUp(user, newLevel);
        }
        
        return pointsToAdd;
    }
    
    /**
     * @dev Update streak on check-in
     */
    function _updateStreak(address user) internal returns (uint256) {
        UserProfile storage profile = userProfiles[user];
        
        uint256 timeSinceLastCheckin = block.timestamp - profile.lastCheckinTime;
        
        // First ever check-in or within one day
        if (profile.lastCheckinTime == 0) {
            profile.currentStreak = 1;
        } else if (timeSinceLastCheckin <= SECONDS_PER_DAY) {
            // Already checked in today, streak unchanged
        } else if (timeSinceLastCheckin <= STREAK_GRACE_PERIOD) {
            // Within grace period, increment streak
            profile.currentStreak++;
        } else {
            // Streak broken, reset to 1
            profile.currentStreak = 1;
        }
        
        // Update longest streak
        if (profile.currentStreak > profile.longestStreak) {
            profile.longestStreak = profile.currentStreak;
        }
        
        profile.lastCheckinTime = block.timestamp;
        profile.totalCheckins++;
        
        emit StreakUpdated(user, profile.currentStreak, profile.longestStreak);
        return profile.currentStreak;
    }
    
    /**
     * @dev Check if daily combo is achieved
     */
    function _checkDailyCombo(address user, uint256 day) internal view returns (bool) {
        DailyQuestStatus storage status = dailyQuests[user][day];
        
        // Check if quests 1, 3, and 6 are completed
        bool hasCheckin = _isQuestCompleted(status.completedQuests, QUEST_DAILY_CHECKIN);
        bool hasAtmosphere = _isQuestCompleted(status.completedQuests, QUEST_UPDATE_ATMOSPHERE);
        bool hasMessage = _isQuestCompleted(status.completedQuests, QUEST_COMMIT_MESSAGE);
        
        // Check if within combo window
        bool withinWindow = (block.timestamp - status.firstQuestTime) <= COMBO_WINDOW;
        
        return hasCheckin && hasAtmosphere && hasMessage && withinWindow && !status.comboActivated;
    }
    
    // ============================================
    // PUBLIC FUNCTIONS - QUESTS
    // ============================================
    
    /**
     * @notice Quest 1: Daily Check-In
     * @dev Records daily check-in and updates streak
     */
    function dailyCheckin() external nonReentrant whenNotPaused returns (uint256 pointsEarned) {
        address user = msg.sender;
        uint256 day = _getCurrentDay();
        
        _ensureUserExists(user);
        
        DailyQuestStatus storage status = dailyQuests[user][day];
        require(!_isQuestCompleted(status.completedQuests, QUEST_DAILY_CHECKIN), "Already checked in today");
        
        // Set first quest time if this is the first quest of the day
        if (status.completedQuests == 0) {
            status.firstQuestTime = block.timestamp;
        }
        
        status.completedQuests = _setQuestCompleted(status.completedQuests, QUEST_DAILY_CHECKIN);
        
        _updateStreak(user);
        pointsEarned = _addPoints(user, POINTS_DAILY_CHECKIN);
        totalCheckins++;
        
        emit QuestCompleted(user, QUEST_DAILY_CHECKIN, pointsEarned, day);
    }
    
    /**
     * @notice Quest 2: Relay Signal
     * @dev Pass the torch to another timezone
     */
    function relaySignal() external nonReentrant whenNotPaused userExists returns (uint256 pointsEarned) {
        address user = msg.sender;
        uint256 day = _getCurrentDay();
        
        DailyQuestStatus storage status = dailyQuests[user][day];
        require(!_isQuestCompleted(status.completedQuests, QUEST_RELAY_SIGNAL), "Quest already completed");
        
        if (status.completedQuests == 0) status.firstQuestTime = block.timestamp;
        status.completedQuests = _setQuestCompleted(status.completedQuests, QUEST_RELAY_SIGNAL);
        
        pointsEarned = _addPoints(user, POINTS_RELAY_SIGNAL);
        emit QuestCompleted(user, QUEST_RELAY_SIGNAL, pointsEarned, day);
    }
    
    /**
     * @notice Quest 3: Update Atmosphere
     * @dev Sync local weather to chain
     * @param weatherCode Weather code (0-10)
     */
    function updateAtmosphere(uint8 weatherCode) external nonReentrant whenNotPaused userExists returns (uint256 pointsEarned) {
        require(weatherCode <= 10, "Invalid weather code");
        
        address user = msg.sender;
        uint256 day = _getCurrentDay();
        
        DailyQuestStatus storage status = dailyQuests[user][day];
        require(!_isQuestCompleted(status.completedQuests, QUEST_UPDATE_ATMOSPHERE), "Quest already completed");
        
        if (status.completedQuests == 0) status.firstQuestTime = block.timestamp;
        status.completedQuests = _setQuestCompleted(status.completedQuests, QUEST_UPDATE_ATMOSPHERE);
        
        pointsEarned = _addPoints(user, POINTS_UPDATE_ATMOSPHERE);
        emit QuestCompleted(user, QUEST_UPDATE_ATMOSPHERE, pointsEarned, day);
    }
    
    /**
     * @notice Quest 4: Nudge Friend
     * @dev Ping a friend to save their streak
     * @param friend Address of friend to nudge
     */
    function nudgeFriend(address friend) external nonReentrant whenNotPaused userExists returns (uint256 pointsEarned) {
        require(friend != msg.sender, "Cannot nudge yourself");
        require(userProfiles[friend].exists, "Friend does not exist");
        
        address user = msg.sender;
        uint256 day = _getCurrentDay();
        
        DailyQuestStatus storage status = dailyQuests[user][day];
        require(!_isQuestCompleted(status.completedQuests, QUEST_NUDGE_FRIEND), "Quest already completed");
        
        bytes32 nudgeKey = keccak256(abi.encodePacked(user, friend, day));
        require(!nudges[nudgeKey], "Already nudged this friend today");
        
        nudges[nudgeKey] = true;

        if (status.completedQuests == 0) status.firstQuestTime = block.timestamp;
        status.completedQuests = _setQuestCompleted(status.completedQuests, QUEST_NUDGE_FRIEND);
        
        pointsEarned = _addPoints(user, POINTS_NUDGE_FRIEND);
        
        emit FriendNudged(user, friend, day);
        emit QuestCompleted(user, QUEST_NUDGE_FRIEND, pointsEarned, day);
    }
    
    /**
     * @notice Quest 6: Commit Message
     * @dev Etch your mood on the ticker
     * @param message Message content (max 280 chars)
     */
    function commitMessage(string calldata message) external nonReentrant whenNotPaused userExists returns (uint256 pointsEarned) {
        require(bytes(message).length > 0 && bytes(message).length <= 280, "Invalid message length");
        
        address user = msg.sender;
        uint256 day = _getCurrentDay();
        DailyQuestStatus storage status = dailyQuests[user][day];
        require(!_isQuestCompleted(status.completedQuests, QUEST_COMMIT_MESSAGE), "Quest already completed");

        uint256 messageId = userMessageCount[user];
        
        userMessages[user][messageId] = Message({
            content: message,
            timestamp: block.timestamp
        });
        userMessageCount[user]++;

        if (status.completedQuests == 0) status.firstQuestTime = block.timestamp;
        status.completedQuests = _setQuestCompleted(status.completedQuests, QUEST_COMMIT_MESSAGE);
        
        pointsEarned = _addPoints(user, POINTS_COMMIT_MESSAGE);
        
        emit MessageCommitted(user, messageId, block.timestamp);
        emit QuestCompleted(user, QUEST_COMMIT_MESSAGE, pointsEarned, day);
    }
    
    /**
     * @notice Quest 9: Predict Pulse
     * @dev Vote on tomorrow's activity level
     * @param predictedLevel Prediction (1-10)
     */
    function predictPulse(uint8 predictedLevel) external nonReentrant whenNotPaused userExists returns (uint256 pointsEarned) {
        require(predictedLevel >= 1 && predictedLevel <= 10, "Invalid prediction level");
        
        address user = msg.sender;
        uint256 day = _getCurrentDay();
        DailyQuestStatus storage status = dailyQuests[user][day];
        require(!_isQuestCompleted(status.completedQuests, QUEST_PREDICT_PULSE), "Quest already completed");
        
        predictions[user][day] = Prediction({
            predictedActivity: predictedLevel,
            predictionTime: block.timestamp
        });

        if (status.completedQuests == 0) status.firstQuestTime = block.timestamp;
        status.completedQuests = _setQuestCompleted(status.completedQuests, QUEST_PREDICT_PULSE);
        
        pointsEarned = _addPoints(user, POINTS_PREDICT_PULSE);
        
        emit PredictionMade(user, predictedLevel, day);
        emit QuestCompleted(user, QUEST_PREDICT_PULSE, pointsEarned, day);
    }
    
    /**
     * @notice Claim Daily Combo Bonus
     * @dev Must complete quests 1, 3, 6 within combo window
     */
    function claimDailyCombo() external nonReentrant whenNotPaused userExists returns (uint256 bonusPoints) {
        address user = msg.sender;
        uint256 day = _getCurrentDay();
        
        require(_checkDailyCombo(user, day), "Combo conditions not met");
        
        DailyQuestStatus storage status = dailyQuests[user][day];
        status.comboActivated = true;
        
        bonusPoints = _addPoints(user, COMBO_BONUS_POINTS);
        emit ComboActivated(user, bonusPoints, day);
    }
    
    // ============================================
    // VIEW FUNCTIONS
    // ============================================
    
    /**
     * @notice Get user profile
     */
    function getUserProfile(address user) external view returns (UserProfile memory) {
        return userProfiles[user];
    }
    
    /**
     * @notice Get daily quest status
     */
    function getDailyQuestStatus(address user, uint256 day) external view returns (DailyQuestStatus memory) {
        return dailyQuests[user][day];
    }
    
    /**
     * @notice Get current day number
     */
    function getCurrentDay() external view returns (uint256) {
        return _getCurrentDay();
    }
    
    /**
     * @notice Get global stats
     */
    function getGlobalStats() external view returns (
        uint256 _totalUsers,
        uint256 _totalCheckins,
        uint256 _totalPointsDistributed
    ) {
        return (totalUsers, totalCheckins, totalPointsDistributed);
    }
    
    /**
     * @notice Check if user has completed a specific quest today
     */
    function hasCompletedQuestToday(address user, uint8 questId) external view returns (bool) {
        uint256 day = _getCurrentDay();
        return _isQuestCompleted(dailyQuests[user][day].completedQuests, questId);
    }
    
    /**
     * @notice Check if combo is available for user
     */
    function isComboAvailable(address user) external view returns (bool) {
        return _checkDailyCombo(user, _getCurrentDay());
    }
    
    /**
     * @notice Get user's message
     */
    function getUserMessage(address user, uint256 messageId) external view returns (Message memory) {
        return userMessages[user][messageId];
    }
    
    /**
     * @notice Get user's message count
     */
    function getUserMessageCount(address user) external view returns (uint256) {
        return userMessageCount[user];
    }
    
    // ============================================
    // ADMIN FUNCTIONS
    // ============================================
    
    /**
     * @notice Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
