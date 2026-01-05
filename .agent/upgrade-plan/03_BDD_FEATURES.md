# BDD Feature Specifications for Health Journal

**Document Version:** 1.0  
**Last Updated:** 2026-01-04  
**Status:** Planning Phase

---

## 1. Overview

This document defines Health Journal features using Behavior-Driven Development (BDD) principles. Each feature is specified using Gherkin syntax (Given/When/Then) before any implementation begins.

### BDD Workflow

```
User Story → Acceptance Criteria → Failing Test → Implementation → Passing Test
```

---

## 2. Feature Categories

| Category | Features | Priority |
|----------|----------|----------|
| Authentication | Login, Demo Mode, Protected Routes | 🔴 Critical |
| Daily Logging | Daily Log CRUD, Rating | 🟠 High |
| Photo Management | Upload, Gallery, AI Analysis | 🟠 High |
| Nutrition | Food Logging, Macro Tracking | 🟠 High |
| Workouts | Workout Logging, History | 🟡 Medium |
| Protocols | Protocol Management, Stop Signals | 🟡 Medium |
| Dreams | Dream Journal, AI Analysis | 🟡 Medium |
| AI Assistant | Chat, Log Draft from NL | 🟠 High |

---

## 3. Feature Specifications

### Feature F01: Authentication & Demo Mode

**User Story:**

> As a **recruiter**, I want to **explore the app in demo mode** so that I can **see the functionality without accessing real health data**.

**Acceptance Criteria:**

```gherkin
Feature: Authentication & Demo Mode
  As a visitor
  I want to access the app in demo mode
  So that I can explore functionality without a real account

  Background:
    Given the Health Journal application is deployed
    And demo mode is enabled

  Scenario: View splash page
    Given I am not logged in
    When I visit the root URL
    Then I should see a splash page with "Health Journal" branding
    And I should see a "Try Demo" button
    And I should see a "Sign In" button

  Scenario: Enter demo mode
    Given I am on the splash page
    When I click the "Try Demo" button
    Then I should be logged in as a demo user
    And I should be redirected to the dashboard
    And I should see pre-populated synthetic health data
    And I should see a banner indicating "Demo Mode - Read Only"

  Scenario: Demo mode restrictions
    Given I am logged in as a demo user
    When I try to create a new workout
    Then the form should be disabled or show a warning
    When I try to submit the form
    Then I should see an error "Demo mode is read-only"
    And no data should be saved to the database

  Scenario: Demo user can view but not modify
    Given I am logged in as a demo user
    When I navigate to the photo gallery
    Then I should see sample photos
    But the "Upload" button should be disabled
    And the "Delete" buttons should be hidden

  Scenario: Real user authentication
    Given I am on the splash page
    When I click "Sign In"
    And I authenticate with my credentials
    Then I should be logged in with full access
    And I should see my own health data
    And I should have full CRUD permissions

  Scenario: Protected route access
    Given I am not logged in
    When I try to access "/dashboard"
    Then I should be redirected to the sign-in page

  Scenario: Session persistence
    Given I am logged in as a real user
    When I close and reopen the browser
    Then I should still be logged in
    And my session should be valid for 30 days
```

**Test File Mapping:**

| Scenario | Test File |
|----------|-----------|
| Unit: Auth middleware | `__tests__/unit/middleware.test.ts` |
| Unit: Demo data generation | `__tests__/unit/demo-data.test.ts` |
| Integration: Auth flow | `__tests__/integration/auth-flow.test.ts` |
| Security: Route protection | `__tests__/security/auth-protection.test.ts` |

---

### Feature F02: Daily Log Management

**User Story:**

> As a **health-conscious user**, I want to **manage daily health logs** so that I can **track my wellness over time**.

**Acceptance Criteria:**

