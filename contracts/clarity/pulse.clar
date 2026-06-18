;; PULSE - Daily Ritual dApp Smart Contract
;; Clarity 4 Implementation for Stacks Blockchain
;; 
;; Security Considerations:
;; - No loops to prevent DoS attacks
;; - All inputs are validated
;; - Uses stacks-block-height for time tracking (immutable)
;; - Principal-based access control
;; - No unbounded data structures

;; ============================================
;; CONSTANTS
;; ============================================

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-CHECKED-IN (err u101))
(define-constant ERR-USER-NOT-FOUND (err u102))
(define-constant ERR-INVALID-QUEST-ID (err u103))
(define-constant ERR-QUEST-ALREADY-COMPLETED (err u104))
(define-constant ERR-STREAK-BROKEN (err u105))
(define-constant ERR-INVALID-AMOUNT (err u106))
(define-constant ERR-INSUFFICIENT-BALANCE (err u107))
(define-constant ERR-COOLDOWN-ACTIVE (err u108))
(define-constant ERR-MILESTONE-NOT-REACHED (err u109))

;; Contract owner
(define-constant CONTRACT-OWNER tx-sender)

;; Time constants (in blocks, ~10 min per block on Stacks)
;; 1 day ~ 144 blocks
(define-constant BLOCKS-PER-DAY u144)
;; Streak grace period: 2 days
(define-constant STREAK-GRACE-PERIOD u288)
;; Combo window: 30 blocks (~5 hours)
(define-constant COMBO-WINDOW u30)

;; Quest IDs (1-10)
(define-constant QUEST-DAILY-CHECKIN u1)
(define-constant QUEST-RELAY-SIGNAL u2)
(define-constant QUEST-UPDATE-ATMOSPHERE u3)
(define-constant QUEST-NUDGE-FRIEND u4)
(define-constant QUEST-MINT-HOUR-BADGE u5)
(define-constant QUEST-COMMIT-MESSAGE u6)
(define-constant QUEST-STAKE-STREAK u7)
(define-constant QUEST-CLAIM-MILESTONE u8)
(define-constant QUEST-PREDICT-PULSE u9)
(define-constant QUEST-OPEN-CAPSULE u10)

;; Points per quest
(define-constant POINTS-DAILY-CHECKIN u50)
(define-constant POINTS-RELAY-SIGNAL u100)
(define-constant POINTS-UPDATE-ATMOSPHERE u30)
(define-constant POINTS-NUDGE-FRIEND u40)
(define-constant POINTS-MINT-HOUR-BADGE u60)
(define-constant POINTS-COMMIT-MESSAGE u20)
(define-constant POINTS-STAKE-STREAK u200)
(define-constant POINTS-CLAIM-MILESTONE u500)
(define-constant POINTS-PREDICT-PULSE u80)
(define-constant POINTS-OPEN-CAPSULE u1000)

;; ============================================
;; DATA MAPS
;; ============================================

;; User profile data
(define-map user-profiles
    principal
    {
        total-points: uint,
        current-streak: uint,
        longest-streak: uint,
        last-checkin-block: uint,
        total-checkins: uint,
        level: uint,
        staked-amount: uint,
        joined-block: uint
    }
)

;; Daily quest completion tracking (user + day-number -> quest completion bitmap)
(define-map daily-quests
    { user: principal, day: uint }
    {
        completed-quests: uint,  ;; Bitmap of completed quests (bits 1-10)
        first-quest-block: uint, ;; For combo tracking
        combo-activated: bool
    }
)

;; User messages (for commit-message quest)
(define-map user-messages
    { user: principal, message-id: uint }
    {
        content: (string-utf8 280),
        stacks-block-height: uint
    }
)

;; Message counter per user
(define-map user-message-count principal uint)

;; Nudge tracking (who nudged whom today)
(define-map nudges
    { nudger: principal, nudged: principal, day: uint }
    bool
)

