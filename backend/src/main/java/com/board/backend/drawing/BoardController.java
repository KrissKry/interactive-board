package com.board.backend.drawing;

import com.board.backend.drawing.dto.ChangedPixelsDTO;
import com.board.backend.drawing.model.Color;
import com.board.backend.drawing.model.Point;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.messaging.simp.user.SimpUser;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.stereotype.Controller;

import java.util.Map;
import java.util.Set;

@Controller
@RequiredArgsConstructor
public class BoardController
{

    private final SimpUserRegistry simpUserRegistry;

    private final BoardFacade boardFacade;

    public Set<SimpUser> getUsers() {
        return simpUserRegistry.getUsers();
    }

    @SubscribeMapping("/board/get")
    public Map<Point, Color> getBoard() {
        return boardFacade.getCurrentBoard();
    }

    @MessageMapping("/board/send")
    @SendTo("/board/listen")
    public ChangedPixelsDTO addPixels(@Payload ChangedPixelsDTO pixels) {
        boardFacade.storePoints(pixels);
        return pixels;
    }
}













//package com.board.backend.drawing;
//
//import com.board.backend.drawing.dto.ChangedPixelsDTO;
//import com.board.backend.drawing.mapper.MessageToPixelsMapper;
//import com.board.backend.drawing.model.Board;
//import com.google.gson.Gson;
//import lombok.NonNull;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.autoconfigure.condition.ConditionalOnNotWebApplication;
//import org.springframework.context.annotation.Scope;
//import org.springframework.http.ResponseEntity;
//import org.springframework.stereotype.Component;
//import org.springframework.stereotype.Controller;
//import org.springframework.web.context.support.SpringBeanAutowiringSupport;
//import org.springframework.web.socket.server.standard.SpringConfigurator;
//
//import javax.annotation.PostConstruct;
//import javax.websocket.*;
//import javax.websocket.server.PathParam;
//import javax.websocket.server.ServerEndpoint;
//import java.io.IOException;
//import java.util.Enumeration;
//import java.util.concurrent.ConcurrentHashMap;
//
//@Controller
//@ServerEndpoint(value = "/board/{userId}")
//@Scope("protptype")
//@Component
//@Slf4j
//public class BoardServer {
//    private static int onlineCount;
//    private static ConcurrentHashMap<String, Session> webSocketMap = new ConcurrentHashMap<>();
//    private String userId;
//    private Session session;
//
//    @Autowired
//    private static BoardFacade boardFacade = new BoardFacade(new Board(), new MessageToPixelsMapper(new Gson()));
//
//    @PostConstruct
//    public void init(){
//        SpringBeanAutowiringSupport.processInjectionBasedOnCurrentContext(this);
//    }
//
//    @OnOpen
//    public void onOpen(Session session, @PathParam("userId") String userId) {
//        this.userId = userId;
//        this.session = session;
//        webSocketMap.put(userId, session);
//        log.info(userId + " - Connection established successfully...");
//        // return ResponseEntity.ok(boardFacade.getBoard());
//    }
//
//    @OnMessage
//    public void onMessage(String message, Session session) {
//        try {
//            Enumeration<String> keys = webSocketMap.keys();
//            System.out.println("Messages received by the server:" + message);
//
//            while(keys.hasMoreElements()) {
//                String key = keys.nextElement();
//                //Determine if the user is still online
//                if (webSocketMap.get(key) == null){
//                    webSocketMap.remove(key);
//                    System.err.println(key + " : null");
//                    continue;
//                }
//                Session sessionValue = webSocketMap.get(key);
//                //Remove Forwarding to Yourself
//                if (key.equals(this.userId)){
//                    System.err.println("my id " + key);
//                    continue;
//                }
//                //Determine if session is open
//                if (sessionValue.isOpen()){
//                    // boardFacade.storePoints(message);
//                    sessionValue.getBasicRemote().sendText(message);
//                }else {
//                    log.error(key + ": not open");
//                    sessionValue.close();
//                    webSocketMap.remove(key);
//                }
//            }
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
//    }
//
//    @OnError
//    public void onError(Session session, Throwable error) {
//        log.error("Connection exception..." + error.getStackTrace() +error.getMessage());
//        error.printStackTrace();
//    }
//
//    @OnClose
//    public void onClose() {
//        log.info("Connection closed");
//    }
//
//    public static synchronized int getOnlineCount() {
//        return onlineCount;
//    }
//
//    public static synchronized void addOnlineCount() {
//        BoardServer.onlineCount++;
//    }
//
//    public static synchronized void subOnlineCount() {
//        BoardServer.onlineCount--;
//    }
//}
//
