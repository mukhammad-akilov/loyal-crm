import {PaletteMode} from "@mui/material";
import {UserPermissions} from "../interfaces/user.interface";
import {AccessStatus} from "../components/CanAccess/CanAccess";

export const fullDay = (day: number): string => {
    return (`0${day}`).slice(-2);
};

export const fullMonth = (month: string): string => {
    return (`0${month}`).slice(-2);
};

export const months : { [key: string]: string; } = {
    "1": "Январь",
    "2": "Февраль",
    "3": "Март",
    "4": "Апрель",
    "5": "Май",
    "6": "Июнь",
    "7": "Июль",
    "8": "Август",
    "9": "Сентябрь",
    "10": "Октябрь",
    "11": "Ноябрь",
    "12": "Декабрь",
};

export const logoutCase: string[] = [
    "token lifetime is expired",
    "token is expired",
    "your token is not valid",
    "ресурс доступен внутри корпоративной сети",
    "необходимо авторизоваться",
];

export const requestFileCase: string[] = [
    "image/png",
]

export const isWebLink = (link: string): boolean => {
    const webLinkExpression = /^((https?|ftp|file):\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/gi;
    const regex = new RegExp(webLinkExpression);
    return link.match(regex) ? true : false;
};

export const isValidHttpUrl = (link: string): boolean => {
    let url: URL;
    try {
        url = new URL(link);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
};

export const removeFilesPrefix = (link: string): string => {
    return link?.replace("./files/", "");
};

export const userPrefersDarkMode = (): boolean => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export const handleSystemTheme = (): PaletteMode => {
    if(userPrefersDarkMode()) return "dark";
    return "light";
}

export const removeAuthDataFromLocalStorage = (): void => {
    localStorage.removeItem("loyalty-crm-user-auth");
}

export const handleThemeChangeToLocalStorage = (theme: PaletteMode): void => {
    localStorage.setItem("loyalty-crm-theme-mode", JSON.stringify({value: theme}))
}

export const normalizePhoneNumber = (phoneNumber: string): string => {
    phoneNumber = phoneNumber.replace(/-/g, "");
    phoneNumber = phoneNumber.replace(/ /g, "");
    phoneNumber = phoneNumber.replace("+", "");
    phoneNumber = phoneNumber.replace("(", "");
    phoneNumber = phoneNumber.replace(")", "");
    phoneNumber = phoneNumber.trim();
    return phoneNumber;
}

// export const canVisitPage = (permissions: UserPermissions[], pageRoute: string): Boolean => {
//     // Don't check home page for access
//     if (pageRoute === "/") return true
//
//     const result = permissions.find(permission => permission.page.code === pageRoute);
//     console.log("Result", result);
//     return result ? true : false; // or return !!result
// }

export const canVisitPage = (permissions: UserPermissions[], pageRoute: string): AccessStatus => {
    // Don't check home page for access
    if (pageRoute === "/") return AccessStatus.Active;

    const result = permissions.find(permission => permission.page.code === pageRoute);
    if(result) {
        switch (result.page.status.toLocaleLowerCase()) {
            case "active":
                return AccessStatus.Active;
            case "hidden":
                return AccessStatus.Hidden;
            case "disabled":
                return AccessStatus.Disabled;
            default:
                return AccessStatus.Hidden;
        }
    }

    return AccessStatus.Hidden;
}

export const canDoAction = (permissions: UserPermissions[], route: string, actionId: string): AccessStatus => {
    const pagePermissionResult = permissions.find(permission => permission.page.code === route);
    if(pagePermissionResult) {
       const actionPermissionResult = pagePermissionResult.page.actions.find(action => action.code.toString() === actionId);
        if(actionPermissionResult) {
            switch (actionPermissionResult.status.toLocaleLowerCase()) {
                case "active":
                    return AccessStatus.Active;
                case "hidden":
                    return AccessStatus.Hidden;
                case "disabled":
                    return AccessStatus.Disabled;
                default:
                    return AccessStatus.Hidden;
            }
        }
    }

    return AccessStatus.Hidden;
}