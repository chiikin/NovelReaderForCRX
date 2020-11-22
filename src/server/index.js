
import HbookerService from "./HbookerService"

let hbookerService;

export function getService(webApp) {
    switch (webApp) {
        case "hbooker":
            if (!hbookerService)
                hbookerService = new HbookerService();
            return hbookerService;
    }
}