```gherkin
Feature: Daily Log Management
  As a health-conscious user
  I want to manage daily health logs
  So that I can track my wellness over time

  Background:
    Given I am logged in as a real user
    And I am on the dashboard

  Scenario: View today's log
    Given it is a new day with no log
    When the dashboard loads
    Then I should see a "Start Today's Log" card
    When I click "Start Today's Log"
    Then a new DailyLog record should be created for today
    And I should be redirected to the log details page

  Scenario: View existing log
    Given I have a log for today
    When the dashboard loads
    Then I should see a summary of today's activities
    And I should see quick-add buttons for common entries

  Scenario: Add overall rating
    Given I am viewing today's log
    When I set the daily rating to 4 stars
    Then the rating should be saved
    And the dashboard should show "4/5" rating

  Scenario: View log history
    Given I have logs for the past 30 days
    When I navigate to the log history
    Then I should see a calendar view
    And days with logs should be highlighted
    When I click on a past date
    Then I should see that day's log details

  Scenario: Edge case - No data
    Given I have no logs
    When I view the dashboard
    Then I should see an empty state
    And I should see a prompt to start logging
    And I should NOT see any errors
```

**Test File Mapping:**

| Scenario | Test File |
|----------|-----------|
| Unit: Log creation | `__tests__/unit/lib/daily-log.test.ts` |
| API: CRUD operations | `__tests__/api/log.test.ts` |
| Integration: Log flow | `__tests__/integration/daily-log-flow.test.ts` |

---

### Feature F03: Photo Upload & Analysis

**User Story:**

> As a **user tracking body composition**, I want to **upload progress photos and get AI analysis** so that I can **visualize changes and identify asymmetries**.

**Acceptance Criteria:**

```gherkin
Feature: Photo Upload & Analysis
  As a user tracking body composition
  I want to upload progress photos and get AI analysis
  So that I can visualize changes and identify asymmetries

  Background:
    Given I am logged in as a real user
    And I am on the photos page

  Scenario: Upload a progress photo
    Given I have selected today's log
    When I click "Upload Photo"
    And I select a valid JPEG image under 10MB
    And I select view type "FRONT"
    And I add an optional caption
    And I click "Upload"
    Then the photo should be uploaded to Vercel Blob
    And a Photo record should be created linked to today's log
    And the photo should appear in the gallery

  Scenario: Photo validation - Invalid type
    Given I am on the upload form
    When I select a PDF file
    Then I should see an error "Invalid file type. Allowed: JPEG, PNG, WebP"
    And the upload button should be disabled

  Scenario: Photo validation - Too large
    Given I am on the upload form
    When I select a 15MB image
    Then I should see an error "File too large. Max size is 10MB"
    And the upload button should be disabled

  Scenario: Request AI analysis
    Given I have uploaded a front-view photo
    When I click "Analyze with AI"
    Then I should see a loading indicator
    When the analysis completes
    Then I should see AI-generated insights
    And the analysis should include symmetry observations
    And the analysis should be saved to the Photo record

  Scenario: View photo gallery
    Given I have uploaded photos over multiple days
    When I view the photo gallery
    Then I should see photos grouped by view type
    And I should be able to compare photos side-by-side
    And I should see the date and caption for each photo

  Scenario: Delete a photo
    Given I have a photo in the gallery
    When I click the delete button
    And I confirm the deletion
    Then the photo should be removed from Vercel Blob
    And the Photo record should be deleted
    And the photo should disappear from the gallery

  Scenario: Security - Demo mode upload blocked
    Given I am in demo mode
    When I try to upload a photo
    Then I should see "Demo mode cannot upload files"
    And no file should be uploaded

  Scenario: Security - File type verification
    Given a malicious user renames a .exe to .jpg
    When they try to upload the file
    Then the server should verify magic bytes
    And reject the file with "File content does not match declared type"
```

**Test File Mapping:**

| Scenario | Test File |
|----------|-----------|
| Unit: File validation | `__tests__/unit/lib/file-validation.test.ts` |
| API: Upload endpoint | `__tests__/api/upload.test.ts` |
| API: Photos CRUD | `__tests__/api/photos.test.ts` |
| Integration: Upload flow | `__tests__/integration/photo-upload-flow.test.ts` |
| Security: File security | `__tests__/security/file-upload.test.ts` |

---

### Feature F04: Nutrition Tracking

**User Story:**

> As a **user tracking macros**, I want to **log my food intake** so that I can **monitor my nutrition**.

**Acceptance Criteria:**

