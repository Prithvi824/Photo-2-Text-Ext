import { sendMsgToContent } from '../utils/utility'
import { ExtContentMsg, Actions } from '../types/enums'

// Send a message to the content script to trigger DOM manipulation
chrome.action.onClicked.addListener(async () => {
  // Send a message to the content script to start the screenshot process
  const screenShotMsg: ExtContentMsg = {
    action: Actions.START_SCREENSHOT,
    data: {}
  }

  // Capture the full page screenshot
  const screenShotMsgRes = await sendMsgToContent(screenShotMsg)
  const screenShot = await chrome.tabs.captureVisibleTab()

  // Send a message to the content script to crop the screenshot
  const cropImgMsg: ExtContentMsg = {
    action: Actions.CROP_SCREENSHOT,
    data: {
      imgSource: screenShot,
      startX: screenShotMsgRes.data.startX,
      startY: screenShotMsgRes.data.startY,
      endX: screenShotMsgRes.data.endX,
      endY: screenShotMsgRes.data.endY
    }
  }

  // get the cropped image
  const cropImgMsgRes = await sendMsgToContent(cropImgMsg)
  console.log('Cropped Image content: ', cropImgMsgRes)

  // Send the base64 image to an endpoint as a POST request
  const response = await fetch('http://localhost:8000/convert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      img: cropImgMsgRes
    })
  })

  const responseData = await response.json()
  console.log('Response from server: ', responseData)

  // show the text on the screen
  const showTextMsg: ExtContentMsg = {
    action: Actions.COPY_TEXT,
    data: {
      text: responseData.text
    }
  }
  const showTextMsgRes = await sendMsgToContent(showTextMsg)
  console.log('Copied status: ', showTextMsgRes)

  return true
})
