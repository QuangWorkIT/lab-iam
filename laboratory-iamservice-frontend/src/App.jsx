import { createBrowserRouter, RouterProvider } from "react-router-dom";
import routes from "./routes/Route";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./redux/store";
import { ToastContainer, Bounce } from 'react-toastify';
import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  const router = createBrowserRouter(routes);
  const clientid = "757411247793-11ciuarrirqp0m07eqhq8uubvgpdhois.apps.googleusercontent.com"
  return (
    <GoogleOAuthProvider clientId={clientid}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <RouterProvider router={router} />
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            transition={Bounce} />
        </PersistGate>
      </Provider>
    </GoogleOAuthProvider>
  );
}

export default App;
