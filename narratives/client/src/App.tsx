import "./App.css";
import TextNarrator from "./components/text-narrator/TextNarrator";
import { Toaster } from "sonner";

function App() {
  return (
    <div>
      {/*<ShapesAni /> */}
      <TextNarrator />
      <Toaster
        position="top-center"
        duration={5000}
        closeButton={true}
        visibleToasts={3}
        gap={10}
        offset={{ top: 10, right: 10 }}
        swipeDirections={["top", "right", "bottom", "left"]}
        icons={{ success: "👍", info: "ℹ️", warning: "⚠️", error: "❌" }}
        containerAriaLabel="Toast Container"
      />
    </div>
  );
}

export default App;