;; Predictions for predict-pulse quest
(define-map predictions
    { user: principal, day: uint }
    {
        predicted-activity: uint,
        prediction-block: uint
    }
)

;; ============================================
;; DATA VARIABLES
;; ============================================

;; Global statistics
(define-data-var total-users uint u0)
(define-data-var total-checkins uint u0)
(define-data-var total-points-distributed uint u0)

;; Contract pause state
(define-data-var contract-paused bool false)

;; ============================================
;; PRIVATE FUNCTIONS
;; ============================================

;; Get current day number from genesis (based on block height)
(define-private (get-current-day)
    (/ stacks-block-height BLOCKS-PER-DAY)
)

;; Check if a specific quest is completed in the bitmap
(define-private (is-quest-completed (bitmap uint) (quest-id uint))
    (> (bit-and bitmap (pow u2 quest-id)) u0)
)

;; Set a quest as completed in bitmap
(define-private (set-quest-completed (bitmap uint) (quest-id uint))
    (bit-or bitmap (pow u2 quest-id))
)

;; Calculate streak multiplier (1x to 3x based on streak length)
(define-private (get-streak-multiplier (streak uint))
    (if (<= streak u7)
        u1
        (if (<= streak u30)
            u2
            u3
        )
    )
)

;; Check if streak is still valid
(define-private (is-streak-valid (last-checkin uint))
    (if (is-eq last-checkin u0)
        true
        (<= (- stacks-block-height last-checkin) STREAK-GRACE-PERIOD)
    )
)

;; Initialize user if not exists
(define-private (ensure-user-exists (user principal))
    (match (map-get? user-profiles user)
        existing-profile true
        (begin
            (map-set user-profiles user {
                total-points: u0,
                current-streak: u0,
                longest-streak: u0,
                last-checkin-block: u0,
                total-checkins: u0,
                level: u1,
                staked-amount: u0,
                joined-block: stacks-block-height
            })
            (var-set total-users (+ (var-get total-users) u1))
            true
        )
    )
)

;; Add points to user with streak multiplier
(define-private (add-points (user principal) (base-points uint))
    (let (
        (profile (unwrap-panic (map-get? user-profiles user)))
        (multiplier (get-streak-multiplier (get current-streak profile)))
        (points-to-add (* base-points multiplier))
        (new-total (+ (get total-points profile) points-to-add))
    )
        (map-set user-profiles user (merge profile { 
            total-points: new-total,
            level: (+ u1 (/ new-total u1000))
        }))
        (var-set total-points-distributed (+ (var-get total-points-distributed) points-to-add))
        points-to-add
    )
)

;; Update streak on check-in
(define-private (update-streak (user principal))
    (let (
        (profile (unwrap-panic (map-get? user-profiles user)))
        (last-checkin (get last-checkin-block profile))
        (current-streak (get current-streak profile))
        (is-consecutive (and 
            (> last-checkin u0)
            (<= (- stacks-block-height last-checkin) BLOCKS-PER-DAY)
            (> (- stacks-block-height last-checkin) u0)
        ))
        (new-streak (if is-consecutive
            (+ current-streak u1)
            u1
        ))
        (new-longest (if (> new-streak (get longest-streak profile))
            new-streak
            (get longest-streak profile)
        ))
    )
        (map-set user-profiles user (merge profile {
            current-streak: new-streak,
            longest-streak: new-longest,
            last-checkin-block: stacks-block-height,
            total-checkins: (+ (get total-checkins profile) u1)
        }))
        new-streak
    )
)

;; Check if daily combo is achieved (quests 1, 3, 6 within combo window)
(define-private (check-daily-combo (user principal) (day uint))
    (let (
        (daily-data (unwrap-panic (map-get? daily-quests { user: user, day: day })))
        (completed (get completed-quests daily-data))
        (first-block (get first-quest-block daily-data))
    )
        ;; Check if quests 1, 3, and 6 are completed
        (and
            (is-quest-completed completed QUEST-DAILY-CHECKIN)
            (is-quest-completed completed QUEST-UPDATE-ATMOSPHERE)
            (is-quest-completed completed QUEST-COMMIT-MESSAGE)
            ;; And within combo window
            (<= (- stacks-block-height first-block) COMBO-WINDOW)
            ;; And not already claimed
            (not (get combo-activated daily-data))
        )
    )
)

