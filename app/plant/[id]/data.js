import { useMemo, useState } from 'react';
import { appColors, appFont } from '@/config/theme';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import Svg, { Path, Line, Text as SvgText } from 'react-native-svg';

const screenWidth = Dimensions.get('window').width;
const CHART_WIDTH = screenWidth - 48;
const CHART_HEIGHT = 230;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round2(value) {
  return Number(value.toFixed(2));
}

function generateDailySeries() {
  const production = [];
  const grid = [];
  const battery = [];
  const upsLoad = [];
  const load = [];

  for (let minute = 0; minute <= 24 * 60; minute += 5) {
    const hour = minute / 60;

    const loadVal = clamp(
      0.6 +
        0.12 * Math.sin((hour / 24) * Math.PI * 2) +
        0.08 * Math.sin((hour / 24) * Math.PI * 5),
      0.35,
      1.1
    );

    const upsVal = clamp(
      0.9 +
        0.18 * Math.sin((hour / 24) * Math.PI * 2 + 0.8) +
        0.1 * Math.cos((hour / 24) * Math.PI * 4),
      0.55,
      1.4
    );

    let solar = 0;
    if (hour >= 6 && hour <= 18) {
      const normalized = (hour - 6) / 12;
      solar =
        2.4 * Math.sin(normalized * Math.PI) +
        0.2 * Math.sin(normalized * Math.PI * 5);
      solar = Math.max(0, solar);
    }

    let batt = 0;
    if (hour >= 8 && hour <= 16) {
      batt = 0.7 * Math.sin(((hour - 8) / 8) * Math.PI);
    } else if (hour > 18 || hour < 6) {
      const n = hour > 18 ? hour - 18 : hour + 6;
      batt = -0.6 * Math.sin((n / 12) * Math.PI);
    } else {
      batt = -0.08;
    }

    const prodVal = clamp(solar, 0, 2.7);
    const battVal = clamp(batt, -0.8, 0.9);
    const gridVal = clamp(loadVal + upsVal - prodVal - battVal, -1.2, 2.2);

    production.push(round2(prodVal));
    grid.push(round2(gridVal));
    battery.push(round2(battVal));
    upsLoad.push(round2(upsVal));
    load.push(round2(loadVal));
  }

  return { production, grid, battery, upsLoad, load };
}

