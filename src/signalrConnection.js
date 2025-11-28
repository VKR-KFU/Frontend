import * as signalR from "@microsoft/signalr";

let connection = null;

export function getSignalRConnection() {
    if (!connection) {
        connection = new signalR.HubConnectionBuilder()
            .withUrl("/hubs/notifications")
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();
    }

    return connection;
}