;; ============================================
;; PUBLIC FUNCTIONS - QUESTS
;; ============================================

;; Quest 1: Daily Check-In
(define-public (daily-checkin)
    (let (
        (user tx-sender)
        (day (get-current-day))
    )
        ;; Ensure contract not paused
        (asserts! (not (var-get contract-paused)) ERR-NOT-AUTHORIZED)
        
        ;; Initialize user if needed
        (ensure-user-exists user)
        
        ;; Check if already checked in today
        (let (
            (daily-data (default-to 
                { completed-quests: u0, first-quest-block: stacks-block-height, combo-activated: false }
                (map-get? daily-quests { user: user, day: day })
            ))
        )
            (asserts! (not (is-quest-completed (get completed-quests daily-data) QUEST-DAILY-CHECKIN)) 
                ERR-ALREADY-CHECKED-IN)
            
            ;; Update daily quests
            (map-set daily-quests { user: user, day: day } {
                completed-quests: (set-quest-completed (get completed-quests daily-data) QUEST-DAILY-CHECKIN),
                first-quest-block: (if (is-eq (get completed-quests daily-data) u0) 
                    stacks-block-height 
                    (get first-quest-block daily-data)
                ),
                combo-activated: (get combo-activated daily-data)
            })
            
            ;; Update streak
            (update-streak user)
            
            ;; Add points
            (let ((points-earned (add-points user POINTS-DAILY-CHECKIN)))
                ;; Update global stats
                (var-set total-checkins (+ (var-get total-checkins) u1))

                ;; Emit event (print)
                (print {event: "daily-checkin", user: user, day: day, points: points-earned})

                (ok {
                    points-earned: points-earned,
                    day: day,
                    quest-id: QUEST-DAILY-CHECKIN
                })
            )
        )
    )
)

;; Quest 2: Relay Signal (pass the torch to another timezone)
(define-public (relay-signal)
    (let (
        (user tx-sender)
        (day (get-current-day))
    )
        (asserts! (not (var-get contract-paused)) ERR-NOT-AUTHORIZED)
        (ensure-user-exists user)
        
        (let (
            (daily-data (default-to 
                { completed-quests: u0, first-quest-block: stacks-block-height, combo-activated: false }
                (map-get? daily-quests { user: user, day: day })
            ))
        )
            (asserts! (not (is-quest-completed (get completed-quests daily-data) QUEST-RELAY-SIGNAL)) 
                ERR-QUEST-ALREADY-COMPLETED)
            
            (map-set daily-quests { user: user, day: day } (merge daily-data {
                completed-quests: (set-quest-completed (get completed-quests daily-data) QUEST-RELAY-SIGNAL)
            }))
            
            (let ((points-earned (add-points user POINTS-RELAY-SIGNAL)))
                (ok {
                    points-earned: points-earned,
                    day: day,
                    quest-id: QUEST-RELAY-SIGNAL
                })
            )
        )
    )
)

;; Quest 3: Update Atmosphere
(define-public (update-atmosphere (weather-code uint))
    (let (
        (user tx-sender)
        (day (get-current-day))
    )
        (asserts! (not (var-get contract-paused)) ERR-NOT-AUTHORIZED)
        ;; Validate weather code (0-10 range)
        (asserts! (<= weather-code u10) ERR-INVALID-QUEST-ID)
        (ensure-user-exists user)
        
        (let (
            (daily-data (default-to 
                { completed-quests: u0, first-quest-block: stacks-block-height, combo-activated: false }
                (map-get? daily-quests { user: user, day: day })
            ))
        )
            (asserts! (not (is-quest-completed (get completed-quests daily-data) QUEST-UPDATE-ATMOSPHERE)) 
                ERR-QUEST-ALREADY-COMPLETED)
            
            (map-set daily-quests { user: user, day: day } (merge daily-data {
                completed-quests: (set-quest-completed (get completed-quests daily-data) QUEST-UPDATE-ATMOSPHERE)
            }))
            
            (let ((points-earned (add-points user POINTS-UPDATE-ATMOSPHERE)))
                (ok {
                    points-earned: points-earned,
                    day: day,
                    quest-id: QUEST-UPDATE-ATMOSPHERE,
                    weather-code: weather-code
                })
            )
        )
    )
)