function buildLinePath(data, minY, maxY, width, height, pad) {
  const innerWidth = width - pad.left - pad.right;
  const innerHeight = height - pad.top - pad.bottom;

  return data
    .map((value, index) => {
      const x = pad.left + (index / (data.length - 1)) * innerWidth;
      const y =
        pad.top + ((maxY - value) / (maxY - minY || 1)) * innerHeight;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

function buildAreaPath(data, minY, maxY, width, height, pad) {
  const innerWidth = width - pad.left - pad.right;
  const innerHeight = height - pad.top - pad.bottom;
  const baseY = pad.top + ((maxY - 0) / (maxY - minY || 1)) * innerHeight;

  const points = data.map((value, index) => {
    const x = pad.left + (index / (data.length - 1)) * innerWidth;
    const y =
      pad.top + ((maxY - value) / (maxY - minY || 1)) * innerHeight;
    return { x, y };
  });

  const first = points[0];
  const last = points[points.length - 1];

  return [
    `M ${first.x} ${baseY}`,
    ...points.map((p, i) => `${i === 0 ? 'L' : 'L'} ${p.x} ${p.y}`),
    `L ${last.x} ${baseY}`,
    'Z',
  ].join(' ');
}

function DailyChart({ series }) {
  const pad = { top: 12, right: 10, bottom: 28, left: 38 };
  const datasets = [
    { key: 'production', label: 'Production', color: '#22C55E', data: series.production },
    { key: 'grid', label: 'Grid', color: '#F59E0B', data: series.grid },
    { key: 'battery', label: 'Battery', color: '#3B82F6', data: series.battery },
    { key: 'upsLoad', label: 'Ups-Load', color: '#8B5CF6', data: series.upsLoad },
    { key: 'load', label: 'Load', color: '#EF4444', data: series.load },
  ];

  const allValues = datasets.flatMap((d) => d.data);
  const minY = Math.min(-1.5, Math.floor(Math.min(...allValues) - 0.2));
  const maxY = Math.max(3, Math.ceil(Math.max(...allValues) + 0.2));

  const yTicks = 5;
  const xTickHours = [0, 4, 8, 12, 16, 20, 24];
  const innerWidth = CHART_WIDTH - pad.left - pad.right;
  const innerHeight = CHART_HEIGHT - pad.top - pad.bottom;

  return (
    <View style={styles.chartSection}>
      <Text style={styles.chartTitle}>Grafik Harian</Text>

      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const value = minY + ((maxY - minY) / yTicks) * i;
          const y = pad.top + ((maxY - value) / (maxY - minY)) * innerHeight;

          return (
            <View key={`grid-${i}`}>
              <Line
                x1={pad.left}
                y1={y}
                x2={CHART_WIDTH - pad.right}
                y2={y}
                stroke="rgba(255,255,255,0.24)"
                strokeWidth="1"
              />
              <SvgText
                x={pad.left - 8}
                y={y + 4}
                fontSize="10"
                fill="rgba(248,250,252,0.58)"
                textAnchor="end"
              >
                {value.toFixed(1)}
              </SvgText>
            </View>
          );
        })}

        {xTickHours.map((hour) => {
          const ratio = hour / 24;
          const x = pad.left + ratio * innerWidth;

          return (
            <View key={`x-${hour}`}>
              <Line
                x1={x}
                y1={pad.top}
                x2={x}
                y2={CHART_HEIGHT - pad.bottom}
                stroke="rgba(255,255,255,0.16)"
                strokeWidth="1"
              />
              <SvgText
                x={x}
                y={CHART_HEIGHT - 8}
                fontSize="10"
                fill="rgba(248,250,252,0.58)"
                textAnchor="middle"
              >
                {String(hour).padStart(2, '0')}:00
              </SvgText>
            </View>
          );
        })}

        {datasets.map((item) => (
          <Path
            key={`${item.key}-area`}
            d={buildAreaPath(item.data, minY, maxY, CHART_WIDTH, CHART_HEIGHT, pad)}
            fill={item.color}
            opacity={0.08}
          />
        ))}

        {datasets.map((item) => (
          <Path
            key={`${item.key}-line`}
            d={buildLinePath(item.data, minY, maxY, CHART_WIDTH, CHART_HEIGHT, pad)}
            stroke={item.color}
            strokeWidth="2"
            fill="none"
          />
        ))}

        <SvgText
          x={12}
          y={16}
          fontSize="11"
          fill="rgba(248,250,252,0.58)"
          textAnchor="start"
        >
          kW
        </SvgText>
      </Svg>

      <View style={styles.legendWrap}>
        {datasets.map((item) => (
          <View key={item.key} style={styles.legendItem}>
            <CircleLegend color={item.color} />
            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function CircleLegend({ color }) {
  return <View style={[styles.legendDot, { backgroundColor: color }]} />;
}

export default function DataScreen() {
  const [activeTab, setActiveTab] = useState('day');
  const series = useMemo(() => generateDailySeries(), []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.tabCard}>
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'day' && styles.tabButtonActive]}
            onPress={() => setActiveTab('day')}
          >
            <Text style={[styles.tabText, activeTab === 'day' && styles.tabTextActive]}>
              Day
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setActiveTab('month')}
          >
            <Text style={styles.tabText}>Month</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setActiveTab('year')}
          >
            <Text style={styles.tabText}>Year</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setActiveTab('lifetime')}
          >
            <Text style={styles.tabText}>Lifetime</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dateRow}>
          <TouchableOpacity style={styles.arrowBtn}>
            <Text style={styles.arrowText}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.dateText}>2026-03-30</Text>

          <TouchableOpacity style={styles.arrowBtn}>
            <Text style={styles.arrowText}>›</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'day' && <DailyChart series={series} />}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.screen,
  },
  content: {
    padding: 16,
    paddingTop: 10,
    paddingBottom: 24,
  },
  tabCard: {
    backgroundColor: appColors.bubble,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: appColors.bubbleBorder,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: appColors.input,
    borderRadius: 16,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  tabButtonActive: {
    backgroundColor: appColors.accent,
  },
  tabText: {
    fontSize: 14,
    color: appColors.textMuted,
    fontWeight: '500',
    fontFamily: appFont,
  },
  tabTextActive: {
    color: appColors.text,
    fontWeight: '700',
  },
  dateRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrowBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 26,
    color: appColors.textMuted,
    lineHeight: 26,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: appColors.text,
    fontFamily: appFont,
  },
  chartSection: {
    marginTop: 14,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: appColors.text,
    fontFamily: appFont,
    marginBottom: 8,
  },
  legendWrap: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
    marginBottom: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: appColors.textMuted,
    fontFamily: appFont,
  },
});
