import {
  buildAggregateChartData,
  findNearestDataPoint,
  normalizeDayPowerSeries,
} from "@/features/overview/utils/chartPresentation";
import { calculateYAxisRange } from "@/features/overview/utils/chartScale";
import { getResponsiveChartWidth } from "@/features/overview/utils/chartData";
import { normalizeChartSeries } from "@/features/overview/utils/powerData";
import { buildDailyCsv } from "@/features/overview/utils/csvExport";
import ChartLegend from "@/features/overview/components/charts/ChartLegend";
import {
  DAY_SERIES_CONFIG,
  ENERGY_SERIES_CONFIG,
} from "@/features/overview/constants/overviewConstants";
import { fireEvent, render } from "@testing-library/react-native";

describe("overview chart data correctness", () => {
  test("keeps zero, positive, negative, and high power values without clamping", () => {
    const series = normalizeChartSeries({
      production: [
        { value: 0, createdAt: "2026-08-12T00:00:00+07:00" },
        { value: 2.73, createdAt: "2026-08-12T08:00:00+07:00" },
        { value: 125, createdAt: "2026-08-12T12:00:00+07:00" },
      ],
      grid: [
        { value: -1.2, createdAt: "2026-08-12T08:00:00+07:00" },
        { value: 0.8, createdAt: "2026-08-12T09:00:00+07:00" },
      ],
      battery: [
        { value: -0.68, createdAt: "2026-08-12T08:00:00+07:00" },
        { value: 0.4, createdAt: "2026-08-12T09:00:00+07:00" },
      ],
      load: [{ value: 1.42, createdAt: "2026-08-12T08:00:00+07:00" }],
    });
    const normalized = normalizeDayPowerSeries(series);

    expect(normalized.production.map((point) => point.value)).toEqual([
      0,
      2.73,
      125,
    ]);
    expect(normalized.grid.map((point) => point.value)).toEqual([-1.2, 0.8]);
    expect(normalized.battery.map((point) => point.value)).toEqual([
      -0.68,
      0.4,
    ]);
  });

  test("drops records without a timestamp instead of inventing a position", () => {
    const normalized = normalizeDayPowerSeries({
      production: [{ value: 2.1 }],
      load: [{ value: 1.1, createdAt: "2026-08-12T08:00:00+07:00" }],
    });

    expect(normalized.production).toEqual([]);
    expect(normalized.load).toHaveLength(1);
  });

  test("keeps PV and PV Generate as separate historical series", () => {
    const timestamp = "2026-08-12T08:00:00+07:00";
    const series = normalizeChartSeries([
      { category: "pv", type: "chargePower", value: 2.1, createdAt: timestamp },
      {
        category: "production",
        type: "pvGenerate",
        value: 3.4,
        createdAt: timestamp,
      },
    ]);

    expect(series.production[0].value).toBe(2.1);
    expect(series.pvGenerate[0].value).toBe(3.4);
  });

  test("accepts only timestamped historical SoC values within 0-100", () => {
    const timestamp = "2026-08-12T08:00:00+07:00";
    const laterTimestamp = "2026-08-12T08:05:00+07:00";
    const series = normalizeChartSeries([
      { category: "battery", type: "soc", value: 76, createdAt: timestamp },
      {
        category: "battery",
        type: "soc",
        percentage: 64,
        createdAt: laterTimestamp,
      },
      { category: "battery", type: "soc", value: 120, createdAt: timestamp },
      { category: "battery", type: "soc", value: 55 },
    ]);
    const normalized = normalizeDayPowerSeries(series);

    expect(normalized.soc).toEqual([
      { timestamp: expect.any(Number), value: 76 },
      { timestamp: expect.any(Number), value: 64 },
    ]);
  });

  test("selects irregular timestamps only when a real point is close enough", () => {
    const points = [
      { timestamp: 1000, value: 1 },
      { timestamp: 9000, value: 2 },
    ];

    expect(findNearestDataPoint(points, 8500, 1000)).toEqual(points[1]);
    expect(findNearestDataPoint(points, 5000, 1000)).toBeNull();
  });

  test("auto scale includes negative values, zero, padding, and spikes", () => {
    const mixedRange = calculateYAxisRange([-0.68, 0, 2.73]);
    const spikeRange = calculateYAxisRange([125]);

    expect(mixedRange.min).toBeLessThanOrEqual(-0.68);
    expect(mixedRange.max).toBeGreaterThan(2.73);
    expect(mixedRange.ticks).toContain(0);
    expect(spikeRange.max).toBeGreaterThan(125);
  });

  test("all-zero data remains a valid dataset with a readable range", () => {
    expect(calculateYAxisRange([0, 0])).toEqual({
      min: 0,
      max: 1,
      ticks: [0, 0.2, 0.4, 0.6, 0.8, 1],
    });
  });

  test.each([320, 360, 390, 412, 430])(
    "keeps the chart inside a %ipx mobile viewport",
    (windowWidth) => {
      const chartWidth = getResponsiveChartWidth(windowWidth);

      expect(chartWidth).toBeGreaterThanOrEqual(240);
      expect(chartWidth).toBeLessThanOrEqual(windowWidth - 56);
    },
  );
});

