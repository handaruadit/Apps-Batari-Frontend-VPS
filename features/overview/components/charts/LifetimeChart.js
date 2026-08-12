//========== IMPORTS ==========
import EnergyBarChart from "./EnergyBarChart";

//========== COMPONENT ==========
export default function LifetimeChart(props) {
  return <EnergyBarChart {...props} segment="lifetime" />;
}
