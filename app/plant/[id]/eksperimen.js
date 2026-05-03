import { useEffect, useState } from 'react';
import { appColors, appFont } from '@/config/theme';
import { ScrollView, StyleSheet, Text, View, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line, Text as SvgText, Rect } from 'react-native-svg';
import {
  getEksperimenParams,
  getEksperimenChart,
} from '@/services/eksperimenService';

const screenWidth = Dimensions.get('window').width;
const CHART_WIDTH = screenWidth - 48;
const CHART_HEIGHT = 220;

function ParameterCard({ title, value = '-', unit = 'kW' }) {
  return (
    <View style={styles.paramCard}>
      <Text style={styles.paramTitle}>{title}</Text>
      <Text style={styles.paramValue}>
        {value} <Text style={styles.paramUnit}>{unit}</Text>
      </Text>
    </View>
  );
}

function EmptyChart({ chartData }) {
  const pad = { top: 12, right: 10, bottom: 28, left: 38 };
  const yTicks = [-2, 0, 2, 4, 6];
  const xTicks = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'];

  const innerWidth = CHART_WIDTH - pad.left - pad.right;
  const innerHeight = CHART_HEIGHT - pad.top - pad.bottom;

  return (
    <View style={styles.chartWrap}>
      <Text style={styles.chartTitle}>Grafik Eksperimen</Text>

      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        {yTicks.map((tick, i) => {
          const y = pad.top + (i / (yTicks.length - 1)) * innerHeight;

          return (
            <View key={`y-${tick}`}>
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
                {yTicks[yTicks.length - 1 - i]}
              </SvgText>
            </View>
          );
        })}

        {xTicks.map((tick, i) => {
          const x = pad.left + (i / (xTicks.length - 1)) * innerWidth;

          return (
            <View key={`x-${tick}`}>
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
                {tick}
              </SvgText>
            </View>
          );
        })}

        <Rect
          x={pad.left}
          y={pad.top}
          width={innerWidth}
          height={innerHeight}
          rx={8}
          fill="transparent"
          stroke="rgba(255,255,255,0.28)"
          strokeDasharray="4 4"
        />

        <SvgText
          x={12}
          y={16}
          fontSize="11"
          fill="rgba(248,250,252,0.58)"
          textAnchor="start"
        >
          kW
        </SvgText>

        <SvgText
          x={CHART_WIDTH / 2}
          y={CHART_HEIGHT - 2}
          fontSize="11"
          fill="rgba(248,250,252,0.58)"
          textAnchor="middle"
        >
          Jam
        </SvgText>
      </Svg>

      <Text style={styles.chartNote}>
        {chartData.length > 0
          ? `Data grafik diterima: ${chartData.length} titik`
          : 'Area grafik ini disiapkan untuk data API dari server.'}
      </Text>
    </View>
  );
}

export default function EksperimenScreen() {
  const [params, setParams] = useState({
    production: '-',
    grid: '-',
    battery: '-',
    load: '-',
    ups: '-',
  });

  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const paramRes = await getEksperimenParams();
        const chartRes = await getEksperimenChart();

        setParams({
          production: paramRes?.production ?? '-',
          grid: paramRes?.grid ?? '-',
          battery: paramRes?.battery ?? '-',
          load: paramRes?.load ?? '-',
          ups: paramRes?.ups ?? '-',
        });

        setChartData(chartRes ?? []);
      } catch (error) {
        console.log('Gagal ambil data eksperimen:', error.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>Eksperimen</Text>
        <Text style={styles.pageSubtitle}>
          Placeholder parameter dan grafik untuk integrasi API.
        </Text>

        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : (
          <>
            <View style={styles.paramGrid}>
              <ParameterCard title="Production" value={params.production} />
              <ParameterCard title="Grid" value={params.grid} />
              <ParameterCard title="Battery" value={params.battery} />
              <ParameterCard title="Load" value={params.load} />
              <ParameterCard title="UPS" value={params.ups} />
            </View>

            <EmptyChart chartData={chartData} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: appColors.screen,
  },
  container: {
    flex: 1,
    backgroundColor: appColors.screen,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: appColors.text,
    fontFamily: appFont,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: appColors.textMuted,
    fontFamily: appFont,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 15,
    color: appColors.textMuted,
    fontFamily: appFont,
  },
  paramGrid: {
    marginBottom: 16,
  },
  paramCard: {
    backgroundColor: appColors.bubble,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: appColors.bubbleBorder,
  },
  paramTitle: {
    fontSize: 14,
    color: appColors.textMuted,
    fontFamily: appFont,
    marginBottom: 6,
  },
  paramValue: {
    fontSize: 24,
    fontWeight: '700',
    color: appColors.text,
    fontFamily: appFont,
  },
  paramUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: appColors.textMuted,
  },
  chartWrap: {
    backgroundColor: appColors.bubble,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: appColors.bubbleBorder,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: appColors.text,
    fontFamily: appFont,
    marginBottom: 10,
  },
  chartNote: {
    marginTop: 10,
    fontSize: 12,
    color: appColors.textMuted,
    fontFamily: appFont,
  },
});
