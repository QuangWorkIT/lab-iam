import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import fetchRoles from '../../../services/fetchRoleByUsers';


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ROLE_COLOR_MAP = {
  ADMIN: "#00bf63",
  LAB_USER: "#fe535b",
  MANAGER: "#8c52ff",
  LAB_MANAGER: "#8c52ff",
  SERVICE_USER: "#5170ff",
  SERVICE: "#5170ff",
  PATIENT: "#ff9800",
  DEFAULT: "#e1e7ef",
  GUEST: "#e1e7ef",
};

export const options = {
  responsive: true,
  scales: {
    x: {
      type: 'category',
    },
    y: {
      beginAtZero: true,
    },
  },
  plugins: {
    legend: {
      display: false
    },
    title: {
      display: true,
      text: 'User Role Chart',
    },
  },
};

function UserRoleChart({ refreshTrigger }) {
  const [roleLabels, setRoleLabels] = useState([])
  const [roleData, setRoleData] = useState([])

  useEffect(() => {
    const fetchUserRoles = async () => {
      const data = await fetchRoles();
      setRoleLabels(Object.keys(data))
      setRoleData(Object.values(data))
    }

    fetchUserRoles()
  }, [refreshTrigger])

  const data = {
    labels: roleLabels,
    datasets: [{
      label: 'Role Data',
      data: roleData,
      backgroundColor: roleLabels.map((role, i) => ROLE_COLOR_MAP[role] || ROLE_COLOR_MAP.DEFAULT),
      borderColor: roleData.map((role, i) => ROLE_COLOR_MAP[role] || ROLE_COLOR_MAP.DEFAULT),
      borderWidth: 1,
      borderRadius: 7
    }]
  };
  return <Bar
    options={options}
    data={data}
    style={{
      background: "white",
      padding: "10px",
      borderRadius: "5px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)"
    }} />;
}

export default UserRoleChart