;; Quest 4: Nudge Friend
(define-public (nudge-friend (friend principal))
    (let (
        (user tx-sender)
        (day (get-current-day))
    )
        (asserts! (not (var-get contract-paused)) ERR-NOT-AUTHORIZED)
        ;; Can't nudge yourself
        (asserts! (not (is-eq user friend)) ERR-NOT-AUTHORIZED)
        ;; Friend must exist
        (asserts! (is-some (map-get? user-profiles friend)) ERR-USER-NOT-FOUND)
        ;; Haven't already nudged this friend today
        (asserts! (is-none (map-get? nudges { nudger: user, nudged: friend, day: day })) ERR-QUEST-ALREADY-COMPLETED)
        
        (ensure-user-exists user)
        
        ;; Record the nudge
        (map-set nudges { nudger: user, nudged: friend, day: day } true)
        
        (let (
            (daily-data (default-to 
                { completed-quests: u0, first-quest-block: stacks-block-height, combo-activated: false }
                (map-get? daily-quests { user: user, day: day })
            ))
        )
            (asserts! (not (is-quest-completed (get completed-quests daily-data) QUEST-NUDGE-FRIEND))
                ERR-QUEST-ALREADY-COMPLETED)

            (map-set daily-quests { user: user, day: day } (merge daily-data {
                completed-quests: (set-quest-completed (get completed-quests daily-data) QUEST-NUDGE-FRIEND)
            }))
            
            (let ((points-earned (add-points user POINTS-NUDGE-FRIEND)))
                (ok {
                    points-earned: points-earned,
                    day: day,
                    quest-id: QUEST-NUDGE-FRIEND,
                    friend: friend
                })
            )
        )
    )
)

;; Quest 6: Commit Message
(define-public (commit-message (message (string-utf8 280)))
    (let (
        (user tx-sender)
        (day (get-current-day))
        (message-count (default-to u0 (map-get? user-message-count user)))
    )
        (asserts! (not (var-get contract-paused)) ERR-NOT-AUTHORIZED)
        (ensure-user-exists user)
        
        ;; Store the message
        (map-set user-messages { user: user, message-id: message-count } {
            content: message,
            stacks-block-height: stacks-block-height
        })
        (map-set user-message-count user (+ message-count u1))
        
        (let (
            (daily-data (default-to 
                { completed-quests: u0, first-quest-block: stacks-block-height, combo-activated: false }
                (map-get? daily-quests { user: user, day: day })
            ))
        )
            (asserts! (not (is-quest-completed (get completed-quests daily-data) QUEST-COMMIT-MESSAGE))
                ERR-QUEST-ALREADY-COMPLETED)

            (map-set daily-quests { user: user, day: day } (merge daily-data {
                completed-quests: (set-quest-completed (get completed-quests daily-data) QUEST-COMMIT-MESSAGE)
            }))
            
            (let ((points-earned (add-points user POINTS-COMMIT-MESSAGE)))
                (ok {
                    points-earned: points-earned,
                    day: day,
                    quest-id: QUEST-COMMIT-MESSAGE,
                    message-id: message-count
                })
            )
        )
    )
)

