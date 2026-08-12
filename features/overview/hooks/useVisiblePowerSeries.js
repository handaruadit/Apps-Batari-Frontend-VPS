//===== (Imports) ======
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  DAY_SERIES_CONFIG,
  OVERVIEW_CHART_SWITCH_STORAGE_KEY,
} from "../constants/overviewConstants";
import { getDefaultVisiblePowerSeries } from "../utils/powerFlow";

//===== (useVisiblePowerSeries) ======
export function useVisiblePowerSeries() {
  const [visiblePowerSeries, setVisiblePowerSeries] = useState(
    getDefaultVisiblePowerSeries,
  );

  //===== (loadChartSwitchSettings) ======
  useEffect(() => {
    let isMounted = true;

    //===== (loadVisiblePowerSeries) ======
    const loadVisiblePowerSeries = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(
          OVERVIEW_CHART_SWITCH_STORAGE_KEY,
        );

        if (!storedValue) {
          return;
        }

        const parsedValue = JSON.parse(storedValue);

        if (!parsedValue || typeof parsedValue !== "object") {
          return;
        }

        const defaults = getDefaultVisiblePowerSeries();
        const nextVisibleSeries = DAY_SERIES_CONFIG.reduce((items, item) => {
          items[item.key] =
            typeof parsedValue[item.key] === "boolean"
              ? parsedValue[item.key]
              : defaults[item.key];
          return items;
        }, {});

        if (isMounted) {
          setVisiblePowerSeries(nextVisibleSeries);
        }
      } catch (error) {
        console.warn("Failed to load overview chart switch settings:", error);
      }
    };

    loadVisiblePowerSeries();

    return () => {
      isMounted = false;
    };
  }, []);

  //===== (togglePowerSeries) ======
  const togglePowerSeries = (key) => {
    setVisiblePowerSeries((current) => {
      const nextVisibleSeries = {
        ...getDefaultVisiblePowerSeries(),
        ...current,
        [key]: !current[key],
      };

      AsyncStorage.setItem(
        OVERVIEW_CHART_SWITCH_STORAGE_KEY,
        JSON.stringify(nextVisibleSeries),
      ).catch((error) => {
        console.warn("Failed to save overview chart switch settings:", error);
      });

      return nextVisibleSeries;
    });
  };

  return { togglePowerSeries, visiblePowerSeries };
}
