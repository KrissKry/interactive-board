# Backend overview

## Usage

To launch the application, use the following command inside of the `root/backend` folder

`./gradlew bootRun`

### RabbitMq docker

```shell
docker pull pcloud/rabbitmq-stomp:3
docker container run -it --name rabbitmq-stomp -p 15672:15672 -p 5672:5672 -p 61613:61613 pcloud/rabbitmq-stomp:3
```

### Cassandra docker

```shell
docker pull cassandra
docker container run -it --name cassandra -p 9042:9042 cassandra
```

## Available socket endpoints

### `/api/room/create`

POST endpoint which takes two arguments: name:str, password:str, returns dto witch current board state:

```java
public class RoomDTO {
    private String roomId;
    private String roomName;
    private List<ChatMessageDTO> messages;
    private Map<Point, Color> pixels;
}
```

```java
public class ChatMessageDTO {
    private String text;
    private String username;
}
```

```java
public class Point {
    private Short x, y;
}
```

```java
public class Color {
    private byte red, green, blue;
}
```

### `STOMP CONNECTION`

```javascript
websocket_url = 'ws://localhost:8080/room'
```

connect with following headers

```javascript
connectHeaders: {
    login: 'user',
        roomId
:
    `{id}`,
        roomPassword
:
    `{password}`,
}
```

### `/api/room/connect/{id}`

STOMP subscribe mapping which returns the current state of an existing room:

```java
public class RoomDTO {
    private String roomId;
    private String roomName;
    private List<ChatMessageDTO> messages;
    private Map<Point, Color> pixels;
}
```

### `/api/room/connected/{id}`

STOMP subscribe mapping, which informs about users joining/disconnecting from the room, returns:

```java
public class UserDTO {
    private String name;
    private String status;
}
```

STILL TO BE TESTED

### `/api/board/send/{id}` send drawing input to all users

STOMP send mapping to update the board state

body:

```java
public class ChangedPixelsDTO {
    Color color;
    List<Point> points;
}
```

Composite objects described above

### `/topic/board/listen/{id}` listen for drawing board input from users

return value object same as input for `/api/board/send/{id}`

### `/api/chat/send{id}` send chat messages to all users

body:

```java
public class ChatMessageDTO {
    private String text;
    private String username;
}
```

### `/topic/chat.listen.{id}` listen for chat messages

return value object same as body of `/api/chat/send{id}`

As of now, all endpoints start with the ws://localhost:8080 prefix
