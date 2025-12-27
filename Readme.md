# 📹 YouTube Backend Clone

> A robust, production-ready RESTful API for a video streaming platform. Built with Node.js, Express, and MongoDB, this backend handles complex features like video hosting, playlist management, social interactions (likes/comments), and secure user authentication.

---

## 📖 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
  - [User Management](#user-management)
  - [Video Management](#video-management)
  - [Playlist Management](#playlist-management)
  - [Comments](#comments)
- [Project Structure](#-project-structure)

---

## ✨ Features

* **🔐 User Authentication**: Secure login/signup using **JWT** (Access & Refresh tokens) and **Bcrypt** for password hashing.
* **📼 Video Management**:
    * Upload videos and thumbnails using **Multer** and **Cloudinary**.
    * Support for pagination, searching, and sorting videos.
    * Publish/Unpublish toggle for video visibility.
* **📂 Playlists**:
    * Create custom playlists.
    * Add/Remove videos from playlists.
    * View full playlist details with aggregated video owner information.
* **💬 Social Interactions**:
    * Add, update, and delete comments on videos.
    * Like/Dislike functionality.
    * Subscription system (Subscribe/Unsubscribe to channels).
* **📊 Advanced Aggregation**: Uses MongoDB Aggregation Pipelines for complex data retrieval (e.g., fetching a user's watch history or a playlist with full video details).

---

## 🛠 Tech Stack

* **Runtime**: [Node.js](https://nodejs.org/)
* **Framework**: [Express.js](https://expressjs.com/)
* **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose ODM)
* **File Storage**: [Cloudinary](https://cloudinary.com/) (Managed via API)
* **Authentication**: JSON Web Tokens (JWT)
* **Middleware**: CORS, Cookie-Parser, Multer

---

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites
* Node.js (v16+)
* MongoDB (Local or Atlas)
* Cloudinary Account (for media storage)

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/shaheer-developer/youtube_backend.git](https://github.com/shaheer-developer/youtube_backend.git)
    cd youtube_backend
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables** (see below).

4.  **Run the server**
    ```bash
    # Development mode (using nodemon)
    npm run dev

    # Production mode
    npm start
    ```

---

## 🔑 Environment Variables

Create a `.env` file in the root directory and add the following configuration.

```env
# Server Configuration
PORT=8000
CORS_ORIGIN=*

# Database Connection
MONGODB_URI=mongodb+srv://<your_user>:<your_password>@cluster.mongodb.net

# Security (JWT)
ACCESS_TOKEN_SECRET=<generate_random_string>
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=<generate_random_string>
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary (File Uploads)
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>

```

---

## 🔗 API Endpoints

### User Management

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/v1/users/register` | Register a new user (requires avatar/coverImage) |
| `POST` | `/api/v1/users/login` | Login and receive Access/Refresh tokens |
| `POST` | `/api/v1/users/logout` | Clear cookies and logout user |
| `POST` | `/api/v1/users/refresh-token` | Generate new Access Token using Refresh Token |
| `GET` | `/api/v1/users/current-user` | Get logged-in user details |
| `GET` | `/api/v1/users/c/:username` | Get channel profile details |
| `GET` | `/api/v1/users/history` | Get user watch history |

### Video Management

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/v1/videos` | Get all videos (supports query, pagination, sort) |
| `POST` | `/api/v1/videos` | Publish a video (Upload video & thumbnail) |
| `GET` | `/api/v1/videos/:videoId` | Get specific video details |
| `PATCH` | `/api/v1/videos/:videoId` | Update video title/description/thumbnail |
| `DELETE` | `/api/v1/videos/:videoId` | Delete a video |
| `PATCH` | `/api/v1/videos/toggle/publish/:videoId` | Toggle `isPublished` status |

### Playlist Management

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/v1/playlists` | Create a new playlist |
| `GET` | `/api/v1/playlists/user/:userId` | Get all playlists for a specific user |
| `GET` | `/api/v1/playlists/:playlistId` | Get a playlist by ID (with videos) |
| `PATCH` | `/api/v1/playlists/add/:videoId/:playlistId` | Add a video to a playlist |
| `PATCH` | `/api/v1/playlists/remove/:videoId/:playlistId` | Remove a video from a playlist |
| `DELETE` | `/api/v1/playlists/:playlistId` | Delete a playlist |

### Comments

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/v1/comments/:videoId` | Get all comments for a video (Paginated) |
| `POST` | `/api/v1/comments/:videoId` | Add a comment to a video |
| `PATCH` | `/api/v1/comments/:commentId` | Edit a comment |
| `DELETE` | `/api/v1/comments/:commentId` | Delete a comment |

---

## 📂 Project Structure

```text
src/
├── config/             # Configuration (DB, Cloudinary)
├── controllers/        # Business logic (Video, User, Playlist, etc.)
├── db/                 # Database connection setup
├── middlewares/        # Auth, Multer (File upload), Error handling
├── models/             # Mongoose Schemas (User, Video, Comment, etc.)
├── routes/             # Express routes definition
├── utils/              # Helper functions (ApiResponse, ApiError, AsyncHandler)
├── app.js              # Express app initialization
├── constants.js        # Global constants (DB Name)
└── index.js            # Server entry point

```

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

```

```
