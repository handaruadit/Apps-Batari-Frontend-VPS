import {
  formatBatteryParameterValue,
  getBatteryParameterRows,
} from "@/features/devices/utils/batteryParameters";

describe("batteryParameters", () => {
  const t = (key) => key;

  it("always provides power, voltage, current, and soc by default even if device has no data", () => {
    const rows = getBatteryParameterRows({}, t);
    const keys = rows.map((r) => r.key);

    expect(keys).toEqual(["power", "voltage", "current", "soc"]);
    expect(rows.find((r) => r.key === "power").value).toBe(0);
    expect(rows.find((r) => r.key === "voltage").value).toBe(0);
    expect(rows.find((r) => r.key === "current").value).toBe(0);
    expect(rows.find((r) => r.key === "soc").value).toBe(0);
  });

  it("populates mandatory parameters with actual values when available", () => {
    const device = {
      latestData: [
        { category: "baterai", type: "power", value: -1.5 },
        { category: "baterai", type: "voltage", value: 52.4 },
        { category: "baterai", type: "current", value: -10 },
        { category: "baterai", type: "soc", value: 85 },
      ],
    };

    const rows = getBatteryParameterRows(device, t);
    const keys = rows.map((r) => r.key);

    expect(keys).toEqual(["power", "voltage", "current", "soc"]);
    expect(rows.find((r) => r.key === "power").value).toBe(-1.5);
    expect(rows.find((r) => r.key === "voltage").value).toBe(52.4);
    expect(rows.find((r) => r.key === "current").value).toBe(-10);
    expect(rows.find((r) => r.key === "soc").value).toBe(85);
  });

  it("shows optional parameters (like cells, cycle, alarm) only when they have valid non-empty values", () => {
    const device = {
      latestData: [
        { category: "baterai", type: "power", value: -0.5 },
        { category: "baterai", type: "voltage", value: 51.2 },
        { category: "baterai", type: "current", value: -5 },
        { category: "baterai", type: "soc", value: 60 },
        { category: "data_bms", type: "cells_1", value: 3.28 },
        { category: "data_bms", type: "cells_2", value: 3.29 },
        { category: "data_bms", type: "cycle", value: 42 },
        { category: "data_bms", type: "cells_3", value: null },
        { category: "data_bms", type: "cells_4", value: "" },
      ],
    };

    const rows = getBatteryParameterRows(device, t);
    const keys = rows.map((r) => r.key);

    expect(keys).toEqual([
      "power",
      "voltage",
      "current",
      "soc",
      "cells_1",
      "cells_2",
      "cycle",
    ]);
    expect(keys).not.toContain("cells_3");
    expect(keys).not.toContain("cells_4");
    expect(keys).not.toContain("alarm");
  });

  it("formats units correctly for each parameter type", () => {
    expect(formatBatteryParameterValue(-1.25, "power")).toBe("-1.25 kW");
    expect(formatBatteryParameterValue(52.4, "voltage")).toBe("52.4 V");
    expect(formatBatteryParameterValue(3.285, "cells_1")).toBe("3.285 V");
    expect(formatBatteryParameterValue(-10.5, "current")).toBe("-10.5 A");
    expect(formatBatteryParameterValue(85, "soc")).toBe("85 %");
    expect(formatBatteryParameterValue(100, "cycle")).toBe("100");
  });
});