```gherkin
Feature: Nutrition Tracking
  As a user tracking macros
  I want to log my food intake
  So that I can monitor my nutrition

  Background:
    Given I am logged in as a real user
    And I have a daily log for today

  Scenario: Log nutrition manually
    Given I am on the nutrition page
    When I enter calories: 2000, protein: 150g, carbs: 200g, fat: 70g
    And I click "Save"
    Then the nutrition data should be saved
    And I should see a summary showing my macros
    And I should see a pie chart of macro distribution

  Scenario: Add individual food item
    Given I am on the nutrition page
    When I click "Add Food"
    And I search for "chicken breast"
    Then I should see search results from USDA database
    When I select "Chicken, breast, boneless, skinless"
    And I enter serving size: 6oz
    And I click "Add"
    Then the food item should be added to today's log
    And the macro totals should update

  Scenario: AI-assisted food logging
    Given I am on the nutrition page
    When I type "12oz ribeye steak cooked medium"
    And I click "Log with AI"
    Then the AI should parse the food description
    And I should see a preview with estimated macros
    When I click "Confirm"
    Then the food should be logged

  Scenario: View nutrition history
    Given I have logged nutrition for the past week
    When I view the nutrition history
    Then I should see a trend chart of my calories
    And I should see average macros per day
    And I should see if I'm meeting protein goals

  Scenario: Edge case - Missing nutrition data
    Given today has no nutrition logged
    When I view the nutrition page
    Then I should see an empty state with suggestions
    And I should see quick-add buttons for common meals
```

**Test File Mapping:**

| Scenario | Test File |
|----------|-----------|
| Unit: Macro calculations | `__tests__/unit/lib/nutrition.test.ts` |
| API: Nutrition CRUD | `__tests__/api/nutrition.test.ts` |
| Integration: Food logging | `__tests__/integration/nutrition-tracking.test.ts` |

---

### Feature F05: Workout Logging

**User Story:**

> As a **user tracking fitness**, I want to **log my workouts** so that I can **monitor training volume and progress**.

**Acceptance Criteria:**

```gherkin
Feature: Workout Logging
  As a user tracking fitness
  I want to log my workouts
  So that I can monitor training volume and progress

  Background:
    Given I am logged in as a real user
    And I have a daily log for today

  Scenario: Log a workout
    Given I am on the workouts page
    When I click "Add Workout"
    And I fill in:
      | Field      | Value              |
      | Name       | Upper Body Push    |
      | Type       | Strength           |
      | Duration   | 45                 |
      | Intensity  | High               |
      | Focus Area | Chest, Shoulders   |
      | Instructor | Brian Carroll      |
      | Platform   | YouTube            |
    And I click "Save"
    Then the workout should be saved to today's log
    And I should see the workout in today's summary

  Scenario: View workout history
    Given I have logged 20 workouts over 2 weeks
    When I view the workout history
    Then I should see a list of recent workouts
    And I should see total training volume (hours)
    And I should see workout type distribution

  Scenario: Quick log preset workout
    Given I have common workout presets saved
    When I click "Quick Log"
    And I select "Morning Mobility"
    Then the workout should be logged with preset values
    And I should only need to confirm the duration

  Scenario: Validation - Duration limits
    Given I am adding a workout
    When I enter duration as 700 minutes
    Then I should see an error "Maximum duration is 600 minutes"
    And the form should not submit
```

**Test File Mapping:**

| Scenario | Test File |
|----------|-----------|
| Unit: Workout validation | `__tests__/unit/lib/workout.test.ts` |
| API: Workout CRUD | `__tests__/api/workout.test.ts` |
| Integration: Workout flow | `__tests__/integration/workout-flow.test.ts` |

---

### Feature F06: Protocol Management

**User Story:**

> As a **user following health protocols**, I want to **track my protocols and side effects** so that I can **monitor adherence and identify issues**.

**Acceptance Criteria:**

