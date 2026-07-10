import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { AppRouter } from "@/app/AppRouter";
import { ThemeProvider } from "@/hooks/use-theme";
import { ConfirmDialogProvider } from "@/hooks/use-confirm-dialog";
import { store, persistor } from "@/redux";

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <ConfirmDialogProvider>
            <BrowserRouter>
              <AppRouter />
            </BrowserRouter>
          </ConfirmDialogProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
