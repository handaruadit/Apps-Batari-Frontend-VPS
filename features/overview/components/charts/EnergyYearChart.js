//========== IMPORTS ==========
import EnergyBarChart from "./EnergyBarChart";

//========== COMPONENT ==========
export default function EnergyYearChart(props) {
  return <EnergyBarChart {...props} segment="year" />;
}
