//===== (Imports) ======
import { getPlantConnectionStatus } from "@/components/device-card/helpers";
import { useAppSettings } from "@/context/AppSettingsContext";
import {
  getNotificationSettings,
  requestNotificationPermissions,
  triggerLocalNotification,
} from "@/services/notificationService";
import { useEffect, useRef } from "react";

//===== (usePlantStatusWatcher) ======
export function usePlantStatusWatcher(plantList = []) {
  const { language } = useAppSettings();
  const isEn = language === "en";
  const previousStatusMap = useRef(new Map());
  const previousBatteryAlertMap = useRef(new Map());
  const isInitialRun = useRef(true);

  // Request notification permission once on mount
  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  useEffect(() => {
    if (!Array.isArray(plantList) || plantList.length === 0) {
      return;
    }

    const checkStatusTransitions = async () => {
      const settings = await getNotificationSettings();

      plantList.forEach((plant) => {
        if (!plant || !plant.id) return;

        const plantId = String(plant.id);
        const plantName = plant.name || `Plant #${plantId}`;
        const currentStatus = getPlantConnectionStatus(plant);
        const currentIsOnline = currentStatus.isOnline;

        // Skip alerting on initial mount to avoid firing alerts for existing state
        if (isInitialRun.current) {
          previousStatusMap.current.set(plantId, currentIsOnline);
          return;
        }

        const prevIsOnline = previousStatusMap.current.get(plantId);

        // Transition: Online -> Offline
        if (prevIsOnline === true && currentIsOnline === false) {
          if (settings.stationOffline) {
            triggerLocalNotification({
              title: `Station Offline: ${plantName}`,
              body: isEn
                ? `Station '${plantName}' has been disconnected from the network (Offline).`
                : `Station '${plantName}' telah terputus dari jaringan (Offline).`,
              type: "danger",
            });
          }
        }

        // Transition: Offline -> Online
        if (prevIsOnline === false && currentIsOnline === true) {
          if (settings.stationOnline) {
            triggerLocalNotification({
              title: `Station Online: ${plantName}`,
              body: isEn
                ? `Station '${plantName}' is back online and actively generating power.`
                : `Station '${plantName}' kembali terhubung dan aktif menghasilkan daya.`,
              type: "success",
            });
          }
        }

        // Battery Alarm: Monitor SoC level from station
        const soc = plant.soc ?? plant.battery_soc ?? plant.batteryPercent ?? plant.battery_percent;
        if (settings.batteryAlarm && soc != null && soc > 0 && soc <= 20) {
          const alreadyAlerted = previousBatteryAlertMap.current.get(plantId);
          if (!alreadyAlerted) {
            previousBatteryAlertMap.current.set(plantId, true);
            triggerLocalNotification({
              title: isEn ? `Battery Alarm: ${plantName}` : `Alarm Baterai: ${plantName}`,
              body: isEn
                ? `Battery capacity at station '${plantName}' is at low level (${Math.round(soc)}%).`
                : `Kapasitas baterai di station '${plantName}' berada pada level rendah (${Math.round(soc)}%).`,
              type: "warning",
            });
          }
        } else if (soc != null && soc > 25) {
          previousBatteryAlertMap.current.set(plantId, false);
        }

        // Update state map
        previousStatusMap.current.set(plantId, currentIsOnline);
      });

      if (isInitialRun.current) {
        isInitialRun.current = false;
      }
    };

    checkStatusTransitions();
  }, [plantList, isEn]);
}
