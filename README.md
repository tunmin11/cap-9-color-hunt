# 📸 cap-9-color-hunt
# The Constraint-Driven Aesthetic App
> **Tagline:** Your color vibe check. Cap 9 Color Hunt is the constraint-driven app that makes **aesthetic consistency** the ultimate game. Find your hue, nail the lighting, and flex your perfect 3x3 grid. No cap.

## ✨ Project Overview
Cap 9 Color Hunt challenges photographers to master visual consistency by completing "Hunt Packs." Each Pack requires a user to commit to a single, dominant **target color** (e.g., *Crimson* or *Emerald*) and upload **9 separate photos** where that color is the core aesthetic.

The app uses a custom backend function to **verify the dominant color** in each image, ensuring integrity and making the final 3x3 grid a truly satisfying showcase of skill.

| Feature | Goal | Gen Z Vibe |
| :--- | :--- | :--- |
| **Hunt Packs** | Gamified 3x3 photo challenge based on one strict color constraint. | **Challenge:** *Slay* the color theme. |
| **Color Immersion UI** | The app's interface dynamically tints to the target color. | **Aesthetic:** It's *giving* monochromatic. |
| **Color Check Logic** | Backend algorithm verifies the dominant color of the image upon upload. | **Integrity:** The results are **Cap 9** (No Lie). |
| **Aesthetic Feed** | A feed dedicated to sharing completed, perfect 3x3 grids. | **Flex:** Showcase your perfect **Gridwork**. |

---

## 🏗️ Technical Stack (MVP Alpha)

This project is built for rapid development and scalability on the Firebase **Spark (Free)** plan, leveraging a separate, cost-efficient image host.

| Component | Tool / Language | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **Next.js** (React) | Fast, modern web application for the UI/UX. |
| **Authentication** | **Firebase Auth** | User sign-up, login, and secure session management. |
| **Database** | **Cloud Firestore** | Stores relational data (`users`, `packs`, `colors`). |
| **Core Logic (The Magic)** | **Google Cloud Functions (Node.js/Python)** | Custom backend service for image processing and verification. |
| **Image Storage** | **Third-Party Host** (e.g., Cloudinary/Imgur) | External storage for photo files to stay on the Firebase Free Plan. |

---

## 🧠 Core Logic: The Color Verification Engine

The integrity of the challenge relies on the **`verifyColorMatch`** function, which runs on the backend.

1.  **Client Action:** User uploads an image to the Third-Party Host and sends the **public URL** to a Cloud Function endpoint.
2.  **Color Processing:** The Cloud Function downloads the image and employs a **$K$-Means Clustering** algorithm to find the single most dominant color (Hex Code).
3.  **Verification:** It compares the image's dominant color (converted to the more robust **HSV** color space) against the pre-defined `h_min`/`h_max` range for the current Hunt Pack's target color.
4.  **Firestore Update:** The function updates the `packs/{packId}/images` document, setting `isVerified: true` or `false`.

### Data Flow Diagram



---

## 🛠️ Getting Started (Local Setup)

This project requires a Firebase account with billing *enabled* for the Cloud Functions service, but the usage will remain within the free tier.

### 1. Prerequisites

* Node.js (v18+) and npm/yarn
* Git
* A Firebase Project
* A Third-Party Image Host API Key (e.g., Cloudinary, for image storage)

### 2. Installation

```bash
# Clone the repository
git clone [https://github.com/your-username/cap-9-color-hunt.git](https://github.com/your-username/cap-9-color-hunt.git)
cd cap-9-color-hunt

# Install dependencies
npm install 
# or 
yarn install 

# Install Cloud Functions dependencies (if applicable)
cd functions 
npm install 
cd ..