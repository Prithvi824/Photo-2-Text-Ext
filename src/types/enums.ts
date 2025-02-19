enum ElementId {
    RECTANGLE = "photo2imageDiv",
    CANVAS = "photo2imageCanvas",
}

enum Actions {
    START_SCREENSHOT = "startScreenshot",
    SCREENSHOT_DONE = "screenshotDone",
    SCREENSHOT_IN_PROGRESS = "screensShotInProgress",
    CROP_SCREENSHOT = "cropScreenshot",
    COPY_TEXT = "copyText"
}

interface MsgData {
    startX?: number,
    startY?: number
    endX?: number
    endY?: number
    imgSource?: string
    text?: string
}

interface ExtContentMsg {
    action: Actions,
    data: MsgData
}

interface ClientPosition {
    x: number,
    y: number
}


export { ElementId, Actions }
export type { MsgData, ExtContentMsg, ClientPosition }