import { ExtContentMsg, Actions } from '../types/enums'
import {
  cropImage,
  manageRectangle,
  getCursorCordinates,
  writeTextOnClipboard
} from '../utils/utility'

// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener(
  (message: ExtContentMsg, _, sendResponse) => {
    // Handle starting the partial screenshot
    if (message.action === Actions.START_SCREENSHOT) {
      // change the cursor
      document.documentElement.style.cursor = 'crosshair'

      // get the starting cordinates
      getCursorCordinates().then(startRes => {
        // Listen for the mouse move
        const handleMouseMoveWrapper = (event: MouseEvent) =>
          manageRectangle(
            Actions.SCREENSHOT_IN_PROGRESS,
            event,
            startRes.x,
            startRes.y
          )
        document.addEventListener('mousemove', handleMouseMoveWrapper)

        // get the ending cordinates
        getCursorCordinates().then(endRes => {
          // Remove the event listener and the div
          manageRectangle(Actions.SCREENSHOT_DONE)
          document.removeEventListener('mousemove', handleMouseMoveWrapper)

          // reset the cursor
          document.documentElement.style.cursor = 'default'

          // Send the message to the background script
          const message: ExtContentMsg = {
            action: Actions.SCREENSHOT_DONE,
            data: {
              startX: startRes.x,
              startY: startRes.y,
              endX: endRes.x,
              endY: endRes.y
            }
          }

          sendResponse(message)
        })
      })
    }

    // Handle the cropping of the screenshot
    else if (message.action === Actions.CROP_SCREENSHOT) {
      // Check given data
      if (
        !message.data.imgSource ||
        !message.data.startX ||
        !message.data.startY ||
        !message.data.endX ||
        !message.data.endY
      ) {
        console.error('Invalid image source')
        return false
      }

      // get the url for the cropped image
      cropImage(
        message.data.imgSource,
        message.data.startX,
        message.data.startY,
        message.data.endX,
        message.data.endY
      ).then(croppedImg => {
        sendResponse(croppedImg)

        // change the mouse to loading
        document.documentElement.style.cursor = 'wait'
      })
    } else if (message.action === Actions.COPY_TEXT) {
      if (!message.data.text) {
        console.error('Invalid image source')
        return false
      }

      // Copy the text to the clipboard
      writeTextOnClipboard(message.data.text)

      // reset the cursor
      document.documentElement.style.cursor = 'default'

      sendResponse(true)
    }

    return true
  }
)
