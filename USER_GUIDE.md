# VenBid - User Guide 📖

Ye guide **Customers**, **Vendors**, aur **Admins** ke liye hai. Isme step-by-step instructions hain ke platform kaise use karein.

---

## 📱 Table of Contents

1. [Getting Started](#getting-started)
2. [Customer Workflow](#customer-workflow)
3. [Vendor Workflow](#vendor-workflow)
4. [Admin Workflow](#admin-workflow)
5. [Common Features](#common-features)

---

## 🚀 Getting Started

### Step 1: Account Creation

#### Sign Up Process:

1. Home page par jayein (`/`)
2. Top right corner par **"Sign Up"** button click karein
3. Form fill karein:
   - **Email**: Apna email address
   - **Password**: Strong password (minimum 6 characters)
   - **First Name**: Apna naam
   - **Last Name**: Apna surname
   - **Role**: Choose karein:
     - **Customer**: Agar aap job post karna chahte hain
     - **Vendor**: Agar aap jobs ke liye bid karna chahte hain
   - **Phone** (optional): Contact number
   - **Location/City** (optional): Apna shehar
4. **"Create Account"** button click karein
5. Account create ho jayega aur aap automatically login ho jayenge

#### Login Process:

1. Home page par jayein
2. Top right par **"Login"** button click karein
3. Email aur Password enter karein
4. **"Login"** button click karein
5. Aap automatically apne dashboard par redirect ho jayenge

---

## 👤 Customer Workflow

### Customer Dashboard Overview

Login ke baad aap `/customer` par redirect honge. Dashboard mein ye information dikhegi:

- **Posted Jobs**: Kitne jobs aapne post kiye
- **Active Jobs**: Currently kitne jobs chal rahe hain
- **Completed Jobs**: Kitne jobs complete ho chuke hain
- **Total Spent**: Aapne kitna paisa spend kiya hai
- **Recent Jobs**: Latest 5 jobs ki list

---

### Workflow 1: Job Post Karna

#### Step-by-Step Guide:

**Step 1: Navigate to Post Job**

1. Customer Dashboard se
2. Left sidebar mein **"Post New Job"** ya **"Jobs → Post New"** click karein
3. Ya direct URL: `/customer/jobs/post`

**Step 2: Fill Job Details Form**

**Basic Information:**

- **Job Title**: Clear aur descriptive title (e.g., "Need Plumber for Kitchen Sink")
- **Category**: Service category select karein (e.g., Plumbing, Electrical, etc.)
- **Subcategory**: Specific service type (optional)
- **Description**: Detailed job description - kya kaam chahiye

**Budget & Timeline:**

- **Budget Type**:
  - **FIXED**: Fixed amount
  - **HOURLY**: Per hour rate
  - **NEGOTIABLE**: Price negotiable
- **Budget Amount**: Expected budget (agar negotiable ho to approximate)
- **Timeline**: Job complete hone mein kitna time lagega
- **Date**: Job ka date (if applicable)
- **Time**: Preferred time (if applicable)

**Location:**

- **Street Address**: Complete address (optional)
- **City**: Apna shehar
- **State**: State/County
- **ZIP Code**: Postal code
- **Is Remote**: Agar remote work ho sakta hai to check karein

**Additional Details:**

- **Requirements**: Specific requirements (list format)
- **Tags**: Keywords jo job ko describe karte hain
- **Images**: Job se related images upload karein (optional)
- **Additional Requests**: Koi special requirements

**Step 3: Submit Job**

1. Form review karein
2. **"Post Job"** ya **"Submit"** button click karein
3. Job successfully post ho jayegi

**Step 4: What Happens Next?**

- ✅ Job status: **OPEN**
- ✅ Job visible hoga available jobs mein
- ✅ Matching vendors ko notification jayega
- ✅ Job aapke dashboard mein dikhega

---

### Workflow 2: Bids Dekhna aur Accept Karna

#### Step 1: Job Details Par Jana

1. Customer Dashboard se **"My Jobs"** section mein jayein
2. Ya **"/customer/jobs"** par jayein
3. Job card par click karein jo aapne post ki hai

#### Step 2: Bids View Karna

1. Job details page par aapko **"Bids"** section dikhega
2. **"View Bids"** ya **"X Bids Received"** button click karein
3. Saare bids ki list dikhegi with:
   - **Vendor Name**
   - **Vendor Rating** (stars)
   - **Bid Amount**
   - **Timeline**
   - **Description**
   - **Experience Level**

#### Step 3: Vendor Profile Dekhna

1. Kisi bid par **"View Vendor Profile"** click karein
2. Vendor ka complete profile dikhega:
   - Company name
   - Experience
   - Service types
   - Portfolio/images
   - Reviews/ratings
   - Completed jobs count

#### Step 4: Bid Actions

**Option A: Accept Bid**

1. Bid card par **"Accept Bid"** button click karein
2. Confirmation popup mein **"Confirm"** click karein
3. **What happens:**
   - ✅ Bid status: **ACCEPTED**
   - ✅ Job status: **IN_PROGRESS**
   - ✅ Vendor ko notification jayega
   - ✅ Chat room automatically create hoga
   - ✅ Baaki sab bids automatically reject ho jayenge

**Option B: Counter Offer (Negotiate Price)**

1. Bid par **"Counter Offer"** button click karein
2. Form mein:
   - **New Amount**: Jo aap chahte hain
   - **Message** (optional): Apni message
3. **"Submit Counter Offer"** click karein
4. Vendor ko notification jayega
5. Vendor accept/reject/counter kar sakta hai

**Option C: Reject Bid**

1. Bid par **"Reject"** button click karein
2. Confirmation par confirm karein
3. Vendor ko rejection notification jayega

---

### Workflow 3: Counter Offer Negotiation

#### Customer Counter Offer Kare:

1. Bid details page par jayein
2. **"Counter Offer"** section mein:
   - **Proposed Amount**: Naya amount
   - **Message**: Optional message
3. **"Submit Counter Offer"** click karein

#### Vendor Response:

- **Accept**: Vendor accept kare to bid automatically accept ho jayega
- **Reject**: Vendor reject kare to bid reject ho jayega
- **Counter Again**: Vendor apna counter offer de sakta hai

#### Negotiation Rules:

- Maximum **3 rounds** of negotiation
- Ek round mein sirf ek counter offer
- Dono parties ko notification jayega har counter offer par
- Agar 3 rounds complete ho jayein aur agree nahi hua to bid close ho jayega

#### Status Tracking:

- **INITIAL**: Pehli bid
- **NEGOTIATING**: Counter offers chal rahe hain
- **AGREED**: Final amount agree ho gaya
- **REJECTED**: Reject ho gaya

---

### Workflow 4: Chat with Vendor

#### Step 1: Chat Room Access

1. Job accept hone ke baad chat room automatically create hota hai
2. Top navigation mein **"Messages"** icon par click karein
3. Ya direct: `/customer/messages`

#### Step 2: Select Chat

1. Chat rooms ki list mein job-related chat select karein
2. Chat open ho jayega

#### Step 3: Send Messages

1. Message box mein type karein
2. **"Send"** button ya Enter key press karein
3. Message real-time vendor ko jayega
4. Vendor ki messages bhi real-time aayengi

#### Features:

- ✅ Real-time messaging (Socket.IO)
- ✅ Message history saved
- ✅ Unread message count
- ✅ Online/offline status (if implemented)

---

### Workflow 5: Job Completion & Payment

#### Step 1: Vendor Job Complete Karta Hai

1. Vendor job complete karne ke baad aapko notification milega
2. Job details page par status **"COMPLETED"** dikhega

#### Step 2: Review Work

1. Job details page par jayein
2. Vendor ki completed work review karein
3. Images/updates check karein

#### Step 3: Accept Completion

1. Agar work satisfactory hai:
   - **"Accept Completion"** button click karein
   - Job confirmed ho jayega

#### Step 4: Payment Tracking

1. Job details par **"Payment"** section mein jayein
2. Manual payment options:
   - **Payment Method**: Select karein:
     - CASH
     - VENMO
     - ZELLE
   - **Payment Received**: Check karein jab payment ho jaye
   - **Payment Notes**: Additional notes (optional)
3. **"Mark Payment Received"** click karein

#### Step 5: Leave Review (Optional)

1. Job complete hone ke baad review option available hai
2. Vendor ko rating dein (1-5 stars)
3. Comment add karein
4. **"Submit Review"** click karein

---

### Customer Dashboard Features

#### Main Sections:

1. **Dashboard** (`/customer`): Overview statistics
2. **My Jobs** (`/customer/jobs`): Saare jobs ki list
3. **Messages** (`/customer/messages`): Chat with vendors
4. **Profile** (`/customer/profile`): Edit profile
5. **Support** (`/customer/support`): Support tickets
6. **Notifications** (`/notifications`): Saare notifications

---

## 🔧 Vendor Workflow

### Vendor Dashboard Overview

Login ke baad aap `/vendor` par redirect honge. Dashboard mein:

- **Active Bids**: Kitne bids pending hain
- **Awarded Jobs**: Kitne jobs assign ho chuke hain
- **Completed Jobs**: Kitne jobs complete ho chuke hain
- **Earnings**: Total earnings
- **Rating**: Average rating
- **Recent Activity**: Latest bids/jobs

---

### Workflow 1: Profile Setup (First Time)

#### Step 1: Complete Profile

1. Pehli baar login ke baad profile setup required hai
2. **"Complete Profile"** ya **"/vendor/profile/setup"** par jayein

#### Step 2: Fill Vendor Details

- **Company Name** (optional): Business name
- **Business Type**: Type of business
- **Experience**: Years of experience
- **Service Types**: Select multiple services jo aap provide karte hain
- **Skills**: Apni skills add karein
- **Description**: Detailed description of services
- **Portfolio Images**: Previous work ki images upload karein
- **Documents** (optional): Certificates, licenses

#### Step 3: Save Profile

1. **"Save Profile"** click karein
2. Profile active ho jayega
3. Ab aap jobs par bid kar sakte hain

---

### Workflow 2: Browse Available Jobs

#### Step 1: Navigate to Jobs

1. Vendor Dashboard se
2. Left sidebar mein **"Available Jobs"** ya **"Jobs"** click karein
3. Ya direct: `/vendor/jobs`

#### Step 2: View Jobs List

1. Saare available jobs dikhenge
2. Jobs automatically filter honge:
   - ✅ Status: **OPEN**
   - ✅ Aapki **service types** match karte hain
   - ✅ Same **city** (preference)
   - ✅ Aapne pehle bid nahi kiya

#### Step 3: Filter Jobs (Optional)

- **Category**: Service category
- **Location**: City/State
- **Budget Range**: Minimum/Maximum budget
- **Sort By**: Date, Budget, etc.

#### Step 4: View Job Details

1. Job card par click karein
2. Complete details dekhein:
   - Job description
   - Requirements
   - Budget & timeline
   - Location
   - Images
   - Customer information

---

### Workflow 3: Submit Bid

#### Step 1: Prepare Bid

1. Job details page par **"Submit Bid"** button click karein
2. Ya direct: `/vendor/jobs/:id/bid`

#### Step 2: Fill Bid Form

- **Amount**: Your bid amount
- **Description**: Explain kyun aap best fit hain
- **Timeline**: Kitne din/weeks mein complete karenge
- **Milestones** (optional): Project milestones break down

#### Step 3: Submit Bid

1. Form review karein
2. **"Submit Bid"** click karein
3. **What happens:**
   - ✅ Bid submitted ho jayega
   - ✅ Customer ko notification jayega
   - ✅ Bid aapke "My Bids" mein dikhega
   - ✅ Status: **PENDING**

#### Step 4: Track Bid Status

- **PENDING**: Customer ne abhi decide nahi kiya
- **ACCEPTED**: Bid accept ho gaya! 🎉
- **REJECTED**: Bid reject ho gaya
- **WITHDRAWN**: Aapne bid withdraw kar di

---

### Workflow 4: Handle Counter Offers

#### Step 1: Receive Counter Offer

1. Customer counter offer deta hai
2. Aapko notification milega
3. Notification par click karein ya bid details par jayein

#### Step 2: View Counter Offer

1. Bid details page par counter offer dikhega:
   - Customer ka proposed amount
   - Customer ki message
   - Previous negotiation history

#### Step 3: Respond to Counter Offer

**Option A: Accept Counter Offer**

1. **"Accept Counter Offer"** button click karein
2. Bid automatically accept ho jayega
3. Job aapko assign ho jayega

**Option B: Counter Again**

1. **"Counter Offer"** button click karein
2. Naya amount aur message enter karein
3. **"Submit Counter"** click karein
4. Customer ko notification jayega

**Option C: Reject**

1. **"Reject"** button click karein
2. Counter offer reject ho jayega

---

### Workflow 5: Work on Assigned Jobs

#### Step 1: View Assigned Jobs

1. Dashboard mein **"Awarded Jobs"** section
2. Ya **"/vendor/jobs"** par filter **"Assigned"**
3. Assigned jobs ki list dikhegi

#### Step 2: Job Details

1. Assigned job par click karein
2. Complete job details dekhein
3. Customer requirements check karein

#### Step 3: Chat with Customer

1. Job details page par **"Chat"** button
2. Ya **"/vendor/messages"** par jayein
3. Customer se discuss karein:
   - Requirements clarify karein
   - Updates share karein
   - Questions poochhein

#### Step 4: Complete Job

1. Work complete hone ke baad
2. Job details page par **"Mark Complete"** click karein
3. Confirmation par confirm karein
4. Customer ko notification jayega
5. Customer review karne ke baad confirm karega

---

### Workflow 6: Manage Profile

#### Edit Profile

1. **"/vendor/profile"** par jayein
2. Update kar sakte hain:
   - Personal information
   - Service types
   - Skills
   - Portfolio images
   - Description
3. **"Save Changes"** click karein

#### Upload Portfolio

1. Profile page par **"Portfolio"** section
2. **"Add Image"** button click karein
3. Images select karein (multiple)
4. Upload ho jayengi
5. Images aapke public profile par dikhengi

#### View Public Profile

1. Profile page par **"View Public Profile"** button
2. Ya URL: `/vendor/public/:vendorId`
3. Public profile dikhega jo customers dekh sakte hain

---

## 👨‍💼 Admin Workflow

### Admin Dashboard Overview

Login ke baad aap `/admin` par redirect honge. Dashboard mein:

- **Total Users**: Kitne users hain
- **Active Jobs**: Currently kitne jobs hain
- **Pending Support**: Kitne support tickets pending hain
- **System Statistics**: Platform analytics

---

### Workflow 1: User Management

#### View All Users

1. Left sidebar se **"Users"** ya **"/admin/users"** par jayein
2. Saare users ki list dikhegi with:
   - Name, Email, Role
   - Status (ACTIVE/SUSPENDED/DELETED)
   - Registration date
   - Last login

#### Filter Users

- **By Role**: Customer, Vendor, Admin
- **By Status**: Active, Suspended, Deleted
- **Search**: Name ya email se search

#### User Actions

**Suspend User:**

1. User row par **"..."** menu click karein
2. **"Suspend"** select karein
3. Reason enter karein (optional)
4. User ko notification jayega
5. User login nahi kar payega

**Activate User:**

1. Suspended user par **"Activate"** click karein
2. User active ho jayega

**Delete User:**

1. **"Delete"** click karein (soft delete)
2. User status: **DELETED**
3. User login nahi kar payega

**View User Details:**

1. User row par click karein
2. Complete profile, jobs, bids dikhenge

---

### Workflow 2: Job Management

#### View All Jobs

1. **"/admin/jobs"** par jayein
2. Saare jobs ki list with:
   - Title, Customer, Status
   - Budget, Location
   - Created date

#### Filter Jobs

- **By Status**: Open, In Progress, Completed, Cancelled
- **By Category**: Service category
- **By Date Range**: Created date

#### Job Actions

**View Job Details:**

1. Job par click karein
2. Complete details, bids, chat history dikhega

**Cancel Job:**

1. **"Cancel Job"** button click karein
2. Reason enter karein
3. Job status: **CANCELLED**
4. Customer aur vendor ko notification jayega

**View Analytics:**

1. Job details par **"Analytics"** tab
2. Views, bids, completion time dikhega

---

### Workflow 3: Vendor Management

#### View All Vendors

1. **"/admin/vendors"** par jayein
2. Saare vendors ki list with:
   - Company name, Rating
   - Completed jobs
   - Verification status

#### Verify Vendor

1. Vendor profile check karein
2. Documents review karein
3. **"Verify Vendor"** button click karein
4. Vendor verified ho jayega
5. Verified badge dikhega

#### Vendor Statistics

- Total bids submitted
- Acceptance rate
- Average rating
- Earnings

---

### Workflow 4: Customer Management

#### View All Customers

1. **"/admin/customers"** par jayein
2. Customers ki list with:
   - Name, Email
   - Jobs posted
   - Total spent

#### Customer Analytics

- Jobs posted count
- Completed jobs
- Active jobs
- Spending statistics

---

### Workflow 5: Support Ticket Management

#### View Tickets

1. **"/admin/support"** par jayein
2. Saare support tickets ki list

#### Filter Tickets

- **By Status**: Open, In Progress, Resolved, Closed
- **By Priority**: Low, Medium, High, Urgent
- **By Category**: Technical, Billing, General, Dispute

#### Handle Ticket

**Assign Ticket:**

1. Ticket par click karein
2. **"Assign To"** dropdown se admin select karein
3. Ticket assigned ho jayega

**Respond to Ticket:**

1. Ticket details par **"Respond"** click karein
2. Message type karein
3. **"Send Response"** click karein
4. User ko notification jayega

**Resolve Ticket:**

1. Issue resolve hone ke baad
2. **"Mark Resolved"** click karein
3. Ticket status: **RESOLVED**

**Close Ticket:**

1. **"Close Ticket"** click karein
2. Ticket permanently close ho jayega

---

### Admin Dashboard Features

#### Main Sections:

1. **Dashboard** (`/admin`): Overview statistics
2. **Users** (`/admin/users`): User management
3. **Jobs** (`/admin/jobs`): Job oversight
4. **Vendors** (`/admin/vendors`): Vendor management
5. **Customers** (`/admin/customers`): Customer management
6. **Support** (`/admin/support`): Support tickets
7. **Profile** (`/admin/profile`): Admin profile

---

## 🔔 Common Features (All Users)

### Notifications

#### View Notifications

1. Top navigation mein **bell icon** par click karein
2. Ya **"/notifications"** par jayein
3. Saare notifications dikhenge:
   - **Unread**: Bold text
   - **Read**: Normal text

#### Notification Types:

- 🆕 **NEW_BID**: Customer ko jab vendor bid kare
- ✅ **BID_ACCEPTED**: Vendor ko jab customer accept kare
- ❌ **BID_REJECTED**: Vendor ko rejection
- 💰 **COUNTER_OFFER_RECEIVED**: Counter offer milne par
- 📝 **NEW_MESSAGE**: New chat message
- ✅ **JOB_COMPLETED**: Job complete hone par
- And many more...

#### Actions:

- **Mark as Read**: Notification par click karein
- **Mark All Read**: Sabko read mark karein
- **Navigate**: Notification par click karein to related page par jayenge

---

### Support Tickets

#### Create Support Ticket

1. **"/support"** par jayein
2. **"Create Ticket"** button click karein
3. Fill form:
   - **Title**: Issue ka title
   - **Category**: Technical, Billing, General, Dispute
   - **Priority**: Low, Medium, High, Urgent
   - **Description**: Detailed description
4. **"Submit"** click karein

#### View My Tickets

1. **"/support"** par jayein (ya role-specific support page)
2. Saare tickets dikhenge with status
3. Ticket par click karein to details dekhein
4. Responses add kar sakte hain

---

### Profile Management

#### Edit Profile

1. **"/profile"** par jayein (role-specific)
2. Update kar sakte hain:
   - Personal information
   - Contact details
   - Location
   - Avatar/Profile picture
3. **"Save Changes"** click karein

#### Change Password

1. Profile page par **"Change Password"** section
2. Enter:
   - Current password
   - New password
   - Confirm new password
3. **"Update Password"** click karein

---

### Search & Filters

#### Search Jobs (Vendors)

- **By Category**: Service type
- **By Location**: City/State
- **By Budget**: Range filter
- **By Date**: Latest first

#### Search Bids (Customers)

- **By Amount**: High/Low
- **By Vendor Rating**: Best rated first
- **By Timeline**: Fastest completion

---

## ❓ FAQs

### Q: Agar main password bhool gaya to?

**A:** Login page par **"Forgot Password"** click karein. Email par reset link jayega.

### Q: Bid ke baad cancel kar sakte hain?

**A:** Haan, vendor **"Withdraw Bid"** kar sakta hai jab tak bid accept nahi hui.

### Q: Kitne bids ek job par daal sakte hain?

**A:** Sirf **1 bid** per job per vendor.

### Q: Negotiation mein kitne rounds allowed hain?

**A:** Maximum **3 rounds** of negotiation (default).

### Q: Chat messages delete kar sakte hain?

**A:** Abhi nahi, but future update mein feature add ho sakta hai.

### Q: Payment kaise hoga?

**A:** Currently **manual payment** system hai (CASH/VENMO/ZELLE). Platform directly payment nahi leta.

### Q: Profile verification kaise hota hai?

**A:** Admin manually vendors ko verify karte hain. Aap support ticket create kar sakte hain verification ke liye.

---

## 📞 Support

Agar koi problem ho ya help chahiye:

1. **Support Ticket**: Create support ticket from support page
2. **Email**: support@venbid.com (if configured)
3. **FAQ**: Check FAQ page for common questions

---

**End of User Guide**

Agar koi aur questions hain to support ticket create karein ya documentation check karein! 🙏
