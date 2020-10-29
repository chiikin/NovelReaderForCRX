import hbookerServer from "./hbookerServer"
import HbookerService from "./HbookerService"

let hbookerService;

export function getServer(webApp) {
    switch (webApp) {
        case "hbooker":
            return hbookerServer;
    }
}

export function getService(webApp) {
    switch (webApp) {
        case "hbooker":
            if (!hbookerService)
                hbookerService = new HbookerService();
            return hbookerService;
    }
}