describe("overview aggregate periods", () => {
  test("month keeps missing days distinct from zero-energy days", () => {
    const items = buildAggregateChartData({
      segment: "month",
      selectedYear: 2026,
      selectedMonth: 8,
      series: {
        production: [
          { value: 8.5, day: 1 },
          { value: 0, day: 3 },
        ],
        load: [{ value: 12.3, day: 1 }],
      },
    });

    expect(items).toHaveLength(31);
    expect(items[0]).toMatchObject({ production: 8.5, load: 12.3 });
    expect(items[1].production).toBeUndefined();
    expect(items[2].production).toBe(0);
  });

  test("month keeps all five parameters separate and preserves signed energy", () => {
    const series = normalizeChartSeries({
      unit: "kWh",
      items: [
        {
          day: 1,
          pv: 8.5,
          load: 7.2,
          grid: -1.1,
          battery: -2.4,
          pvGenerate: 9.3,
        },
      ],
    });
    const items = buildAggregateChartData({
      segment: "month",
      selectedYear: 2026,
      selectedMonth: 8,
      series,
    });

    expect(items[0]).toMatchObject({
      production: 8.5,
      load: 7.2,
      grid: -1.1,
      battery: -2.4,
      pvGenerate: 9.3,
    });
  });

  test("year maps partial monthly data without filling missing months", () => {
    const items = buildAggregateChartData({
      segment: "year",
      selectedYear: 2026,
      selectedMonth: 8,
      series: {
        production: [{ value: 120, month: 2 }],
        load: [{ value: 90, month: 2 }],
      },
    });

    expect(items).toHaveLength(12);
    expect(items[0].production).toBeUndefined();
    expect(items[1]).toMatchObject({ production: 120, load: 90 });
  });

  test("year accepts all 12 months", () => {
    const months = Array.from({ length: 12 }, (_, index) => ({
      value: index + 1,
      month: index + 1,
    }));
    const items = buildAggregateChartData({
      segment: "year",
      selectedYear: 2026,
      selectedMonth: 8,
      series: { production: months, load: months },
    });

    expect(items.every((item) => Number.isFinite(item.production))).toBe(true);
    expect(items[11].production).toBe(12);
  });

  test("lifetime maps only years actually present in the API series", () => {
    const items = buildAggregateChartData({
      segment: "lifetime",
      selectedYear: 2026,
      selectedMonth: 8,
      yearRange: [2024, 2025, 2026],
      series: {
        production: [
          { value: 900, year: 2024 },
          { value: 1100, year: 2026 },
        ],
        load: [{ value: 850, year: 2024 }],
      },
    });

    expect(items[0]).toMatchObject({ production: 900, load: 850 });
    expect(items[1].production).toBeUndefined();
    expect(items[2].production).toBe(1100);
  });

  test("single-year and empty lifetime input stay valid without dummy values", () => {
    const singleYear = buildAggregateChartData({
      segment: "lifetime",
      selectedYear: 2026,
      selectedMonth: 8,
      yearRange: [2026],
      series: { production: [{ value: 500, year: 2026 }] },
    });
    const empty = buildAggregateChartData({
      segment: "lifetime",
      selectedYear: 2026,
      selectedMonth: 8,
      yearRange: [2026],
      series: {},
    });

    expect(singleYear[0].production).toBe(500);
    expect(empty).toEqual([{ label: "2026" }]);
  });
});

describe("overview Day CSV", () => {
  test("exports PV Generate separately and preserves negative values", () => {
    const timestamp = "2026-08-12T08:00:00+07:00";
    const csv = buildDailyCsv({
      series: {
        production: [{ value: 2.1, createdAt: timestamp }],
        load: [{ value: 1.4, createdAt: timestamp }],
        grid: [{ value: -0.5, createdAt: timestamp }],
        battery: [{ value: -0.7, createdAt: timestamp }],
        pvGenerate: [{ value: 3.4, createdAt: timestamp }],
      },
    });

    expect(csv).toContain("Waktu,PV,Load,Grid,Battery,PV Generate");
    expect(csv).toContain("08:00,2.10,1.40,-0.50,-0.70,3.40");
  });
});

describe("overview chart legend", () => {
  test("keeps every core parameter controlled only by the user", () => {
    const onToggleSeries = jest.fn();
    const screen = render(
      <ChartLegend
        colors={{ bubbleBorder: "#CBD5E1", textMuted: "#64748B" }}
        config={ENERGY_SERIES_CONFIG}
        onToggleSeries={onToggleSeries}
        t={(key) =>
          key === "noDataAvailable" ? "No data available" : ""
        }
        visibleSeries={{ battery: true }}
      />,
    );

    expect(screen.getByText("PV")).toBeTruthy();
    expect(screen.getByText("Load")).toBeTruthy();
    expect(screen.getByText("Grid")).toBeTruthy();
    expect(screen.getByText("Battery")).toBeTruthy();
    expect(screen.getByText("PV Generate")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("PV"));
    expect(onToggleSeries).toHaveBeenCalledWith("production");

    fireEvent.press(screen.getByLabelText("Battery"));
    expect(onToggleSeries).toHaveBeenCalledWith("battery");
  });

  test("includes SoC in the Day legend", () => {
    const screen = render(
      <ChartLegend
        colors={{ bubbleBorder: "#CBD5E1", textMuted: "#64748B" }}
        config={DAY_SERIES_CONFIG}
        onToggleSeries={jest.fn()}
        t={() => ""}
        visibleSeries={{ soc: false }}
      />,
    );

    expect(screen.getByLabelText("SoC")).toBeTruthy();
  });
});
