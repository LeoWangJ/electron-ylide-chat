import { dialog } from "electron";
import { autoUpdater } from "electron-updater";
export class Updater {
  static check() {
    autoUpdater.checkForUpdates();
    autoUpdater.on("update-downloaded", async () => {
      await dialog.showMessageBox({
        message: "Available upgrade",
      });
      autoUpdater.quitAndInstall();
    });
  }
}
