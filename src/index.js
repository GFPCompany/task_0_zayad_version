import React from "react";
import ReactDOM from "react-dom/client";
import "./css/global.css";
import "./css/main.css";
import "./css/components.css";
import { App } from "./app";
import { ConfigProvider, theme } from "antd";
import { themeConfig } from "./ant.config";
import { Provider } from "react-redux";
import { store } from "./context/store";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: themeConfig.token,
        components: themeConfig.components,
      }}>
      <App />
    </ConfigProvider>
  </Provider>
);
