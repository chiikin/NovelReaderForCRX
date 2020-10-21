import hbookerServer from "./hbookerServer"
export function getServer(webApp) {
    switch (webApp) {
        case "hbooker":
            return hbookerServer;
    }
}