import React from "react";
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App";
import './index.css'

const domain = "dax-auth.us.auth0.com";
const clientId = "n4cFX9yFeE209waXu0N7YLaDnTWp2KD0";

createRoot(document.getElementById('root')).render(
  <Auth0Provider
    domain={domain}
    clientId={clientId}
    authorizationParams={{
      redirect_uri: window.location.origin,
    }}
  >
    <App />
  </Auth0Provider>
);