```gherkin
Feature: Protocol Management
  As a user following health protocols
  I want to track my protocols and side effects
  So that I can monitor adherence and identify issues

  Background:
    Given I am logged in as a real user

  Scenario: Create a new protocol
    Given I am on the protocols page
    When I click "Add Protocol"
    And I fill in:
      | Field     | Value                     |
      | Name      | Testosterone Optimization |
      | Substance | Clomiphene                |
      | Dosage    | 25mg                      |
      | Frequency | Every 3 Days              |
    And I click "Save"
    Then the protocol should be created with ACTIVE status
    And I should see it in my active protocols list

  Scenario: Log protocol adherence
    Given I have an active protocol
    When I click "Log Dose"
    And I confirm I took today's dose
    Then a ProtocolLog entry should be created
    And the log should be linked to today's DailyLog

  Scenario: Track side effects (Stop Signals)
    Given I am logging a protocol dose
    When I indicate side effects:
      | Effect       | Severity (1-5) |
      | Headache     | 3              |
      | Anxiety      | 2              |
      | Sleep Quality| 4              |
    And I click "Save"
    Then the side effects should be recorded
    And I should see a trend chart of side effects over time

  Scenario: Stop signal alert
    Given I have logged high anxiety (5/5) for 3 consecutive doses
    When I view the protocol dashboard
    Then I should see a warning banner
    And the warning should suggest pausing the protocol
    And I should see a link to relevant resources

  Scenario: Pause a protocol
    Given I have an active protocol
    When I click "Pause Protocol"
    And I provide a reason
    Then the protocol status should change to PAUSED
    And the end date should be recorded
    And the protocol should move to the inactive list
```

**Test File Mapping:**

| Scenario | Test File |
|----------|-----------|
| Unit: Protocol validation | `__tests__/unit/lib/protocol.test.ts` |
| API: Protocol CRUD | `__tests__/api/protocols.test.ts` |
| Integration: Protocol flow | `__tests__/integration/protocol-flow.test.ts` |

---

### Feature F07: Dream Journal

**User Story:**

> As a **user tracking mental wellness**, I want to **log and analyze my dreams** so that I can **identify patterns and themes**.

**Acceptance Criteria:**

```gherkin
Feature: Dream Journal
  As a user tracking mental wellness
  I want to log and analyze my dreams
  So that I can identify patterns and themes

  Background:
    Given I am logged in as a real user
    And I have a daily log for today

  Scenario: Log a dream
    Given I am on the dreams page
    When I click "Add Dream"
    And I enter the dream content
    And I select mood: "Anxious"
    And I add tags: "flying, water"
    And I click "Save"
    Then the dream should be saved to today's log
    And I should see it in my dream list

  Scenario: AI dream analysis
    Given I have logged a dream
    When I click "Analyze with AI"
    Then the AI should analyze the dream content
    And I should see a summary of themes
    And I should see potential interpretations
    And the analysis should be saved

  Scenario: View dream patterns
    Given I have logged 30+ dreams over 3 months
    When I view the dream analytics page
    Then I should see common themes/tags
    And I should see mood distribution
    And I should see a timeline of dreams
```

**Test File Mapping:**

| Scenario | Test File |
|----------|-----------|
| Unit: Dream parsing | `__tests__/unit/lib/dream.test.ts` |
| API: Dream CRUD | `__tests__/api/dreams.test.ts` |
| Integration: Dream flow | `__tests__/integration/dream-flow.test.ts` |

---

### Feature F08: AI Chat Assistant

**User Story:**

> As a **user**, I want to **interact with an AI assistant** so that I can **quickly log data and get insights using natural language**.

**Acceptance Criteria:**

```gherkin
Feature: AI Chat Assistant
  As a user
  I want to interact with an AI assistant
  So that I can quickly log data and get insights

  Background:
    Given I am logged in as a real user
    And I have an active chat session

  Scenario: Log data via chat (The Hybrid AI Assistant)
    Given I am in the chat interface
    When I type "I just ate 12oz steak with a side salad"
    Then the AI should process my input
    And I should see a preview:
      """
      I understood: 
      - 12oz Ribeye Steak: ~800 cal, 60g protein
      - Side Salad: ~50 cal, 2g protein
      
      Add to today's nutrition log?
      """
    When I click "Confirm"
    Then the food items should be added to my nutrition log
    And I should see a confirmation message

  Scenario: Get insights via chat
    Given I have 30 days of health data
    When I ask "How has my sleep affected my workout performance?"
    Then the AI should analyze my data
    And I should see an insight like:
      """
      Looking at your data, I found:
      - Days with 7+ hours of sleep: Average workout rating 4.2
      - Days with <6 hours of sleep: Average workout rating 2.8
      
      Recommendation: Aim for 7+ hours for optimal performance.
      """

  Scenario: Rate limiting on AI chat
    Given I have sent 5 messages in the last minute
    When I try to send another message
    Then I should see "Please wait before sending more messages"
    And the message should not be sent

  Scenario: Error handling
    Given the OpenAI API is temporarily unavailable
    When I send a message
    Then I should see a friendly error message
    And my message should be preserved for retry
    And I should see a "Try Again" button
```

