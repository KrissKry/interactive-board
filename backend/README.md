# Backend overview

## Usage

To launch the application, use the following command inside of the `root/backend` folder

`./gradlew bootRun`

## Available socket endpoints

- `/api/board/get` subscribe to get current board state
- `/api/board/send` send drawing input to all users
- `/board/listen` listen for drawing board input from users
- `/api/chat/get` subscribe to get the current chat contents
- `/api/chat/send` send chat messages to all users
- `/chat/listen` listen for chat messages


As of now, all endpoints start with the ws://localhost:8080 prefix
