
---

# 🔥 Bonfire

Bonfire is a backend module built with **TypeScript**, **Express**, and **Node.js** that serves as a centralized endpoint for web and native apps. The server handles API requests securely using **Bearer JWT tokens** for authentication.

> **This project is a diploma thesis for the Technical College for Information Technology in Wels.**  
> **Copyright ©** All members of the thesis.

## 🌟 Features

- **Centralized API endpoint**: Serves all apps (web, native, etc.) from a single backend.
- **Token-based authentication**: Secure API access with JWT bearer tokens.
- **TypeScript-powered**: Static typing for improved reliability and scalability.
- **Flexible environment**: Seamlessly switches between development and production.

## 🚀 Getting Started

### Prerequisites

- **Node.js** and **npm** installed
- **TypeScript** globally installed (`npm install -g typescript`)

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Diplomarbeit-Social-Media-App/backend-module.git
   cd backend-module
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

### Running the Project

Bonfire includes several npm scripts to make development and deployment easy:

| Script     | Description                                   |
|------------|-----------------------------------------------|
| `build`    | Compiles the TypeScript code to JavaScript.   |
| `start`    | Runs the compiled JavaScript in production.   |
| `dev`      | Starts the server in development mode with hot-reloading. |
| `test`     | Runs the test suite with Jest.                |

### Commands

- **Development Mode**: Start the server with hot-reloading for development:

  ```bash
  npm run dev
  ```

- **Build for Production**: Compile TypeScript to JavaScript:

  ```bash
  npm run build
  ```

- **Production Mode**: Run the compiled JavaScript code:

  ```bash
  npm start
  ```

- **Run Tests**: Execute unit tests with Jest:

  ```bash
  npm test
  ```

## 📜 API Usage

The backend requires **Bearer JWT** tokens for accessing secured routes. Here’s an example of setting the token in the request header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

Ensure your client app includes this token in the request headers for authenticated routes.

## 🛠️ Built With

- **TypeScript** - Static typing and modern JavaScript features
- **Express** - Minimalist web framework for Node.js
- **Node.js** - JavaScript runtime environment

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Happy coding! 🔥