**Test File Mapping:**

| Scenario | Test File |
|----------|-----------|
| Unit: Message parsing | `__tests__/unit/lib/chat.test.ts` |
| API: Chat endpoint | `__tests__/api/chat.test.ts` |
| Integration: Chat flow | `__tests__/integration/chat-flow.test.ts` |
| Security: Rate limiting | `__tests__/security/rate-limiting.test.ts` |

---

## 4. Priority Matrix

| Priority | Feature | Business Value | Complexity |
|----------|---------|----------------|------------|
| P0 | F01: Auth & Demo Mode | Critical | Medium |
| P0 | F08: AI Assistant | High (Demo Impact) | Medium |
| P1 | F02: Daily Log | High | Low |
| P1 | F03: Photo Upload | High (Demo Impact) | High |
| P1 | F04: Nutrition | High | Medium |
| P2 | F05: Workouts | Medium | Low |
| P2 | F06: Protocols | Medium | Medium |
| P3 | F07: Dreams | Low | Low |

---

## 5. Test File Creation Checklist

### Security-Critical (Create First)

- [ ] `lib/validation.ts` (NEW)
- [ ] `lib/validation.test.ts` (NEW)
- [ ] `lib/sanitize.ts` (NEW)
- [ ] `lib/sanitize.test.ts` (NEW)
- [ ] `__tests__/security/xss-prevention.test.ts` (NEW)
- [ ] `__tests__/security/auth-protection.test.ts` (NEW)
- [ ] `__tests__/security/file-upload.test.ts` (NEW)

### Core Functionality

- [ ] `__tests__/api/log.test.ts` (NEW)
- [ ] `__tests__/api/photos.test.ts` (NEW)
- [ ] `__tests__/api/upload.test.ts` (NEW)
- [ ] `__tests__/api/chat.test.ts` (NEW)
- [ ] `__tests__/api/protocols.test.ts` (NEW)

### Integration Tests

- [ ] `__tests__/integration/auth-flow.test.ts` (NEW)
- [ ] `__tests__/integration/daily-log-flow.test.ts` (NEW)
- [ ] `__tests__/integration/photo-upload-flow.test.ts` (NEW)
- [ ] `__tests__/integration/nutrition-tracking.test.ts` (NEW)
- [ ] `__tests__/integration/demo-mode.test.ts` (NEW)

---

## 6. Manual Test Checklists

### F01: Authentication Manual Tests

- [ ] Visit `/` as unauthenticated user → See splash page
- [ ] Click "Try Demo" → See dashboard with sample data
- [ ] Verify "Demo Mode" banner appears
- [ ] Try to add a workout in demo mode → See error message
- [ ] Sign out and sign in with real credentials → See own data
- [ ] Close browser and reopen → Still logged in

### F03: Photo Upload Manual Tests

- [ ] Navigate to Photos page
- [ ] Click Upload → File picker appears
- [ ] Select a valid JPEG → Preview appears
- [ ] Click Upload → Progress indicator shows
- [ ] After upload → Photo appears in gallery
- [ ] Click "Analyze" → AI analysis shows
- [ ] Click Delete → Photo removed from gallery
- [ ] Verify in Prisma Studio → Record deleted

### F08: AI Chat Manual Tests

- [ ] Open chat interface
- [ ] Type "I ate 12oz steak" → See parsed preview
- [ ] Click Confirm → Data added to nutrition
- [ ] Ask "How's my sleep this week?" → See AI insight
- [ ] Send 6 messages quickly → See rate limit message

---

## Next Steps

1. → Proceed to `04_DESIGN_IMPLEMENTATION.md` for UI/UX improvements
2. → Begin with security-critical test files
3. → Implement F01 (Auth & Demo Mode) first
4. → Create test coverage for all API routes
