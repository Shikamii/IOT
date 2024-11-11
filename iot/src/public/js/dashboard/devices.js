const options = {
  host: "192.168.0.105",
  port: 9001,
  username: "B21DCCN244",
  password: "123",
};

const client = mqtt.connect(options);

// Xử lý sự kiện kết nối
client.on("connect", () => {
  console.log("Connected to MQTT broker");
  // Subscribe to relevant topics to receive updates
  client.subscribe("home/devices/den");
  client.subscribe("home/devices/quat");
  client.subscribe("home/devices/dieuhoa");
  client.subscribe("home/devices/loa");
});

// Function to publish MQTT messages
function sendMQTTMessage(topic, message) {
  client.publish(topic, message, (err) => {
    if (err) {
      console.error("Publish error:", err);
    } else {
      console.log(`Message sent to ${topic}: ${message}`);
    }
  });
}

function saveStateToLocalStorage(device, state) {
  localStorage.setItem(device, state);
}

// Helper function to load the state from local storage
function loadStateFromLocalStorage(device) {
  return localStorage.getItem(device);
}

// Function to handle LED button clicks
function toggleLed(state) {
  sendMQTTMessage("home/devices/den", state === "on" ? "ON" : "OFF");
}

// Function to handle Fan button clicks
function toggleFan(state) {
  sendMQTTMessage("home/devices/quat", state === "on" ? "ON" : "OFF");
}

// Function to handle Air Conditioner button clicks
function toggleAC(state) {
  sendMQTTMessage("home/devices/dieuhoa", state === "on" ? "ON" : "OFF");
}

// Function to handle louder Speaker button clicks
function toggleLP(state) {
  sendMQTTMessage("home/devices/loa", state === "on" ? "ON" : "OFF");
}

// Update functions for the state restoration
function restoreDeviceState() {
  const ledState = loadStateFromLocalStorage("led");
  toggleLed(ledState === "on" ? "on" : "off");

  const fanState = loadStateFromLocalStorage("fan");
  toggleFan(fanState === "on" ? "on" : "off");

  const acState = loadStateFromLocalStorage("ac");
  toggleAC(acState === "on" ? "on" : "off");

  const lpState = loadStateFromLocalStorage("lp");
  toggleLP(lpState === "on" ? "on" : "off");
}

// Call the restore function when the page loads
window.onload = restoreDeviceState;

function updateColor(elementId, value, minValue, maxValue, baseHue) {
  const element = document.getElementById(elementId);

  if (value < minValue) {
    element.style.backgroundColor = `hsl(${baseHue}, 50%, 20%)`; // Màu tối hơn nhiều cho giá trị rất thấp
  } else if (value > maxValue) {
    element.style.backgroundColor = `hsl(${baseHue}, 100%, 50%)`; // Màu sáng hơn nhiều cho giá trị rất cao
  } else {
    const percentage = (value - minValue) / (maxValue - minValue);
    // Điều chỉnh độ sáng từ 30% (tối) đến 70% (sáng) cho dải màu rộng hơn
    const lightness = 20 + percentage * 50; // Sáng hơn khi giá trị cao hơn
    const saturation = 60 + percentage * 40; // Độ bão hòa tăng khi giá trị cao hơn

    element.style.backgroundColor = `hsl(${baseHue}, ${saturation}%, ${lightness}%)`;
  }
}

async function fetchDataAndUpdateUI() {
  try {
    const response = await fetch("/api");
    const data = await response.json();

    const latestData = data[data.length - 1];

    document.getElementById(
      "nhietdo"
    ).textContent = `${latestData.temperature}ºC`;
    document.getElementById("doam").textContent = `${latestData.humidity}%`;
    document.getElementById("anhsang").textContent = `${latestData.light} lux`;
    document.getElementById("dobui").textContent = `${latestData.Dash} µg/m³`;

    // Base hues: Red for temperature, Blue for humidity, Yellow for light
    updateColor("tp", latestData.temperature, 0, 45, 0); // Red
    updateColor("hm", latestData.humidity, 20, 100, 240); // Blue
    updateColor("lt", latestData.light, 0, 1024, 60); // Yellow
    updateColor("dash", latestData.Dash, 0, 1000, 120); // Green
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Call fetchDataAndUpdateUI every 5 seconds to update the UI
setInterval(fetchDataAndUpdateUI, 5000);

// Call it initially when the page loads
window.addEventListener("load", fetchDataAndUpdateUI);