;; Quest 9: Predict Pulse (predict tomorrow's activity level)
(define-public (predict-pulse (predicted-level uint))
    (let (
        (user tx-sender)
        (day (get-current-day))
    )
        (asserts! (not (var-get contract-paused)) ERR-NOT-AUTHORIZED)
        ;; Validate prediction (1-10 scale)
        (asserts! (and (>= predicted-level u1) (<= predicted-level u10)) ERR-INVALID-AMOUNT)
        (ensure-user-exists user)
        
        ;; Store prediction
        (map-set predictions { user: user, day: day } {
            predicted-activity: predicted-level,
            prediction-block: stacks-block-height
        })
        
        (let (
            (daily-data (default-to 
                { completed-quests: u0, first-quest-block: stacks-block-height, combo-activated: false }
                (map-get? daily-quests { user: user, day: day })
            ))
        )
            (asserts! (not (is-quest-completed (get completed-quests daily-data) QUEST-PREDICT-PULSE))
                ERR-QUEST-ALREADY-COMPLETED)

            (map-set daily-quests { user: user, day: day } (merge daily-data {
                completed-quests: (set-quest-completed (get completed-quests daily-data) QUEST-PREDICT-PULSE)
            }))
            
            (let ((points-earned (add-points user POINTS-PREDICT-PULSE)))
                (ok {
                    points-earned: points-earned,
                    day: day,
                    quest-id: QUEST-PREDICT-PULSE,
                    prediction: predicted-level
                })
            )
        )
    )
)

;; Claim Daily Combo Bonus
(define-public (claim-daily-combo)
    (let (
        (user tx-sender)
        (day (get-current-day))
    )
        (asserts! (not (var-get contract-paused)) ERR-NOT-AUTHORIZED)
        (asserts! (is-some (map-get? user-profiles user)) ERR-USER-NOT-FOUND)
        
        (let ((daily-data (unwrap! (map-get? daily-quests { user: user, day: day }) ERR-USER-NOT-FOUND)))
            ;; Check combo conditions
            (asserts! (check-daily-combo user day) ERR-INVALID-QUEST-ID)
            
            ;; Mark combo as claimed
            (map-set daily-quests { user: user, day: day } (merge daily-data {
                combo-activated: true
            }))
            
            ;; Award combo bonus (2x standard points)
            (let ((bonus-points (add-points user u200)))
                (ok {
                    bonus-points: bonus-points,
                    day: day,
                    combo-type: "daily-triple"
                })
            )
        )
    )
)

;; ============================================
;; READ-ONLY FUNCTIONS
;; ============================================

;; Get user profile
(define-read-only (get-user-profile (user principal))
    (map-get? user-profiles user)
)

;; Get user's daily quest status
(define-read-only (get-daily-quest-status (user principal) (day uint))
    (map-get? daily-quests { user: user, day: day })
)

;; Get current day
(define-read-only (get-day)
    (get-current-day)
)

;; Get global stats
(define-read-only (get-global-stats)
    {
        total-users: (var-get total-users),
        total-checkins: (var-get total-checkins),
        total-points-distributed: (var-get total-points-distributed)
    }
)

;; Check if user has completed a specific quest today
(define-read-only (has-completed-quest-today (user principal) (quest-id uint))
    (let (
        (day (get-current-day))
        (daily-data (map-get? daily-quests { user: user, day: day }))
    )
        (match daily-data
            data (is-quest-completed (get completed-quests data) quest-id)
            false
        )
    )
)

;; Get user's message
(define-read-only (get-user-message (user principal) (message-id uint))
    (map-get? user-messages { user: user, message-id: message-id })
)

;; Check if combo is available
(define-read-only (is-combo-available (user principal))
    (let ((day (get-current-day)))
        (match (map-get? daily-quests { user: user, day: day })
            daily-data (check-daily-combo user day)
            false
        )
    )
)

;; ============================================
;; ADMIN FUNCTIONS
;; ============================================

;; Pause/unpause contract
(define-public (set-contract-paused (paused bool))
    (begin
        (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
        (var-set contract-paused paused)
        (ok true)
    )
)

;; Check if contract is paused
(define-read-only (is-paused)
    (var-get contract-paused)
)
