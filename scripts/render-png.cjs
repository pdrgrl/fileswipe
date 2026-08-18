const { app, BrowserWindow } = require('electron')
const fs = require('fs')
const path = require('path')

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 512,
    height: 512,
    show: false,
    frame: false,
    transparent: true,
    webPreferences: {
      offscreen: true
    }
  })

  const svgPath = path.join(__dirname, '../build/icon.svg')
  const svgData = fs.readFileSync(svgPath, 'utf8')
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;overflow:hidden;"><img src="data:image/svg+xml;utf8,${encodeURIComponent(svgData)}" width="512" height="512" /></body></html>`

  await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)
  
  // Wait a moment for layout
  await new Promise(r => setTimeout(r, 600))

  const image = await win.webContents.capturePage({ x: 0, y: 0, width: 512, height: 512 })
  const pngBuffer = image.toPNG()

  fs.writeFileSync(path.join(__dirname, '../build/icon.png'), pngBuffer)
  fs.writeFileSync(path.join(__dirname, '../public/icon.png'), pngBuffer)
  console.log('Successfully generated 512x512 build/icon.png and public/icon.png!')

  app.quit()
})
