//========== IMPORTS ==========
import EnergyBarChart from "./EnergyBarChart";

//========== COMPONENT ==========
export default function EnergyMonthChart(props) {
  return <EnergyBarChart {...props} segment="month" />;
}
