# Wane ChatBot

⚠️ **WARNING: THIS SHOULD NOT BE USED IN PRODUCTION BUILDS IT IS NOT SAFE. ONLY USE IT FOR PERSONAL USE!** ⚠️

This is a Claude-powered chat application that allows interaction with different AI personalities.
You can also create your own personalities if you wish to do so.

## Security Notice
This application exposes the Claude API key in the frontend code, which is **unsafe for production environments**. This implementation is only intended for local development.

## Note
I have only provided installation instructions for Windows using npm. If you wish to use Mac, Linux or Yarn you must look elsewhere for instructions.

## Features
- Multiple AI personalities with custom system prompts
- Personality-specific introductions for each personality
- Ability to create, edit, and delete your own chatbots
- Multiple chats per AI bot
- User personas with customizable descriptions and avatars
- Message regeneration with version history navigation
- Uses Claude 3 Haiku model
- Configurable memory depth for conversation context
- Edit and delete message capabilities
- Ability to clear the chat history
- "Continue Chat" functionality for existing conversations
- Profile section for managing user personas
- Settings section for adjusting application behavior
- Dark/Light theme toggle
- Built using Tauri, a lightweight framework that allows HTML, CSS, and JavaScript to run in an executable file

## Installation and Usage
1. Make sure you have Rust installed and up to date on your computer since Tauri uses that to run. If you want to know if your Rust is up to date, you can run `rustup update` in your terminal. If you need to install Rust, here is the link for doing so: https://www.rust-lang.org/tools/install
2. Clone the repository.
3. cd into the project directory.
4. Run `npm install` in the terminal.
5. Change the `API-example.js` file name to `API.js` file in the `src` directory and then put in your own Claude API key.
   ```javascript
   export const config = {
       CLAUDE_API_KEY: 'your-claude-api-key-here'
   };
   ```
6. run `npm run tauri dev` in the terminal to run the program.
7. If you want to make changes to the code yourself also run `npx webpack watch` before running the application.

## How to compile into executable
1. Make sure you have done all of the steps in the installation and usage section.
2. cd into your project directory.
3. Run `npm run clean-build` in your terminal.
4. Locate the executable, the terminal will tell you where it was compiled after finishing.

## License
MIT License

## Note
This is a demonstration project and should not be used in production environments. For production use, implement proper backend services to handle API key security.
