/**
 * @module Utility
 * @description This module contains helper functions.
 */
import {
  ExtContentMsg,
  Actions,
  ClientPosition,
  ElementId
} from '../types/enums'

/**
 * Sends a message from the extension to the content script.
 *
 * @param {ExtContentMsg} msg - The message to send, containing an action and optional data.
 * @param {boolean} [onlyActiveTab=true] - Whether to send the message only to the active tab.
 * @param {boolean} [onlyCurrentWindow=true] - Whether to send the message only to the current window.
 * @returns {Promise<any>} A promise that resolves with the response from the content script or rejects with an error.
 *
 * @throws {Error} If no active tab is found.
 */
async function sendMsgToContent (
  msg: ExtContentMsg,
  onlyActiveTab: boolean = true,
  onlyCurrentWindow: boolean = true
): Promise<any> {
  return new Promise(async (resolve, reject) => {
    // Query the active tab and in current window
    const tabs = await chrome.tabs.query({
      active: onlyActiveTab,
      currentWindow: onlyCurrentWindow
    })

    // Check if the active tab is found
    if (!tabs.length || !tabs[0].id) {
      reject(new Error('No active tab found!'))
      return
    }

    // Send the message to the content script
    const contentScriptRes = await chrome.tabs.sendMessage(tabs[0].id, {
      action: msg.action,
      data: { ...msg.data }
    })

    // Check for message send error
    if (chrome.runtime.lastError) {
      console.error('Message send error:', chrome.runtime.lastError)
      reject(chrome.runtime.lastError)
      return
    }

    // Resolve the promise with the content script response
    resolve(contentScriptRes)
  })
}

/**
 * Retrieves the cursor coordinates when the mouse is clicked.
 *
 * @returns {Promise<ClientPosition>} A promise that resolves with the cursor's client position (x and y coordinates).
 *
 * @example
 * getCursorCordinates().then((position) => {
 *   console.log(`Cursor Position - X: ${position.x}, Y: ${position.y}`);
 * });
 */
async function getCursorCordinates (): Promise<ClientPosition> {
  return new Promise(resolve => {
    // Listen for the mouse click
    const handleMouseDown = (event: MouseEvent) => {
      // Remove event listener after first click
      document.removeEventListener('mousedown', handleMouseDown)

      // construct the message
      let responseMessgae: ClientPosition = {
        x: event.clientX,
        y: event.clientY
      }

      // resolve the promise
      resolve(responseMessgae)
    }

    // remove the event listener
    document.addEventListener('mousedown', handleMouseDown)
  })
}

/**
 * Manages the rectangle element on the screen during the screenshot process.
 *
 * @param {Actions} action - The action to perform, which determines the state of the screenshot process.
 * @param {MouseEvent} [event] - The mouse event containing the current cursor position.
 * @param {number} [startX] - The starting X coordinate of the rectangle.
 * @param {number} [startY] - The starting Y coordinate of the rectangle.
 *
 * @description
 * - When the action is `Actions.SCREENSHOT_IN_PROGRESS`, it creates or updates a rectangle element on the screen
 *   based on the current cursor position and the starting coordinates.
 * - When the action is `Actions.SCREENSHOT_DONE`, it removes the rectangle element from the screen.
 *
 * @example
 * // To start drawing the rectangle
 * manageRectangle(Actions.SCREENSHOT_IN_PROGRESS, mouseEvent, startX, startY);
 *
 * @example
 * // To remove the rectangle after the screenshot is done
 * manageRectangle(Actions.SCREENSHOT_DONE);
 */
function manageRectangle (
  action: Actions,
  event?: MouseEvent,
  startX?: number,
  startY?: number
): void {
  // Get the div element
  const divElem = document.getElementById(ElementId.RECTANGLE)

  // When the screenshot is in progress
  if (action === Actions.SCREENSHOT_IN_PROGRESS && event && startX && startY) {
    // If the div element is not present, create it
    if (!divElem) {
      const rectangle = document.createElement('div')
      rectangle.id = ElementId.RECTANGLE
      rectangle.style.position = 'fixed'
      rectangle.style.border = '2px dashed black'
      rectangle.style.borderRadius = '0'
      rectangle.style.left = `${startX}px`
      rectangle.style.top = `${startY}px`
      rectangle.style.width = `${event.clientX - startX}px`
      rectangle.style.height = `${event.clientY - startY}px`
      rectangle.style.margin = '0'
      rectangle.style.padding = '0'
      rectangle.style.backgroundColor = 'rgba(0, 0, 0, 0.25)'

      // Prepend the rectangle to the body
      document.body.prepend(rectangle)
    } else {
      // Update the rectangle
      divElem.style.width = `${event.clientX - startX}px`
      divElem.style.height = `${event.clientY - startY}px`
    }
  } else if (action === Actions.SCREENSHOT_DONE) {
    // Remove the rectangle
    if (divElem) {
      divElem.remove()
    }
  }
}


/**
 * Crops a portion of an image based on the specified coordinates, and scale it with devicePixelRatio.
 *
 * @param {string} image - The base64 encoded image to be cropped.
 * @param {number} startX - The starting X coordinate of the crop area.
 * @param {number} startY - The starting Y coordinate of the crop area.
 * @param {number} endX - The ending X coordinate of the crop area.
 * @param {number} endY - The ending Y coordinate of the crop area.
 * @returns {Promise<string>} A promise that resolves with the base64 encoded cropped image or rejects with an error.
 *
 * @throws {Error} If the image fails to load.
 *
 * @example
 * const base64Image = 'data:image/png;base64,...';
 * cropImage(base64Image, 10, 10, 100, 100).then((croppedImage) => {
 *   console.log('Cropped Image:', croppedImage);
 * }).catch((error) => {
 *   console.error('Error cropping image:', error);
 * });
 */
async function cropImage (
  image: string,
  startX: number,
  startY: number,
  endX: number,
  endY: number
): Promise<string> {
  // Convert the base64 encoded image into a img tag
  const img = new Image()
  img.src = image

  // Create a canvas element
  const canvasElem = document.createElement('canvas')
  canvasElem.style.display = 'none'
  document.body.append(canvasElem)

  return new Promise((resolve, reject) => {
    img.onload = () => {

      // get the device to pixel ration
      const dpr = window.devicePixelRatio || 1;
      
      // calculate the width and height of the image
      const width = (endX - startX) * dpr
      const height = (endY - startY) * dpr

      // multiply the start coordinates to scale the image properly
      startX *= dpr
      startY *= dpr

      // change the canvas properties
      canvasElem.id = ElementId.CANVAS
      canvasElem.width = width
      canvasElem.height = height

      // Get the canvas context
      const canvasContext = canvasElem.getContext('2d')

      // draw the image
      canvasContext?.drawImage(
        img,
        startX,
        startY,
        width,
        height,
        0,
        0,
        width,
        height
      )

      // convert the cropped image to url
      const croppedImg = canvasElem.toDataURL('image/png')

      // remove the canvas element
      canvasElem.remove()

      // resolve the promise with the cropped image
      resolve(croppedImg)
    }

    // reject the promise if the image is not loaded
    img.onerror = () => {
      reject(new Error('Image not loaded'))
    }
  })
}

function writeTextOnClipboard (text: string) {

  // TODO: Filter text like convert /n, /t and more to actual text
  // Copy the text to the clipboard
  navigator.clipboard.writeText(text)
}
export { sendMsgToContent, getCursorCordinates, manageRectangle, cropImage, writeTextOnClipboard }
